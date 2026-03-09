"use client";

import * as React from "react";
import sdk from "@farcaster/miniapp-sdk";

export function MiniAppConfirmation({
  confirmationId,
  receiptEmail,
  airline,
  route,
  onReset,
}: {
  confirmationId: string;
  receiptEmail: string;
  airline: string;
  route: string;
  onReset: () => void;
}) {
  const handleShare = async () => {
    try {
      await sdk.actions.composeCast({
        text: `Just booked a flight with Zentrfi!\n\n${airline} ${route}\nConfirmation: ${confirmationId}\n\nBook yours at zentrfi.xyz`,
      });
    } catch {
      // User cancelled or SDK not available
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 px-4 pt-10 pb-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 13l4 4L19 7" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div>
        <h2 className="font-[family-name:var(--font-kanit)] text-2xl text-black">
          Booking Confirmed
        </h2>
        <p className="mt-1 text-sm text-black/60">
          Your flight has been booked successfully.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-4 text-left">
        <div className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-black/60">Confirmation</span>
            <span className="font-semibold text-black">{confirmationId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/60">Flight</span>
            <span className="font-semibold text-black">{airline}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/60">Route</span>
            <span className="font-semibold text-black">{route}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-black/60">Receipt sent to</span>
            <span className="font-semibold text-black truncate ml-2">{receiptEmail}</span>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={handleShare}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[color:var(--z-blue)] text-sm font-semibold text-white transition hover:brightness-110 active:translate-y-px"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 8l4-4m0 0l4 4M8 4v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Share on Farcaster
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex h-12 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-white text-sm font-semibold text-black transition hover:bg-black/5 active:translate-y-px"
        >
          Search Another Flight
        </button>
      </div>
    </div>
  );
}
