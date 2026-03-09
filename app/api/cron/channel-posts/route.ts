import { NextResponse } from "next/server";
import { postCast } from "@/src/lib/bot/caster";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.zentrfi.com";

const CHANNELS = ["travel", "base"] as const;

type MarketRoute = {
  id: string;
  from: string;
  to: string;
  duration: string;
  priceUsd: number;
};

function formatChannelPost(routes: MarketRoute[]): string {
  if (routes.length === 0) return "";

  const sorted = [...routes].sort((a, b) => a.priceUsd - b.priceUsd);
  const lines: string[] = [];

  lines.push("Today's best flight deals:");
  lines.push("");

  for (const r of sorted.slice(0, 4)) {
    lines.push(`${r.from} -> ${r.to}  $${r.priceUsd}  ${r.duration}`);
  }

  lines.push("");
  lines.push("Search and book directly in Warpcast with Zentrfi.");

  return lines.join("\n");
}

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized triggers
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch market data
    const marketRes = await fetch(`${APP_URL}/api/flights/market`);
    const marketData = await marketRes.json();
    const routes: MarketRoute[] = marketData.routes || [];

    if (routes.length === 0) {
      return NextResponse.json({ ok: true, skipped: true, reason: "No market data available" });
    }

    const text = formatChannelPost(routes);
    const embeds = [{ url: `${APP_URL}/miniapp` }];
    const posted: string[] = [];

    for (const channel of CHANNELS) {
      try {
        const hash = await postCast(text, embeds, channel);
        posted.push(`${channel}: ${hash}`);
      } catch (err) {
        console.error(`[channel-posts] Failed to post to /${channel}:`, err);
      }
    }

    return NextResponse.json({ ok: true, posted });
  } catch (err) {
    console.error("[channel-posts] Failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to post" },
      { status: 500 },
    );
  }
}
