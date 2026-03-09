"use client";

import * as React from "react";
import { suggestPlaces } from "@/src/services/travel";

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

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export function PlaceAutocomplete({
  label,
  placeholder,
  value,
  onSelect,
}: {
  label: string;
  placeholder: string;
  value: string;
  onSelect: (iata: string, displayName: string) => void;
}) {
  const [query, setQuery] = React.useState(value);
  const [results, setResults] = React.useState<Place[]>([]);
  const [selectedIata, setSelectedIata] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const debouncedQuery = useDebounced(query, 250);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  React.useEffect(() => {
    if (debouncedQuery.trim().length < 2 || selectedIata) {
      setResults([]);
      return;
    }
    suggestPlaces(debouncedQuery)
      .then((j) => {
        const filtered = (j.places || []).filter((p) => p.iata_code);
        setResults(filtered);
        setOpen(filtered.length > 0);
      })
      .catch(() => setResults([]));
  }, [debouncedQuery, selectedIata]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative grid gap-1">
      <span className="text-xs font-medium text-black/70">{label}</span>
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedIata("");
          setOpen(true);
        }}
        onFocus={() => {
          if (results.length > 0 && !selectedIata) setOpen(true);
        }}
        placeholder={placeholder}
        className="h-12 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm text-black outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-auto rounded-2xl border border-[color:var(--border)] bg-white shadow-lg">
          {results.slice(0, 6).map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => {
                const display = `${p.name} (${p.iata_code})`;
                setSelectedIata(p.iata_code || "");
                setQuery(display);
                setResults([]);
                setOpen(false);
                onSelect(p.iata_code || "", display);
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-black/5 active:bg-black/10"
            >
              <span className="truncate text-black">{p.name}</span>
              <span className="shrink-0 rounded-xl border border-[color:var(--border)] bg-[color:var(--panel)] px-2 py-1 text-xs text-black/70">
                {p.iata_code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
