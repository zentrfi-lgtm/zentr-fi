import { NextResponse } from "next/server";

type State = { name: string };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const countryName = url.searchParams.get("country") || "";

  if (!countryName) {
    return NextResponse.json({ states: [] as State[] });
  }

  try {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ country: countryName }),
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) throw new Error("Failed to fetch states");
    const json = (await res.json()) as { data?: { states?: Array<{ name: string }> } };
    const states = (json.data?.states || []).map((s) => ({ name: s.name }));
    return NextResponse.json({ states });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load states" },
      { status: 502 },
    );
  }
}

