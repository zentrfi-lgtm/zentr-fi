import { NextResponse } from "next/server";
import { getDuffelClient } from "@/src/server/duffel";

function isoDateOrNull(v: unknown) {
  if (typeof v !== "string") return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

function parsePassengers(v: unknown) {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : 1;
  return Number.isFinite(n) && n > 0 && n <= 9 ? Math.floor(n) : 1;
}

function durationFromSegments(segments: Array<{ departing_at: string; arriving_at: string }>) {
  if (!segments.length) return "—";
  const start = new Date(segments[0].departing_at).getTime();
  const end = new Date(segments[segments.length - 1].arriving_at).getTime();
  const minutes = Math.max(0, Math.round((end - start) / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    origin_iata?: string;
    destination_iata?: string;
    departure_date?: string;
    passengers?: number;
  };

  const origin = (body.origin_iata || "").toUpperCase().trim();
  const destination = (body.destination_iata || "").toUpperCase().trim();
  const passengers = parsePassengers(body.passengers);
  const departure_date = isoDateOrNull(body.departure_date) || new Date().toISOString().slice(0, 10);

  if (!origin || !destination) {
    return NextResponse.json(
      { error: "origin_iata and destination_iata are required" },
      { status: 400 },
    );
  }

  try {
    const duffel = getDuffelClient();
    const offerReq = await duffel.offerRequests.create({
      slices: [{ origin, destination, departure_date, arrival_time: null, departure_time: null }],
      passengers: Array.from({ length: passengers }, () => ({ type: "adult" as const })),
      cabin_class: "economy",
      return_offers: true,
    });

    const offers = offerReq.data.offers ?? [];

    const normalized = offers.slice(0, 12).map((o) => {
      const slice = o.slices?.[0];
      const segments = slice?.segments ?? [];
      const stops = Math.max(0, segments.length - 1);
      const duration = durationFromSegments(
        segments.map((s) => ({ departing_at: s.departing_at, arriving_at: s.arriving_at })),
      );

      return {
        id: o.id,
        airline: o.owner?.name || o.owner?.iata_code || "Airline",
        priceUsd: o.total_currency === "USD" ? Number(o.total_amount) : Number(o.total_amount),
        currency: o.total_currency,
        stops: stops === 0 ? "Direct" : String(stops),
        duration,
        origin: {
          label: slice?.origin?.iata_code || origin,
          lat: (slice?.origin as unknown as { latitude?: number })?.latitude ?? null,
          lng: (slice?.origin as unknown as { longitude?: number })?.longitude ?? null,
        },
        destination: {
          label: slice?.destination?.iata_code || destination,
          lat: (slice?.destination as unknown as { latitude?: number })?.latitude ?? null,
          lng: (slice?.destination as unknown as { longitude?: number })?.longitude ?? null,
        },
      };
    });

    return NextResponse.json({ offers: normalized, offerRequestId: offerReq.data.id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Duffel search failed" },
      { status: 501 },
    );
  }
}

