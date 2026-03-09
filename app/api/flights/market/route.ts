import { NextResponse } from "next/server";
import { getDuffelClient } from "@/src/server/duffel";
import { DuffelError } from "@duffel/api";

type MarketRoute = {
  id: string;
  from: string;
  to: string;
  duration: string;
  priceUsd: number;
};

function durationFromSegments(segments: Array<{ departing_at: string; arriving_at: string }>) {
  if (!segments.length) return "—";
  const start = new Date(segments[0].departing_at).getTime();
  const end = new Date(segments[segments.length - 1].arriving_at).getTime();
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

async function getDuffelSnapshot(): Promise<MarketRoute[]> {
  const duffel = getDuffelClient();

  // Small list of common airports for a read-only snapshot.
  const pairs = [
    ["JFK", "LAX"],
    ["LAX", "SFO"],
    ["SFO", "SEA"],
    ["MIA", "JFK"],
    ["ORD", "DEN"],
    ["LAS", "LAX"],
  ] as const;

  const results: MarketRoute[] = [];

  for (const [from, to] of pairs.slice(0, 6)) {
    // Aim for a near-term date to increase likelihood of returned offers.
    const departure_date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
      .toISOString()
      .slice(0, 10);
    let offerReq: Awaited<ReturnType<typeof duffel.offerRequests.create>> | null = null;
    try {
      offerReq = await duffel.offerRequests.create({
        slices: [
          {
            origin: from,
            destination: to,
            departure_date,
            arrival_time: null,
            departure_time: null,
          },
        ],
        passengers: [{ type: "adult" as const }],
        cabin_class: "economy",
        return_offers: true,
        supplier_timeout: 12_000,
      });
    } catch (e) {
      // If auth is wrong, fail fast so the UI can show the real error.
      if (e instanceof DuffelError && (e.meta?.status === 401 || e.meta?.status === 403)) {
        throw e;
      }
      continue;
    }

    const offer = offerReq?.data?.offers?.[0];
    if (!offer) continue;
    const slice = offer.slices?.[0];
    const segments = (slice?.segments ?? []) as Array<{ departing_at: string; arriving_at: string }>;

    results.push({
      id: `${from}-${to}`,
      from,
      to,
      duration: durationFromSegments(
        segments.map((s: { departing_at: string; arriving_at: string }) => ({
          departing_at: s.departing_at,
          arriving_at: s.arriving_at,
        })),
      ),
      priceUsd: offer.total_currency === "USD" ? Number(offer.total_amount) : Number(offer.total_amount),
    });
  }

  return results;
}

export async function GET() {
  try {
    const routes = await getDuffelSnapshot();
    if (!routes.length) {
      return NextResponse.json({
        routes: [],
        warning:
          "No offers returned right now for the market snapshot routes. Try again, or search a specific route in the dashboard.",
      });
    }
    return NextResponse.json({ routes });
  } catch (e) {
    console.error("[market] Duffel snapshot failed:", e);
    if (e instanceof DuffelError) {
      const first = e.errors?.[0];
      return NextResponse.json(
        {
          error: first?.message || "Duffel error",
          code: first?.code,
          status: e.meta?.status,
          request_id: e.meta?.request_id,
          hint: "Verify NEXT_PUBLIC_DUFFEL_TOKEN (and restart the dev server after changing env vars).",
        },
        { status: e.meta?.status || 502 },
      );
    }
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Failed to load market snapshot",
        hint: "If you just set NEXT_PUBLIC_DUFFEL_TOKEN, restart the dev server.",
      },
      { status: 502 },
    );
  }
}

