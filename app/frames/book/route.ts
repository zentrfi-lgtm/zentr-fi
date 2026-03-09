import { NextRequest, NextResponse } from "next/server";
import { FF_FRAMES_V2 } from "@/src/lib/featureFlags";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function baseUrl(req: NextRequest): string {
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

/** Return a minimal HTML page whose only purpose is to carry `fc:frame` meta tags. */
function frameHtml(metas: Record<string, string>): Response {
  const metaTags = Object.entries(metas)
    .map(([property, content]) => `<meta property="${property}" content="${content}" />`)
    .join("\n    ");

  const html = `<!DOCTYPE html>
<html>
  <head>
    ${metaTags}
    <title>Zentrfi Frames</title>
  </head>
  <body></body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * Parse a user-supplied route string like "LAX to JFK" or "lax-jfk" into
 * origin / destination IATA codes. Returns null when the input is not parseable.
 */
function parseRoute(input: string): { origin: string; destination: string } | null {
  const cleaned = input.trim().toUpperCase();

  // "LAX to JFK", "LAX - JFK", "LAX -> JFK", "LAX>JFK"
  const match = cleaned.match(/^([A-Z]{3})\s*(?:TO|->?|>|–|—)\s*([A-Z]{3})$/);
  if (match) return { origin: match[1], destination: match[2] };

  // "LAXJFK" — two three-letter codes jammed together
  if (/^[A-Z]{6}$/.test(cleaned)) {
    return { origin: cleaned.slice(0, 3), destination: cleaned.slice(3) };
  }

  return null;
}

// ---------------------------------------------------------------------------
// GET — Initial frame (Step 1)
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const base = baseUrl(req);

  if (!FF_FRAMES_V2) {
    return frameHtml({
      "fc:frame": "vNext",
      "fc:frame:image": `${base}/frames/book/image?step=coming-soon`,
      "fc:frame:button:1": "Coming Soon",
    });
  }

  return frameHtml({
    "fc:frame": "vNext",
    "fc:frame:image": `${base}/frames/book/image?step=search`,
    "fc:frame:input:text": "Where to? (e.g. LAX to JFK)",
    "fc:frame:button:1": "Search Flights",
    "fc:frame:post_url": `${base}/frames/book`,
  });
}

// ---------------------------------------------------------------------------
// POST — Handle button presses (Steps 2 & 3)
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const base = baseUrl(req);

  if (!FF_FRAMES_V2) {
    return frameHtml({
      "fc:frame": "vNext",
      "fc:frame:image": `${base}/frames/book/image?step=coming-soon`,
      "fc:frame:button:1": "Coming Soon",
    });
  }

  // Farcaster sends a JSON body with untrustedData.inputText & untrustedData.buttonIndex
  let inputText = "";
  let buttonIndex = 1;

  try {
    const body = await req.json();
    inputText = body?.untrustedData?.inputText ?? "";
    buttonIndex = body?.untrustedData?.buttonIndex ?? 1;
  } catch {
    // Malformed body — fall through to step 1
  }

  // ---- Step 3: User clicked "Book Now" from the results frame ----
  const url = new URL(req.url);
  const stepParam = url.searchParams.get("step");

  if (stepParam === "confirm") {
    const route = url.searchParams.get("route") ?? "";
    const price = url.searchParams.get("price") ?? "";
    const airline = url.searchParams.get("airline") ?? "";

    return frameHtml({
      "fc:frame": "vNext",
      "fc:frame:image": `${base}/frames/book/image?step=confirmation&route=${encodeURIComponent(route)}&price=${encodeURIComponent(price)}&airline=${encodeURIComponent(airline)}`,
      "fc:frame:button:1": "Open Zentrfi",
      "fc:frame:button:1:action": "link",
      "fc:frame:button:1:target": `${base}/miniapp`,
      "fc:frame:button:2": "Search Again",
      "fc:frame:post_url": `${base}/frames/book`,
    });
  }

  // ---- Step 3 trigger: "Search Again" from confirmation ----
  if (stepParam === "confirm" && buttonIndex === 2) {
    return frameHtml({
      "fc:frame": "vNext",
      "fc:frame:image": `${base}/frames/book/image?step=search`,
      "fc:frame:input:text": "Where to? (e.g. LAX to JFK)",
      "fc:frame:button:1": "Search Flights",
      "fc:frame:post_url": `${base}/frames/book`,
    });
  }

  // ---- Step 2: Parse route and show results ----
  if (inputText) {
    const parsed = parseRoute(inputText);

    if (!parsed) {
      return frameHtml({
        "fc:frame": "vNext",
        "fc:frame:image": `${base}/frames/book/image?step=error&message=${encodeURIComponent("Could not parse route. Try: LAX to JFK")}`,
        "fc:frame:input:text": "Where to? (e.g. LAX to JFK)",
        "fc:frame:button:1": "Search Flights",
        "fc:frame:post_url": `${base}/frames/book`,
      });
    }

    // Call the internal flight search API
    const departureDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    try {
      const searchRes = await fetch(`${base}/api/flights/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_iata: parsed.origin,
          destination_iata: parsed.destination,
          departure_date: departureDate,
          passengers: 1,
        }),
      });

      if (!searchRes.ok) {
        const errBody = await searchRes.json().catch(() => ({ error: "Search failed" }));
        throw new Error(errBody.error || "Search failed");
      }

      const data = await searchRes.json();
      const topOffers = (data.offers ?? []).slice(0, 3);

      if (topOffers.length === 0) {
        return frameHtml({
          "fc:frame": "vNext",
          "fc:frame:image": `${base}/frames/book/image?step=no-results&route=${encodeURIComponent(`${parsed.origin} to ${parsed.destination}`)}`,
          "fc:frame:input:text": "Try another route (e.g. SFO to ORD)",
          "fc:frame:button:1": "Search Flights",
          "fc:frame:post_url": `${base}/frames/book`,
        });
      }

      // Build results frame with up to 3 flight options as buttons
      const route = `${parsed.origin} to ${parsed.destination}`;
      const offerSummaries = topOffers.map(
        (o: { airline: string; priceUsd: number; duration: string; stops: string }) =>
          `${o.airline}|$${o.priceUsd}|${o.duration}|${o.stops}`,
      );

      const metas: Record<string, string> = {
        "fc:frame": "vNext",
        "fc:frame:image": `${base}/frames/book/image?step=results&route=${encodeURIComponent(route)}&offers=${encodeURIComponent(JSON.stringify(offerSummaries))}&date=${encodeURIComponent(departureDate)}`,
      };

      topOffers.forEach(
        (o: { airline: string; priceUsd: number }, idx: number) => {
          const btnNum = idx + 1;
          metas[`fc:frame:button:${btnNum}`] = `${o.airline} — $${o.priceUsd}`;
          metas[`fc:frame:button:${btnNum}:action`] = "post";
          metas[`fc:frame:button:${btnNum}:target`] =
            `${base}/frames/book?step=confirm&route=${encodeURIComponent(route)}&price=${o.priceUsd}&airline=${encodeURIComponent(o.airline)}`;
        },
      );

      // Add a "Search Again" button
      const searchAgainIdx = topOffers.length + 1;
      metas[`fc:frame:button:${searchAgainIdx}`] = "New Search";
      metas[`fc:frame:post_url`] = `${base}/frames/book`;

      return frameHtml(metas);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Flight search failed";
      return frameHtml({
        "fc:frame": "vNext",
        "fc:frame:image": `${base}/frames/book/image?step=error&message=${encodeURIComponent(message)}`,
        "fc:frame:input:text": "Where to? (e.g. LAX to JFK)",
        "fc:frame:button:1": "Search Flights",
        "fc:frame:post_url": `${base}/frames/book`,
      });
    }
  }

  // Fallback: show step 1 again
  return frameHtml({
    "fc:frame": "vNext",
    "fc:frame:image": `${base}/frames/book/image?step=search`,
    "fc:frame:input:text": "Where to? (e.g. LAX to JFK)",
    "fc:frame:button:1": "Search Flights",
    "fc:frame:post_url": `${base}/frames/book`,
  });
}
