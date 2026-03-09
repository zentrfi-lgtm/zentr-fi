import { NextResponse } from "next/server";
import { parseTravelQuery } from "@/src/lib/bot/parser";
import { searchFlights } from "@/src/lib/bot/travel";
import { formatCastReply } from "@/src/lib/bot/formatter";

export async function POST(req: Request) {
  const { text } = await req.json();

  const parsed = await parseTravelQuery(text ?? "");

  if (!parsed.ok) {
    return NextResponse.json({ error: "Could not parse", reason: parsed.reason });
  }

  const options = searchFlights(parsed.data);
  if (options.length === 0) {
    return NextResponse.json({ error: "No flights found", parsed: parsed.data });
  }

  const reply = formatCastReply(options, parsed.data);
  return NextResponse.json({ parsed: parsed.data, reply });
}
