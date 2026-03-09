import { Duffel } from "@duffel/api";

export function getDuffelToken() {
  // User contract: token is provided as NEXT_PUBLIC_DUFFEL_TOKEN (even though this is server-side).
  const token =
    process.env.NEXT_PUBLIC_DUFFEL_TOKEN ||
    process.env.DUFFEL_ACCESS_TOKEN ||
    process.env.DUFFEL_TOKEN ||
    "";
  if (!token) {
    throw new Error(
      "Missing NEXT_PUBLIC_DUFFEL_TOKEN. If you just added it to your env file, restart `npm run dev`.",
    );
  }
  return token;
}

let _client: Duffel | null = null;

export function getDuffelClient() {
  if (_client) return _client;
  _client = new Duffel({ token: getDuffelToken() });
  return _client;
}

