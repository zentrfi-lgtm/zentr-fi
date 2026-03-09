import { NextResponse } from "next/server";
import { getDuffelClient, getDuffelToken } from "@/src/server/duffel";
import { getDb } from "@/src/server/mongodb";
import type { BookingDetails } from "@/src/types/travel";
import { sendBookingConfirmationEmail } from "@/src/server/mailer";
import { connectDB } from "@/src/server/mongo";
import { TripSession } from "@/src/server/models/TripSession";
import type { IMessage, ITravelOption } from "@/src/server/models/TripSession";

const SIMULATED_ID = "simulated-payment-intent";
const DUFFEL_API = "https://api.duffel.com";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 600;

/** Generic retry-aware raw call to the Duffel REST API.
 *  Retries up to MAX_RETRIES times on network-level errors (no HTTP response). */
async function duffelFetch<T>(
  method: "GET" | "POST",
  path: string,
  body?: unknown,
  attempt = 1,
): Promise<T> {
  const token = getDuffelToken();
  let res: Response;

  try {
    res = await fetch(`${DUFFEL_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Duffel-Version": "v2",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...(body !== undefined ? { body: JSON.stringify({ data: body }) } : {}),
    });
  } catch (networkErr) {
    // Network-level failure (DNS/TCP) — retry with back-off
    if (attempt < MAX_RETRIES) {
      console.warn(
        `[book-flight] network error on ${method} ${path} (attempt ${attempt}), retrying…`,
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
      return duffelFetch<T>(method, path, body, attempt + 1);
    }
    throw networkErr;
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = Object.assign(
      new Error(json?.errors?.[0]?.message || `Duffel ${res.status}`),
      {
        errors: json?.errors,
        meta: {
          status: res.status,
          request_id: res.headers.get("x-request-id") ?? undefined,
        },
      },
    );
    throw err;
  }
  return json.data as T;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    optionId?: string;
    details?: BookingDetails;
    paymentIntentId?: string;
    amount?: number;
    currency?: string;
    airline?: string;
    origin?: string;
    destination?: string;
    duration?: string;
    /** MongoDB persistence */
    walletAddress?: string;
    sessionId?: string;
    messages?: IMessage[];
    options?: ITravelOption[];
    selected?: ITravelOption;
    prompt?: string;
    flightMeta?: { airline?: string; route?: string; stops?: string; duration?: string };
  };

  const {
    optionId, details, paymentIntentId, amount, currency,
    airline, origin, destination, duration,
    walletAddress, sessionId, messages, options, selected,
  } = body;
  const prompt = body.prompt ?? "";
  const flightMeta = body.flightMeta;

  console.log("[book-flight] received:", {
    optionId,
    paymentIntentId,
    amount,
    currency,
    isSimulated: paymentIntentId === SIMULATED_ID,
  });

  if (!optionId || !details || !paymentIntentId) {
    return NextResponse.json(
      { error: "optionId, details, and paymentIntentId are required" },
      { status: 400 },
    );
  }

  // Always use balance payment in test/simulation mode (no real funds).
  // Switch to false and use payment_intent type when going live.
  const isSimulated = true;

  try {
    const duffel = getDuffelClient();

    // Confirm the real payment intent (skip if already confirmed by duffel-payments component).
    if (!isSimulated) {
      try {
        await duffel.paymentIntents.confirm(paymentIntentId);
      } catch (confirmErr) {
        console.warn(
          "[book-flight] paymentIntent.confirm skipped:",
          (confirmErr as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message ??
            (confirmErr instanceof Error ? confirmErr.message : String(confirmErr)),
        );
      }
    }

    // Fetch the offer (with retry) to get the Duffel passenger ID required by orders.create.
    const offer = await duffelFetch<{ passengers: Array<{ id: string }> }>(
      "GET",
      `/air/offers/${optionId}`,
    );
    const passengerId = offer.passengers?.[0]?.id;

    if (!passengerId) {
      return NextResponse.json(
        { error: "Could not resolve passenger ID from offer" },
        { status: 422 },
      );
    }

    const amountStr = Number(amount ?? 0).toFixed(2);
    const currencyStr = (currency ?? "USD").toUpperCase();

    const paymentRecord = isSimulated
      ? { type: "balance", amount: amountStr, currency: currencyStr }
      : { type: "payment_intent", id: paymentIntentId, amount: amountStr, currency: currencyStr };

    console.log("[book-flight] payment record:", JSON.stringify(paymentRecord));

    // Create the order via raw fetch so the payload is sent verbatim (bypasses
    // SDK discriminated-union type filtering for the payments array).
    const orderData = await duffelFetch<{ id: string }>("POST", "/air/orders", {
      selected_offers: [optionId],
      passengers: [
        {
          id: passengerId,
          born_on: details.dateOfBirth,
          email: details.email,
          family_name:
            details.fullLegalName.split(" ").slice(-1)[0] || details.fullLegalName,
          gender: details.gender.toLowerCase(),
          given_name:
            details.fullLegalName.split(" ").slice(0, -1).join(" ") ||
            details.fullLegalName,
          phone_number: details.phone,
          title: "mr",
        },
      ],
      payments: [paymentRecord],
    });

    // Persist / update the trip session in MongoDB via Mongoose (non-blocking)
    if (walletAddress && details) {
      const confirmationDoc = {
        confirmationId: orderData.id,
        receiptEmailSentTo: details.email,
      };
      connectDB()
        .then(() => {
          if (sessionId) {
            return TripSession.findByIdAndUpdate(sessionId, {
              $set: { confirmation: confirmationDoc },
            });
          }
          // Fallback: create a new session if the client didn't pre-create one
          return TripSession.create({
            walletAddress: walletAddress.toLowerCase(),
            prompt: "",
            messages: messages ?? [],
            options: options ?? [],
            selected: selected ?? null,
            confirmation: confirmationDoc,
          });
        })
        .catch((dbErr: unknown) => {
          console.error("[book-flight] DB save error:", dbErr);
        });
    }

    // Also persist booking to MongoDB bookings collection for trip history
    try {
      const db = await getDb();
      await db.collection("bookings").insertOne({
        confirmationId: orderData.id,
        walletAddress: walletAddress?.toLowerCase() ?? null,
        prompt,
        optionId,
        airline: flightMeta?.airline ?? airline ?? null,
        route: flightMeta?.route ?? null,
        stops: flightMeta?.stops ?? null,
        duration: flightMeta?.duration ?? duration ?? null,
        priceUsd: Number(amount ?? 0),
        currency: (currency ?? "USD").toUpperCase(),
        passengerName: details.fullLegalName,
        email: details.email,
        status: "confirmed",
        createdAt: new Date(),
      });
    } catch (dbErr) {
      // Non-blocking — booking succeeded even if history save fails
      console.warn("[book-flight] failed to save to MongoDB:", dbErr);
    }

    // Send booking confirmation email (non-blocking — don't fail the booking if email fails)
    sendBookingConfirmationEmail({
      to: details.email,
      confirmationId: orderData.id,
      fullLegalName: details.fullLegalName,
      dateOfBirth: details.dateOfBirth,
      email: details.email,
      phone: details.phone,
      residentialAddress: details.residentialAddress,
      amount: Number(amount ?? 0),
      currency: currencyStr,
      airline: airline ?? "—",
      origin: origin ?? "—",
      destination: destination ?? "—",
      duration: duration ?? "—",
    }).catch((mailErr) => {
      console.error("[book-flight] failed to send confirmation email:", mailErr?.message ?? mailErr);
    });

    return NextResponse.json({
      confirmationId: orderData.id,
      receiptEmailSentTo: details.email,
      sessionId: sessionId ?? null,
    });
  } catch (e: unknown) {
    const duffelErr = e as {
      errors?: Array<{ message?: string; code?: string }>;
      meta?: { status?: number; request_id?: string };
    };
    const firstMsg = duffelErr?.errors?.[0]?.message;
    const message =
      firstMsg || (e instanceof Error ? e.message : "Failed to book flight");
    console.error("[book-flight] error:", message, duffelErr?.meta, duffelErr?.errors);
    return NextResponse.json(
      { error: message, request_id: duffelErr?.meta?.request_id },
      { status: duffelErr?.meta?.status || 500 },
    );
  }
}
