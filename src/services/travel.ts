import type { BookingDetails, ChatMessage, TravelOption, TripHistoryItem } from "@/src/types/travel";

export async function planTrip(prompt: string): Promise<{
  ok: true;
  parsed: { origin: string; destination: string; date: string | null; budget: number | null };
}> {
  const res = await fetch("/api/plan-trip", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.reason || json?.error || "Failed to plan trip");
  return json;
}

export async function searchFlights(input: {
  origin_iata: string;
  destination_iata: string;
  departure_date?: string | null;
  passengers?: number;
}): Promise<{
  offers: Array<{
    id: string;
    airline: string;
    priceUsd: number;
    currency: string;
    stops: string;
    duration: string;
    origin: { label: string; lat: number | null; lng: number | null };
    destination: { label: string; lat: number | null; lng: number | null };
  }>;
}> {
  const res = await fetch("/api/flights/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Failed to search flights");
  return json;
}

export async function suggestPlaces(q: string): Promise<{
  places: Array<{
    id: string;
    type: string;
    name: string;
    iata_code: string | null;
    city_name: string | null;
    country_name: string | null;
    country_code: string | null;
    latitude: number | null;
    longitude: number | null;
  }>;
}> {
  const res = await fetch("/api/flights/places?q=" + encodeURIComponent(q));
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Failed to load places");
  return json;
}

export async function bookFlight(input: {
  prompt: string;
  optionId: string;
  details: BookingDetails;
  paymentIntentId: string;
  amount: number;
  currency: string;
  /** For confirmation email */
  airline?: string;
  origin?: string;
  destination?: string;
  duration?: string;
  /** For MongoDB session persistence */
  walletAddress?: string;
  sessionId?: string;
  messages?: ChatMessage[];
  options?: TravelOption[];
  selected?: TravelOption;
  flightMeta?: { airline?: string; route?: string; stops?: string; duration?: string };
}): Promise<{ confirmationId: string; receiptEmailSentTo: string; sessionId?: string | null }> {
  const res = await fetch("/api/book-flight", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Failed to book flight");
  return json;
}

/** Fetch trip history for a specific wallet address */
export async function getTripHistory(
  wallet?: string,
): Promise<{ items: TripHistoryItem[] }> {
  if (!wallet) return { items: [] };
  const res = await fetch(
    `/api/trip-history?wallet=${encodeURIComponent(wallet.toLowerCase())}`,
  );
  if (!res.ok) throw new Error("Failed to load trip history");
  return await res.json();
}

/** Create or update a trip session in MongoDB */
export async function saveSession(input: {
  sessionId?: string;
  walletAddress: string;
  prompt: string;
  messages: ChatMessage[];
  options: TravelOption[];
  selected: TravelOption | null;
  confirmation?: { confirmationId: string; receiptEmailSentTo: string } | null;
}): Promise<{ sessionId: string }> {
  const res = await fetch("/api/trip-history", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Failed to save session");
  return json;
}

export async function createPaymentIntent(input: {
  amount: string;
  currency: string;
}): Promise<{ client_secret: string; payment_intent_id: string }> {
  const res = await fetch("/api/payments/payment-intent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || "Failed to create payment intent");
  return json;
}
