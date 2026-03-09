import * as React from "react";
import type { TravelOption } from "@/src/types/travel";
import dynamic from "next/dynamic";

const MapPanelLeaflet = dynamic(() => import("./MapPanelLeaflet").then((m) => m.MapPanelLeaflet), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center rounded-3xl border border-[color:var(--border)] bg-white text-sm text-black/60">
      Loading map…
    </div>
  ),
});

export function MapPanel({ option }: { option?: Pick<TravelOption, "origin" | "destination"> }) {
  return <MapPanelLeaflet option={option} />;
}

