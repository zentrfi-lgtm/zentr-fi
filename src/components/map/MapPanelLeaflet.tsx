"use client";

import * as React from "react";
import type { TravelOption } from "@/src/types/travel";
import { MapContainer, Polyline, TileLayer, CircleMarker, useMap } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

function FitBounds({ bounds }: { bounds: LatLngBoundsExpression }) {
  const map = useMap();
  React.useEffect(() => {
    map.fitBounds(bounds, { padding: [34, 34] });
  }, [bounds, map]);
  return null;
}

export function MapPanelLeaflet({
  option,
}: {
  option?: Pick<TravelOption, "origin" | "destination">;
}) {
  const hasCoords =
    option?.origin?.lat != null &&
    option?.origin?.lng != null &&
    option?.destination?.lat != null &&
    option?.destination?.lng != null;

  if (!hasCoords) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-3xl border border-[color:var(--border)] bg-white text-sm text-black/60">
        Map will appear after route selection
      </div>
    );
  }

  const origin: LatLngExpression = [option.origin.lat as number, option.origin.lng as number];
  const destination: LatLngExpression = [
    option.destination.lat as number,
    option.destination.lng as number,
  ];
  const bounds: LatLngBoundsExpression = [origin, destination];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-[color:var(--border)] bg-white">
      <MapContainer
        className="absolute inset-0"
        center={[37, -97]}
        zoom={3}
        scrollWheelZoom={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />
        <Polyline
          positions={[origin, destination]}
          pathOptions={{ color: "#0000fe", weight: 4, opacity: 0.85 }}
        />
        <CircleMarker
          center={origin}
          radius={7}
          pathOptions={{ color: "#090551", weight: 2, fillColor: "#ffffff", fillOpacity: 1 }}
        />
        <CircleMarker
          center={destination}
          radius={7}
          pathOptions={{ color: "#090551", weight: 2, fillColor: "#ffffff", fillOpacity: 1 }}
        />
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-[color:var(--border)] bg-white/80 px-3 py-2 text-xs text-black/70 backdrop-blur">
        OpenStreetMap • Live route (mock)
      </div>
    </div>
  );
}

