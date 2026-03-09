import { NextResponse } from "next/server";
import { getDuffelClient } from "@/src/server/duffel";

async function createIntent(amountStr: string, currencyStr: string, attempt = 1): Promise<{ id: string; client_token: string }> {
  const duffel = getDuffelClient();
  try {
    const pi = await duffel.paymentIntents.create({ amount: amountStr, currency: currencyStr });
    return { id: pi.data.id, client_token: pi.data.client_token };
  } catch (e: unknown) {
    const isNetworkError = e instanceof Error && !("errors" in e);
    if (isNetworkError && attempt < 3) {
      await new Promise((r) => setTimeout(r, 400 * attempt));
      return createIntent(amountStr, currencyStr, attempt + 1);
    }
    throw e;
  }
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    amount?: string | number;
    currency?: string;
  };

  const { amount, currency } = body;

  if (!amount || !currency) {
    return NextResponse.json(
      { error: "Amount and currency are required" },
      { status: 400 },
    );
  }

  const amountStr = Number(amount).toFixed(2);
  const currencyStr = String(currency).toUpperCase();

  try {
    const { id, client_token } = await createIntent(amountStr, currencyStr);
    return NextResponse.json({ client_secret: client_token, payment_intent_id: id });
  } catch (e: unknown) {
    const duffelErr = e as { errors?: Array<{ message?: string }>; meta?: { status?: number; request_id?: string } };
    const message =
      duffelErr?.errors?.[0]?.message ||
      (e instanceof Error ? e.message : "Failed to create payment intent");
    console.error("[payment-intent] Duffel error:", message, duffelErr?.meta);
    return NextResponse.json(
      { error: message, request_id: duffelErr?.meta?.request_id },
      { status: duffelErr?.meta?.status || 500 },
    );
  }
}
