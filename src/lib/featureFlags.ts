/**
 * Feature flag registry.
 *
 * Each flag maps to a `NEXT_PUBLIC_FF_*` env var.
 * Set to "true" in .env.local (or Vercel dashboard) to enable.
 * Any other value (or unset) = disabled.
 */

function isEnabled(key: string): boolean {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] === "true";
  }
  return false;
}

/** XMTP wallet-to-wallet messaging & itinerary sharing */
export const FF_XMTP = isEnabled("NEXT_PUBLIC_FF_XMTP");

/** ENS / Base name resolution for profiles */
export const FF_ENS_RESOLVE = isEnabled("NEXT_PUBLIC_FF_ENS_RESOLVE");

/** Farcaster Frames v2 interactive booking */
export const FF_FRAMES_V2 = isEnabled("NEXT_PUBLIC_FF_FRAMES_V2");

/** Persistent trip history (requires DB) */
export const FF_TRIP_HISTORY = isEnabled("NEXT_PUBLIC_FF_TRIP_HISTORY");

/** Multi-chain crypto payments */
export const FF_MULTICHAIN_PAY = isEnabled("NEXT_PUBLIC_FF_MULTICHAIN_PAY");
