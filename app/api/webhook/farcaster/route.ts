import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { botConfig } from "@/src/lib/bot/config";
import { parseTravelQuery } from "@/src/lib/bot/parser";
import { searchFlights } from "@/src/lib/bot/travel";
import { formatCastReply } from "@/src/lib/bot/formatter";
import { replyCast } from "@/src/lib/bot/caster";

export async function POST(req: Request) {
  const rawBody = await req.text();

  // Verify Neynar webhook signature
  const sig = req.headers.get("x-neynar-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const hmac = crypto
    .createHmac("sha512", botConfig.webhookSecret())
    .update(rawBody)
    .digest("hex");

  if (hmac !== sig) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);

  if (payload.type !== "cast.created") {
    return NextResponse.json({ ok: true });
  }

  const cast = payload.data;
  const castText: string = cast.text ?? "";
  const castHash: string = cast.hash;
  const authorFid: number = cast.author?.fid;

  console.log(`[mention] fid=${authorFid} hash=${castHash} text="${castText}"`);

  // Process the mention (don't await — respond to webhook fast)
  handleMention(castText, castHash).catch((err) =>
    console.error("[error] Failed to handle mention:", err)
  );

  return NextResponse.json({ ok: true });
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.zentrfi.com";

function buildMiniAppUrl(query: { origin: string; destination: string; date: string | null }): string {
  const params = new URLSearchParams();
  params.set("from", query.origin);
  params.set("to", query.destination);
  if (query.date) params.set("date", query.date);
  return `${APP_URL}/miniapp?${params.toString()}`;
}

async function handleMention(castText: string, parentHash: string) {
  const parsed = await parseTravelQuery(castText);

  if (!parsed.ok) {
    await replyCast(
      parentHash,
      `I couldn't understand that. Try something like:\n\n"@zentrfi Florida to California on March 10, budget $400"`,
      [{ url: `${APP_URL}/miniapp` }],
    );
    return;
  }

  const options = searchFlights(parsed.data);

  if (options.length === 0) {
    await replyCast(
      parentHash,
      `No flights found for ${parsed.data.origin} to ${parsed.data.destination}. Try a different route!`,
      [{ url: `${APP_URL}/miniapp` }],
    );
    return;
  }

  const reply = formatCastReply(options, parsed.data);
  const miniAppUrl = buildMiniAppUrl(parsed.data);
  await replyCast(parentHash, reply, [{ url: miniAppUrl }]);
}
