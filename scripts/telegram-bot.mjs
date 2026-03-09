#!/usr/bin/env node
/**
 * ZentrFi Telegram Bot
 * Mirrors the dashboard chat flow exactly:
 *   1. /api/plan-trip   → parse user message (origin, destination, date)
 *   2. /api/flights/places → resolve city names to IATA codes
 *   3. /api/flights/search → real-time Duffel flight search
 *   4. Show results with prices, airlines, duration
 *   5. Inline keyboard buttons for airport selection when ambiguous
 */

import { Bot, InlineKeyboard } from "grammy";

// ── Config ──
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_URL = process.env.ZENTRFI_API_URL || "http://localhost:3000";

if (!TELEGRAM_TOKEN) { console.error("Missing TELEGRAM_BOT_TOKEN"); process.exit(1); }

const bot = new Bot(TELEGRAM_TOKEN);

// Pending searches keyed by chat id — stores partial state when user needs to pick an airport
const pendingSearches = new Map();

// ── API helpers (same endpoints the dashboard uses) ──

async function planTrip(prompt) {
  const res = await fetch(`${API_URL}/api/plan-trip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.reason || json?.error || "Failed to parse trip");
  return json;
}

async function suggestPlaces(query) {
  const res = await fetch(`${API_URL}/api/flights/places?q=${encodeURIComponent(query)}`);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Failed to look up places");
  return json.places || [];
}

async function searchFlights(originIata, destinationIata, departureDate) {
  const res = await fetch(`${API_URL}/api/flights/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      origin_iata: originIata,
      destination_iata: destinationIata,
      departure_date: departureDate,
      passengers: 1,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Flight search failed");
  return json;
}

// ── Resolve a city/state name to IATA code(s) ──

// Strip US state abbreviations and clean up
function cleanCityName(raw) {
  return raw
    .replace(/\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/gi, "")
    .replace(/,/g, "")
    .trim();
}

async function resolveIataWithSuggestions(rawName) {
  const cleaned = cleanCityName(rawName);
  const lower = cleaned.toLowerCase().trim();

  // If it looks like an IATA code already (3 letters)
  if (/^[A-Z]{3}$/i.test(cleaned.trim())) {
    return { resolved: cleaned.trim().toUpperCase(), suggestions: [] };
  }

  // Try the places API for suggestions
  try {
    const places = await suggestPlaces(cleaned);
    const airports = places.filter(p => p.iata_code);

    if (airports.length === 0) {
      // Try the original name too
      const places2 = await suggestPlaces(rawName);
      const airports2 = places2.filter(p => p.iata_code);
      if (airports2.length === 1) {
        return { resolved: airports2[0].iata_code, suggestions: [] };
      }
      if (airports2.length > 1) {
        return { resolved: null, suggestions: airports2.slice(0, 5) };
      }
      return { resolved: null, suggestions: [] };
    }

    if (airports.length === 1) {
      return { resolved: airports[0].iata_code, suggestions: [] };
    }

    // Multiple airports — auto-pick the first one but also return suggestions
    // If the first result is a clear match (city airport), just use it
    const exactCity = airports.find(a =>
      a.city_name?.toLowerCase() === lower ||
      a.name?.toLowerCase().includes(lower)
    );
    if (exactCity) {
      return { resolved: exactCity.iata_code, suggestions: [] };
    }

    // Multiple options — return suggestions for user to pick
    return { resolved: null, suggestions: airports.slice(0, 5) };
  } catch {
    return { resolved: null, suggestions: [] };
  }
}

// ── Format flight results ──
function formatResults(offers, originIata, destIata, date) {
  if (!offers || offers.length === 0) {
    return `No flights found from ${originIata} to ${destIata} on ${date}.\n\nTry a different date or search on the dashboard: https://www.zentrifi.xyz`;
  }

  const top = offers.slice(0, 6);
  let msg = `✈️ <b>${originIata} → ${destIata}</b>  ·  📅 ${date}\n\n`;

  top.forEach((o, i) => {
    const price = typeof o.priceUsd === "number" ? `$${o.priceUsd.toFixed(2)}` : `$${o.priceUsd}`;
    msg += `<b>${i + 1}. ${o.airline}</b> — ${price}\n`;
    msg += `   ${o.stops || "Direct"} · ${o.duration || ""}\n\n`;
  });

  msg += `💳 <b>Book with crypto:</b> <a href="https://www.zentrifi.xyz">zentrifi.xyz</a>`;
  return msg;
}

// ── Run a full flight search and send results ──
async function runSearch(ctx, originIata, destIata, flightDate) {
  await ctx.api.sendChatAction(ctx.chat.id, "typing");
  const data = await searchFlights(originIata, destIata, flightDate);
  const msg = formatResults(data.offers, originIata, destIata, flightDate);
  await ctx.reply(msg, { parse_mode: "HTML", link_preview_options: { is_disabled: true } });
}

// ── Build inline keyboard for airport suggestions ──
function airportKeyboard(airports, prefix) {
  const kb = new InlineKeyboard();
  for (const a of airports) {
    const label = `${a.iata_code} — ${a.name}${a.city_name ? ` (${a.city_name})` : ""}`;
    kb.text(label, `${prefix}:${a.iata_code}`).row();
  }
  return kb;
}

// ── Bot handlers ──

bot.command("start", (ctx) =>
  ctx.reply(
    "✈️ <b>ZentrFi Travel Bot</b>\n\n" +
    "Search real-time flights right here! Just tell me your trip:\n\n" +
    "• <i>\"Flights from Atlanta to Miami\"</i>\n" +
    "• <i>\"NYC to London on 2026-03-20\"</i>\n" +
    "• <i>\"I want to travel from Florida to New York\"</i>\n\n" +
    "Powered by Duffel API · Book with crypto at zentrifi.xyz",
    { parse_mode: "HTML" }
  )
);

// Handle inline button presses (airport selection)
bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;
  const chatId = ctx.chat?.id;

  await ctx.answerCallbackQuery();

  if (!chatId || !pendingSearches.has(chatId)) {
    return ctx.reply("Session expired. Please send your trip request again.");
  }

  const pending = pendingSearches.get(chatId);

  if (data.startsWith("origin:")) {
    const iata = data.split(":")[1];
    pending.originIata = iata;

    // If destination also needs resolving
    if (!pending.destIata && pending.destSuggestions?.length > 0) {
      await ctx.reply(
        `✅ Origin: <b>${iata}</b>\n\nNow pick your destination airport:`,
        {
          parse_mode: "HTML",
          reply_markup: airportKeyboard(pending.destSuggestions, "dest"),
        }
      );
      return;
    }

    // If destination already resolved, search
    if (pending.destIata) {
      await ctx.reply(`✅ Origin: <b>${iata}</b> → Destination: <b>${pending.destIata}</b>`, { parse_mode: "HTML" });
      pendingSearches.delete(chatId);
      try {
        await runSearch(ctx, iata, pending.destIata, pending.flightDate);
      } catch (err) {
        await ctx.reply(`❌ ${err.message}`);
      }
      return;
    }
  }

  if (data.startsWith("dest:")) {
    const iata = data.split(":")[1];
    pending.destIata = iata;

    if (pending.originIata) {
      await ctx.reply(`✅ ${pending.originIata} → <b>${iata}</b>`, { parse_mode: "HTML" });
      pendingSearches.delete(chatId);
      try {
        await runSearch(ctx, pending.originIata, iata, pending.flightDate);
      } catch (err) {
        await ctx.reply(`❌ ${err.message}`);
      }
      return;
    }
  }
});

bot.on("message:text", async (ctx) => {
  const userMsg = ctx.message.text;
  if (userMsg.startsWith("/")) return;

  await ctx.api.sendChatAction(ctx.chat.id, "typing");

  try {
    // Step 1: Parse the trip (same as /api/plan-trip on dashboard)
    const planResult = await planTrip(userMsg);

    if (!planResult.ok) {
      return ctx.reply(
        "I couldn't understand that trip. Try something like:\n<i>\"Flights from Atlanta to Miami\"</i>\n<i>\"NYC to London on March 20\"</i>",
        { parse_mode: "HTML" }
      );
    }

    const { origin, destination, date } = planResult.parsed;
    const defaultDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    const flightDate = date || defaultDate;

    await ctx.reply(
      `🔍 Searching <b>${origin}</b> → <b>${destination}</b> on ${flightDate}...`,
      { parse_mode: "HTML" }
    );
    await ctx.api.sendChatAction(ctx.chat.id, "typing");

    // Step 2: Resolve both cities to IATA codes
    const [originResult, destResult] = await Promise.all([
      resolveIataWithSuggestions(origin),
      resolveIataWithSuggestions(destination),
    ]);

    const needsOriginPick = !originResult.resolved && originResult.suggestions.length > 0;
    const needsDestPick = !destResult.resolved && destResult.suggestions.length > 0;
    const originFailed = !originResult.resolved && originResult.suggestions.length === 0;
    const destFailed = !destResult.resolved && destResult.suggestions.length === 0;

    // If either completely failed (no suggestions at all)
    if (originFailed || destFailed) {
      const failedName = originFailed ? origin : destination;
      return ctx.reply(
        `Couldn't find airports for "<b>${failedName}</b>".\n\nTry using city names or IATA codes:\n<i>\"Atlanta to Miami\"</i> or <i>\"ATL to MIA\"</i>`,
        { parse_mode: "HTML" }
      );
    }

    // If we need the user to pick airports, show buttons
    if (needsOriginPick || needsDestPick) {
      pendingSearches.set(ctx.chat.id, {
        originIata: originResult.resolved || null,
        destIata: destResult.resolved || null,
        destSuggestions: needsDestPick ? destResult.suggestions : null,
        flightDate,
      });

      if (needsOriginPick) {
        await ctx.reply(
          `Multiple airports found for "<b>${origin}</b>". Pick one:`,
          {
            parse_mode: "HTML",
            reply_markup: airportKeyboard(originResult.suggestions, "origin"),
          }
        );
        return;
      }

      if (needsDestPick) {
        await ctx.reply(
          `Multiple airports found for "<b>${destination}</b>". Pick one:`,
          {
            parse_mode: "HTML",
            reply_markup: airportKeyboard(destResult.suggestions, "dest"),
          }
        );
        return;
      }
    }

    // Both resolved — search immediately
    await runSearch(ctx, originResult.resolved, destResult.resolved, flightDate);

  } catch (err) {
    console.error("[bot] Error:", err.message);
    await ctx.reply(
      `❌ ${err.message}\n\nTry again or search directly at https://www.zentrifi.xyz`
    );
  }
});

// ── Start ──
console.log("[ZentrFi Bot] Starting...");
console.log("[ZentrFi Bot] API:", API_URL);
bot.start({
  onStart: (info) => console.log(`[ZentrFi Bot] @${info.username} is live!`),
});
