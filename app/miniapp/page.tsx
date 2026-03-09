"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import sdk from "@farcaster/miniapp-sdk";
import { useAccount, useConnect } from "wagmi";
import { MiniAppHeader } from "@/src/components/miniapp/MiniAppHeader";
import { MiniAppSearch } from "@/src/components/miniapp/MiniAppSearch";
import { MiniAppResults } from "@/src/components/miniapp/MiniAppResults";
import { MiniAppBooking } from "@/src/components/miniapp/MiniAppBooking";
import { MiniAppConfirmation } from "@/src/components/miniapp/MiniAppConfirmation";
import { searchFlights, bookFlight, suggestPlaces } from "@/src/services/travel";
import type { TravelOption, BookingDetails } from "@/src/types/travel";

type Step = "search" | "results" | "booking" | "confirmation";

type FarcasterContext = {
  fid?: number;
  displayName?: string;
};

export default function MiniAppPage() {
  return (
    <React.Suspense>
      <MiniAppContent />
    </React.Suspense>
  );
}

function MiniAppContent() {
  const urlParams = useSearchParams();
  const [step, setStep] = React.useState<Step>("search");
  const [offers, setOffers] = React.useState<TravelOption[]>([]);
  const [selectedOption, setSelectedOption] = React.useState<TravelOption | null>(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [bookLoading, setBookLoading] = React.useState(false);
  const [confirmationId, setConfirmationId] = React.useState("");
  const [receiptEmail, setReceiptEmail] = React.useState("");
  const [searchParams, setSearchParams] = React.useState({ originIata: "", destinationIata: "" });
  const [fcContext, setFcContext] = React.useState<FarcasterContext>({});
  const [error, setError] = React.useState<string | null>(null);
  const autoSearched = React.useRef(false);

  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  // Initialize SDK and auto-connect wallet
  React.useEffect(() => {
    async function init() {
      try {
        const context = await sdk.context;
        setFcContext({
          fid: context?.user?.fid,
          displayName: context?.user?.displayName,
        });
      } catch {
        // Running outside Farcaster client — that's fine
      }

      // Signal to Warpcast that the app is ready
      try {
        await sdk.actions.ready();
      } catch {
        // Not in Mini App context
      }
    }
    init();
  }, []);

  // Auto-connect wallet in Mini App context
  React.useEffect(() => {
    if (!isConnected && connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  }, [isConnected, connectors, connect]);

  // Auto-search from URL params (e.g. ?from=Miami&to=LAX&date=2026-03-15)
  React.useEffect(() => {
    if (autoSearched.current) return;
    const from = urlParams.get("from");
    const to = urlParams.get("to");
    if (!from || !to) return;
    autoSearched.current = true;

    async function resolveAndSearch() {
      try {
        setSearchLoading(true);
        setError(null);

        // Resolve city names to IATA codes if needed
        let originIata = from!.toUpperCase();
        let destIata = to!.toUpperCase();

        if (!/^[A-Z]{3}$/.test(originIata)) {
          const res = await suggestPlaces(from!);
          const match = res.places?.find((p) => p.iata_code);
          if (match?.iata_code) originIata = match.iata_code;
        }
        if (!/^[A-Z]{3}$/.test(destIata)) {
          const res = await suggestPlaces(to!);
          const match = res.places?.find((p) => p.iata_code);
          if (match?.iata_code) destIata = match.iata_code;
        }

        const date = urlParams.get("date") || new Date().toISOString().slice(0, 10);
        setSearchParams({ originIata, destinationIata: destIata });

        const result = await searchFlights({
          origin_iata: originIata,
          destination_iata: destIata,
          departure_date: date,
          passengers: 1,
        });
        setOffers(result.offers as TravelOption[]);
        setStep("results");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed.");
      } finally {
        setSearchLoading(false);
      }
    }
    resolveAndSearch();
  }, [urlParams]);

  const handleSearch = async (args: {
    originIata: string;
    destinationIata: string;
    departureDate: string;
  }) => {
    setSearchLoading(true);
    setError(null);
    setSearchParams({ originIata: args.originIata, destinationIata: args.destinationIata });
    try {
      const result = await searchFlights({
        origin_iata: args.originIata,
        destination_iata: args.destinationIata,
        departure_date: args.departureDate,
        passengers: 1,
      });
      setOffers(result.offers as TravelOption[]);
      setStep("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectOption = (option: TravelOption) => {
    setSelectedOption(option);
    setStep("booking");
  };

  const handleBook = async (details: BookingDetails, paymentIntentId: string) => {
    if (!selectedOption) return;
    setBookLoading(true);
    setError(null);
    try {
      const result = await bookFlight({
        prompt: `${searchParams.originIata} to ${searchParams.destinationIata}`,
        optionId: selectedOption.id,
        details,
        paymentIntentId,
        amount: selectedOption.priceUsd,
        currency: selectedOption.currency || "USD",
      });
      setConfirmationId(result.confirmationId);
      setReceiptEmail(result.receiptEmailSentTo);
      setStep("confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setBookLoading(false);
    }
  };

  const handleReset = () => {
    setStep("search");
    setOffers([]);
    setSelectedOption(null);
    setConfirmationId("");
    setReceiptEmail("");
    setError(null);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <MiniAppHeader />

      {fcContext.displayName && step === "search" && (
        <div className="px-4 pt-3">
          <p className="text-sm text-black/60">
            Welcome, <span className="font-semibold text-black">{fcContext.displayName}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === "search" && (
        <MiniAppSearch onSearch={handleSearch} loading={searchLoading} />
      )}

      {step === "results" && (
        <MiniAppResults
          offers={offers}
          onSelect={handleSelectOption}
          onBack={() => setStep("search")}
          fid={fcContext.fid}
        />
      )}

      {step === "booking" && selectedOption && (
        <MiniAppBooking
          option={selectedOption}
          onBook={handleBook}
          onBack={() => setStep("results")}
          submitting={bookLoading}
        />
      )}

      {step === "confirmation" && selectedOption && (
        <MiniAppConfirmation
          confirmationId={confirmationId}
          receiptEmail={receiptEmail}
          airline={selectedOption.airline}
          route={`${selectedOption.origin.label} → ${selectedOption.destination.label}`}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
