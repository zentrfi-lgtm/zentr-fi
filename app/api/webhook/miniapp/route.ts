import { NextResponse } from "next/server";

type NotificationToken = { token: string; url: string };

// In-memory store for MVP. Replace with a database for production.
const tokenStore = new Map<number, NotificationToken>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, fid, notificationDetails } = body;

    switch (event) {
      case "frame_added":
      case "notifications_enabled":
        if (notificationDetails?.token && notificationDetails?.url) {
          tokenStore.set(fid, {
            token: notificationDetails.token,
            url: notificationDetails.url,
          });
        }
        break;
      case "frame_removed":
      case "notifications_disabled":
        tokenStore.delete(fid);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export function getTokenStore() {
  return tokenStore;
}
