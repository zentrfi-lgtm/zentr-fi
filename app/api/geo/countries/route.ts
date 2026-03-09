import { NextResponse } from "next/server";

type Country = { code: string; name: string };

export async function GET() {
  try {
    const res = await fetch("https://restcountries.com/v3.1/all?fields=cca2,name", {
      // cache for 1 day
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) throw new Error("Failed to fetch countries");
    const json = (await res.json()) as Array<{ cca2: string; name?: { common?: string } }>;
    const countries: Country[] = json
      .map((c) => ({ code: c.cca2, name: c.name?.common || c.cca2 }))
      .filter((c) => Boolean(c.code && c.name))
      .sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ countries });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load countries" },
      { status: 502 },
    );
  }
}

