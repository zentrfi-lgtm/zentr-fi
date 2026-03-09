"use client";

import * as React from "react";
import { suggestPlaces } from "@/src/services/travel";

type Country = { code: string; name: string };
type State = { name: string };

type Place = {
  id: string;
  type: string;
  name: string;
  iata_code: string | null;
  city_name: string | null;
  country_name: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
};

function extractIata(input: string): string {
  const m = input.toUpperCase().match(/\b([A-Z]{3})\b/);
  return m?.[1] || "";
}

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function LocationModal({
  open,
  onClose,
  detectedDestination,
  detectedDate,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  detectedDestination: string;
  detectedDate: string | null;
  onConfirm: (args: {
    originIata: string;
    destinationIata: string;
    departureDate: string;
  }) => void;
}) {
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [states, setStates] = React.useState<State[]>([]);
  const [country, setCountry] = React.useState<string>("");
  const [state, setState] = React.useState<string>("");

  const [originQuery, setOriginQuery] = React.useState("");
  const [destQuery, setDestQuery] = React.useState(detectedDestination);
  const dOriginQuery = useDebounced(originQuery, 250);
  const dDestQuery = useDebounced(destQuery, 250);

  const [originResults, setOriginResults] = React.useState<Place[]>([]);
  const [destResults, setDestResults] = React.useState<Place[]>([]);
  const [originIata, setOriginIata] = React.useState<string>("");
  const [destinationIata, setDestinationIata] = React.useState<string>("");
  const [submitError, setSubmitError] = React.useState<string>("");
  const [departureDate, setDepartureDate] = React.useState<string>(
    detectedDate || new Date().toISOString().slice(0, 10),
  );

  React.useEffect(() => {
    if (!open) return;
    fetch("/api/geo/countries")
      .then((r) => r.json())
      .then((j) => setCountries(j.countries || []))
      .catch(() => setCountries([]));
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    if (!country) {
      setStates([]);
      setState("");
      return;
    }
    const countryName = countries.find((c) => c.code === country)?.name || "";
    fetch(`/api/geo/states?country=${encodeURIComponent(countryName)}`)
      .then((r) => r.json())
      .then((j) => setStates(j.states || []))
      .catch(() => setStates([]));
  }, [country, countries, open]);

  React.useEffect(() => {
    if (!open) return;
    if (dOriginQuery.trim().length < 2) return;
    suggestPlaces(dOriginQuery)
      .then((j) => setOriginResults((j.places || []).filter((p) => p.iata_code)))
      .catch(() => setOriginResults([]));
  }, [dOriginQuery, open]);

  React.useEffect(() => {
    if (!open) return;
    if (dDestQuery.trim().length < 2) return;
    suggestPlaces(dDestQuery)
      .then((j) => setDestResults((j.places || []).filter((p) => p.iata_code)))
      .catch(() => setDestResults([]));
  }, [dDestQuery, open]);

  React.useEffect(() => {
    if (!open) return;
    setDestQuery(detectedDestination);
  }, [detectedDestination, open]);

  if (!open) return null;

  const missing: string[] = [];
  if (!originIata) missing.push("Origin airport (IATA)");
  if (!destinationIata) missing.push("Destination airport (IATA)");

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/25"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-xl overflow-auto max-h-screen rounded-[2rem] border border-[color:var(--border)] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-widest text-black/60">
              Confirm your current location
            </div>
            <div className="mt-2 font-[family-name:var(--font-kanit)] text-2xl text-black">
              Pick your origin (no GPS required)
            </div>
            <div className="mt-2 text-sm leading-7 text-black/70">
              We ask this because browser location can be inaccurate. Select your country/state and
              choose the best matching airport/city.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-white text-black/70 hover:bg-black/5"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label className="grid min-w-0 gap-1">
            <span className="text-xs font-medium text-black/70">Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-11 w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
            >
              <option value="">Select…</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid min-w-0 gap-1">
            <span className="text-xs font-medium text-black/70">State / Province</span>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              disabled={!states.length}
              className="h-11 w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40 disabled:opacity-60"
            >
              <option value="">Select…</option>
              {states.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-black/70">Origin airport/city (IATA)</span>
            <input
              value={originQuery}
              onChange={(e) => {
                const v = e.target.value;
                setOriginQuery(v);
                setOriginIata(extractIata(v));
              }}
              placeholder="e.g. Miami, MIA"
              className="h-11 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
            />
          </label>
          {originResults.length > 0 && !originIata && (
            <div className="max-h-48 overflow-auto rounded-3xl border border-[color:var(--border)] bg-white">
              {originResults.slice(0, 8).map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    setOriginIata(p.iata_code || "");
                    setOriginQuery(`${p.name} (${p.iata_code})`);
                    setOriginResults([]);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-black/5"
                >
                  <span className="text-black">{p.name}</span>
                  <span className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-2 py-1 text-xs text-black/70">
                    {p.iata_code}
                  </span>
                </button>
              ))}
            </div>
          )}

          <label className="grid gap-1">
            <span className="text-xs font-medium text-black/70">Destination airport/city (IATA)</span>
            <input
              value={destQuery}
              onChange={(e) => {
                const v = e.target.value;
                setDestQuery(v);
                setDestinationIata(extractIata(v));
              }}
              placeholder="e.g. Los Angeles, LAX"
              className="h-11 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
            />
          </label>
          {destResults.length > 0 && !destinationIata && (
            <div className="max-h-48 overflow-auto rounded-3xl border border-[color:var(--border)] bg-white">
              {destResults.slice(0, 8).map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    setDestinationIata(p.iata_code || "");
                    setDestQuery(`${p.name} (${p.iata_code})`);
                    setDestResults([]);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-black/5"
                >
                  <span className="text-black">{p.name}</span>
                  <span className="rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-2 py-1 text-xs text-black/70">
                    {p.iata_code}
                  </span>
                </button>
              ))}
            </div>
          )}

          <label className="grid gap-1">
            <span className="text-xs font-medium text-black/70">Departure date</span>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="h-11 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm font-semibold text-black hover:bg-black/5 active:translate-y-px"
          >
            Cancel
          </button>
          <button
            type="button"
            aria-disabled={missing.length > 0}
            onClick={() => {
              if (missing.length > 0) {
                setSubmitError(`Missing: ${missing.join(", ")}.`);
                return;
              }
              setSubmitError("");
              onConfirm({
                originIata,
                destinationIata,
                departureDate,
              });
            }}
            className={[
              "inline-flex h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold shadow-sm active:translate-y-px",
              missing.length > 0
                ? "cursor-not-allowed bg-[color:var(--z-blue)] opacity-60"
                : "cursor-pointer bg-[color:var(--z-blue)] text-white hover:brightness-110",
            ].join(" ")}
          >
            Search flights
          </button>
        </div>

        {submitError && (
          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}
      </div>
    </div>
  );
}

