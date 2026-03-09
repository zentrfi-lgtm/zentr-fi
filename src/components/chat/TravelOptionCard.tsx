"use client";

import * as React from "react";
import type { TravelOption } from "@/src/types/travel";
import { AirplaneIcon } from "@/src/components/icons/AirplaneIcon";

export function TravelOptionCard({
  option,
  onSelect,
  selected,
}: {
  option: TravelOption;
  selected?: boolean;
  onSelect?: (opt: TravelOption) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(option)}
      className={[
        "w-full rounded-3xl border p-4 text-left transition",
        selected
          ? "border-[color:var(--z-blue)] bg-[color:var(--panel-strong)]"
          : "border-[color:var(--border)] bg-[color:var(--panel)] hover:bg-[color:var(--panel-strong)]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-[family-name:var(--font-kanit)] text-base text-black">
            {option.airline}
          </div>
          <div className="mt-0.5 text-xs text-black/60">
            {option.origin.label} → {option.destination.label}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AirplaneIcon className="h-5 w-5 text-[color:var(--z-blue)] opacity-85" />
          <div className="rounded-2xl bg-[color:var(--z-blue)] px-3 py-1 text-xs font-semibold text-white">
            ${option.priceUsd}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-black/60">
        <span>
          Estimated duration:{" "}
          <span className="font-semibold text-black">{option.duration || "—"}</span>
        </span>
        {option.stops ? (
          <span className="rounded-full border border-[color:var(--border)] bg-white/70 px-2.5 py-0.5 text-[10px] font-medium text-black/60">
            {option.stops} stop{option.stops === "1" ? "" : "s"}
          </span>
        ) : (
          <span className="rounded-full border border-[color:var(--border)] bg-white/70 px-2.5 py-0.5 text-[10px] font-medium text-black/60">
            Direct
          </span>
        )}
      </div>
    </button>
  );
}

