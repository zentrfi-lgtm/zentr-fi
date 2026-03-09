import { NextRequest, NextResponse } from "next/server";
import { FF_TRIP_HISTORY } from "@/src/lib/featureFlags";
import { getDb } from "@/src/server/mongodb";
import { connectDB } from "@/src/server/mongo";
import { TripSession } from "@/src/server/models/TripSession";
import type { IMessage, ITravelOption, IConfirmation } from "@/src/server/models/TripSession";

/* ── GET /api/trip-history?wallet=0x…
   Returns all sessions for the given wallet, newest first.
   Uses Mongoose TripSession model (main) with feature-flag guard (sorrow).  */
export async function GET(req: NextRequest) {
  if (!FF_TRIP_HISTORY) {
    return NextResponse.json({ items: [] });
  }

  const wallet = req.nextUrl.searchParams.get("wallet")?.toLowerCase();

  if (!wallet) {
    return NextResponse.json({ items: [] });
  }

  try {
    await connectDB();
    const sessions = await TripSession.find({ walletAddress: wallet })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const items = sessions.map((s) => ({
      id:           String(s._id),
      createdAt:    s.createdAt.toISOString(),
      prompt:       s.prompt,
      messages:     s.messages,
      options:      s.options,
      selected:     s.selected ?? null,
      confirmation: s.confirmation ?? null,
    }));

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[trip-history] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

/* ── POST /api/trip-history
   Creates or updates a trip session for a wallet.
   Body: { walletAddress, prompt, messages, options, selected?, confirmation? }
   If `sessionId` is provided in the body, updates that document.  */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    sessionId?: string;
    walletAddress?: string;
    prompt?: string;
    messages?: IMessage[];
    options?: ITravelOption[];
    selected?: ITravelOption | null;
    confirmation?: IConfirmation | null;
  };

  const { sessionId, walletAddress, prompt, messages, options, selected, confirmation } = body;

  if (!walletAddress || !prompt) {
    return NextResponse.json(
      { error: "walletAddress and prompt are required" },
      { status: 400 },
    );
  }

  try {
    await connectDB();

    let session;

    if (sessionId) {
      // Update existing session
      session = await TripSession.findByIdAndUpdate(
        sessionId,
        { $set: { messages, options, selected: selected ?? null, confirmation: confirmation ?? null } },
        { new: true },
      );
      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    } else {
      // Create new session
      session = await TripSession.create({
        walletAddress: walletAddress.toLowerCase(),
        prompt,
        messages:    messages ?? [],
        options:     options  ?? [],
        selected:    selected ?? null,
        confirmation: confirmation ?? null,
      });
    }

    return NextResponse.json({ sessionId: String(session._id) });
  } catch (err) {
    console.error("[trip-history] POST error:", err);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}
