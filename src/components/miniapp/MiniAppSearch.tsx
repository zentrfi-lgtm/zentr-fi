"use client";

import * as React from "react";
import { PlaceAutocomplete } from "./PlaceAutocomplete";

export function MiniAppSearch({
  onSearch,
  loading,
}: {
  onSearch: (args: {
    originIata: string;
    destinationIata: string;
    departureDate: string;
  }) => void;
  loading?: boolean;
}) {
  const [originIata, setOriginIata] = React.useState("");
  const [destinationIata, setDestinationIata] = React.useState("");
  const [departureDate, setDepartureDate] = React.useState(
    new Date().toISOString().slice(0, 10),
  );
  const [error, setError] = React.useState("");

  const handleSubmit = () => {
    const missing: string[] = [];
    if (!originIata) missing.push("origin");
    if (!destinationIata) missing.push("destination");
    if (missing.length > 0) {
      setError(`Please select ${missing.join(" and ")}.`);
      return;
    }
    setError("");
    onSearch({ originIata, destinationIata, departureDate });
  };

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-4">
      <div>
        <h1 className="font-[family-name:var(--font-kanit)] text-2xl text-black">
          Where to?
        </h1>
        <p className="mt-1 text-sm text-black/60">
          Search and book flights directly from Farcaster.
        </p>
      </div>

      <PlaceAutocomplete
        label="From"
        placeholder="e.g. Miami, MIA"
        value=""
        onSelect={(iata) => {
          setOriginIata(iata);
          setError("");
        }}
      />

      <PlaceAutocomplete
        label="To"
        placeholder="e.g. Los Angeles, LAX"
        value=""
        onSelect={(iata) => {
          setDestinationIata(iata);
          setError("");
        }}
      />

      <label className="grid gap-1">
        <span className="text-xs font-medium text-black/70">Departure date</span>
        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          className="h-12 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm text-black outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
        />
      </label>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-2 flex h-12 items-center justify-center rounded-2xl bg-[color:var(--z-blue)] text-sm font-semibold text-white transition hover:brightness-110 active:translate-y-px disabled:opacity-60"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Searching...
          </span>
        ) : (
          "Search Flights"
        )}
      </button>
    </div>
  );
}
