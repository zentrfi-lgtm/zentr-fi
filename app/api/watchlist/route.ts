import { NextResponse } from "next/server";

export type WatchedRoute = {
  fid: number;
  from: string;
  to: string;
  lastSeenPrice: number;
  createdAt: string;
};

// In-memory store for MVP. Replace with a database for production.
const watchlist: WatchedRoute[] = [];

export function getWatchlist(): WatchedRoute[] {
  return watchlist;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fid, from, to, lastSeenPrice } = body;

    if (!fid || !from || !to || typeof lastSeenPrice !== "number") {
      return NextResponse.json({ error: "Missing required fields: fid, from, to, lastSeenPrice" }, { status: 400 });
    }

    const fromIata = String(from).toUpperCase().trim();
    const toIata = String(to).toUpperCase().trim();

    // Don't duplicate
    const existing = watchlist.find(
      (w) => w.fid === fid && w.from === fromIata && w.to === toIata,
    );
    if (existing) {
      existing.lastSeenPrice = lastSeenPrice;
      return NextResponse.json({ ok: true, updated: true });
    }

    watchlist.push({
      fid,
      from: fromIata,
      to: toIata,
      lastSeenPrice,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, added: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fid = url.searchParams.get("fid");

  if (!fid) {
    return NextResponse.json({ error: "fid is required" }, { status: 400 });
  }

  const userWatches = watchlist.filter((w) => w.fid === Number(fid));
  return NextResponse.json({ watches: userWatches });
}
