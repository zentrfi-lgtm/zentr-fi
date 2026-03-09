import { NextResponse } from "next/server";
import { parseTravelQuery } from "@/src/lib/bot/parser";

export async function POST(req: Request) {
  const { prompt } = (await req.json().catch(() => ({}))) as { prompt?: string };
  const safePrompt = typeof prompt === "string" ? prompt : "";

  const parsed = await parseTravelQuery(safePrompt);

  // No dummy flight options here — UI asks the user to pick their current city/airport,
  // then we fetch real offers from Duffel.
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, reason: parsed.reason }, { status: 422 });
  }

  return NextResponse.json({ ok: true, parsed: parsed.data });
}

