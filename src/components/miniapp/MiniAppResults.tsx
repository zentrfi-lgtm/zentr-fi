"use client";

import * as React from "react";
import type { TravelOption } from "@/src/types/travel";
import { TravelOptionCard } from "@/src/components/chat/TravelOptionCard";

export function MiniAppResults({
  offers,
  onSelect,
  onBack,
  fid,
}: {
  offers: TravelOption[];
  onSelect: (option: TravelOption) => void;
  onBack: () => void;
  fid?: number;
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [watching, setWatching] = React.useState(false);
  const [watchStatus, setWatchStatus] = React.useState<"idle" | "saved" | "error">("idle");

  const cheapestPrice = offers.length > 0
    ? Math.min(...offers.map((o) => o.priceUsd))
    : 0;

  const handleWatch = async () => {
    if (!fid || offers.length === 0) return;
    setWatching(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid,
          from: offers[0].origin.label.match(/\(([A-Z]{3})\)/)?.[1] || offers[0].origin.label,
          to: offers[0].destination.label.match(/\(([A-Z]{3})\)/)?.[1] || offers[0].destination.label,
          lastSeenPrice: cheapestPrice,
        }),
      });
      setWatchStatus(res.ok ? "saved" : "error");
    } catch {
      setWatchStatus("error");
    } finally {
      setWatching(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border)] bg-white text-black/70 hover:bg-black/5 active:translate-y-px"
          aria-label="Back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="font-[family-name:var(--font-kanit)] text-lg text-black">
            {offers.length} flight{offers.length !== 1 ? "s" : ""} found
          </h2>
          <p className="text-xs text-black/60">Tap a flight to book it</p>
        </div>
        {fid && offers.length > 0 && (
          <button
            type="button"
            onClick={handleWatch}
            disabled={watching || watchStatus === "saved"}
            className={[
              "flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition active:translate-y-px",
              watchStatus === "saved"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-[color:var(--border)] bg-white text-black/70 hover:bg-black/5",
            ].join(" ")}
          >
            {watchStatus === "saved" ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Watching
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {watching ? "Saving..." : "Watch Price"}
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {offers.map((offer) => (
          <TravelOptionCard
            key={offer.id}
            option={offer}
            selected={selectedId === offer.id}
            onSelect={(opt) => {
              setSelectedId(opt.id);
              onSelect(opt);
            }}
          />
        ))}
      </div>

      {offers.length === 0 && (
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6 text-center text-sm text-black/60">
          No flights found for this route. Try different dates or airports.
        </div>
      )}
    </div>
  );
}
