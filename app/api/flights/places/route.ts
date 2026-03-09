import { NextResponse } from "next/server";
import { getDuffelClient } from "@/src/server/duffel";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q") || url.searchParams.get("query") || "";

  if (query.trim().length < 2) {
    return NextResponse.json({ places: [] });
  }

  try {
    const duffel = getDuffelClient();
    const res = await duffel.suggestions.list({ query });
    const places = res.data.map((p) => ({
      id: p.id,
      type: p.type,
      name: p.name,
      iata_code: p.iata_code,
      city_name: p.city_name,
      city: p.city,
      country_name: p.country_name,
      country_code: p.iata_country_code,
      latitude: p.latitude,
      longitude: p.longitude,
      time_zone: p.time_zone,
    }));

    return NextResponse.json({ places });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch places" },
      { status: 501 },
    );
  }
}

