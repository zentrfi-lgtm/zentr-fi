import type { ParsedQuery } from "./parser";

export type TravelOption = {
  id: string;
  airline: string;
  priceUsd: number;
  stops: string;
  duration: string;
  origin: { label: string; lat: number; lng: number };
  destination: { label: string; lat: number; lng: number };
};

type Location = { label: string; lat: number; lng: number };

const LOCATIONS: Record<string, Location> = {
  florida: { label: "Florida (MIA)", lat: 25.7959, lng: -80.2871 },
  miami: { label: "Florida (MIA)", lat: 25.7959, lng: -80.2871 },
  california: { label: "California (LAX)", lat: 33.9416, lng: -118.4085 },
  "los angeles": { label: "California (LAX)", lat: 33.9416, lng: -118.4085 },
  "new york": { label: "New York (JFK)", lat: 40.6413, lng: -73.7781 },
  nyc: { label: "New York (JFK)", lat: 40.6413, lng: -73.7781 },
  london: { label: "London (LHR)", lat: 51.47, lng: -0.4543 },
};

function resolveLocation(input: string): Location | null {
  const lower = input.toLowerCase().trim();
  for (const [key, loc] of Object.entries(LOCATIONS)) {
    if (lower.includes(key)) return loc;
  }
  return null;
}

const MOCK_OPTIONS = [
  { id: "opt-1", airline: "Delta", priceUsd: 95, stops: "1 stop", duration: "5h 30m" },
  { id: "opt-2", airline: "JetBlue", priceUsd: 102, stops: "Direct", duration: "4h 10m" },
  { id: "opt-3", airline: "United", priceUsd: 89, stops: "2 stops", duration: "6h 05m" },
];

export function searchFlights(query: ParsedQuery): TravelOption[] {
  const origin = resolveLocation(query.origin);
  const destination = resolveLocation(query.destination);

  if (!origin || !destination) return [];

  let options = MOCK_OPTIONS.map((o) => ({ ...o, origin, destination }));

  if (query.budget !== null) {
    options = options.filter((o) => o.priceUsd <= query.budget!);
  }

  options.sort((a, b) => a.priceUsd - b.priceUsd);

  return options;
}
