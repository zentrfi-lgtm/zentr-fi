import { NextResponse } from "next/server";
import { getWatchlist } from "@/app/api/watchlist/route";
import { getTokenStore } from "@/app/api/webhook/miniapp/route";
import { sendFarcasterNotification } from "@/src/lib/notifications/farcaster";
import { getDuffelClient } from "@/src/server/duffel";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.zentrfi.com";

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const watchlist = getWatchlist();
  const tokenStore = getTokenStore();

  if (watchlist.length === 0) {
    return NextResponse.json({ ok: true, skipped: true, reason: "No watched routes" });
  }

  const duffel = getDuffelClient();
  const departureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
    .toISOString()
    .slice(0, 10);

  const alerts: string[] = [];

  // Group watches by route to avoid duplicate Duffel calls
  const routeMap = new Map<string, number[]>();
  for (const w of watchlist) {
    const key = `${w.from}-${w.to}`;
    if (!routeMap.has(key)) routeMap.set(key, []);
    routeMap.get(key)!.push(w.fid);
  }

  for (const [routeKey, fids] of routeMap) {
    const [from, to] = routeKey.split("-");

    try {
      const offerReq = await duffel.offerRequests.create({
        slices: [{ origin: from, destination: to, departure_date: departureDate, arrival_time: null, departure_time: null }],
        passengers: [{ type: "adult" as const }],
        cabin_class: "economy",
        return_offers: true,
        supplier_timeout: 12_000,
      });

      const cheapest = offerReq.data.offers
        ?.map((o) => Number(o.total_amount))
        .sort((a, b) => a - b)[0];

      if (!cheapest) continue;

      for (const fid of fids) {
        const watch = watchlist.find((w) => w.fid === fid && w.from === from && w.to === to);
        if (!watch) continue;

        const drop = watch.lastSeenPrice - cheapest;
        const dropPct = Math.round((drop / watch.lastSeenPrice) * 100);

        if (drop > 0 && dropPct >= 5) {
          // Price dropped at least 5%
          const tokenInfo = tokenStore.get(fid);
          if (tokenInfo) {
            const sent = await sendFarcasterNotification(
              tokenInfo,
              `Price Drop: ${from} -> ${to}`,
              `$${watch.lastSeenPrice} -> $${cheapest} (-${dropPct}%). Tap to book!`,
              `${APP_URL}/miniapp?from=${from}&to=${to}`,
            );
            if (sent) alerts.push(`${fid}: ${from}-${to} $${watch.lastSeenPrice}->$${cheapest}`);
          }

          // Update last seen price
          watch.lastSeenPrice = cheapest;
        }
      }
    } catch (err) {
      console.error(`[price-alerts] Failed to check ${routeKey}:`, err);
    }
  }

  return NextResponse.json({ ok: true, alertsSent: alerts.length, alerts });
}
