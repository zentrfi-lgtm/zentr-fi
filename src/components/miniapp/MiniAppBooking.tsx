"use client";

import * as React from "react";
import type { TravelOption, BookingDetails } from "@/src/types/travel";
import { createPaymentIntent } from "@/src/services/travel";

export function MiniAppBooking({
  option,
  onBook,
  onBack,
  submitting,
}: {
  option: TravelOption;
  onBook: (details: BookingDetails, paymentIntentId: string) => void;
  onBack: () => void;
  submitting?: boolean;
}) {
  const [details, setDetails] = React.useState<BookingDetails>({
    fullLegalName: "",
    dateOfBirth: "",
    gender: "X",
    email: "",
    phone: "",
    residentialAddress: "",
  });
  const [paymentIntentClientToken, setPaymentIntentClientToken] = React.useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const duffelPaymentsRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    createPaymentIntent({
      amount: option.priceUsd.toFixed(2),
      currency: (option.currency || "USD").toUpperCase(),
    })
      .then((data) => {
        setPaymentIntentClientToken(data.client_secret);
        setPaymentIntentId(data.payment_intent_id);
      })
      .catch(() => {});
  }, [option.priceUsd, option.currency]);

  React.useEffect(() => {
    const el = duffelPaymentsRef.current;
    if (!el) return;
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      onBook(details, customEvent.detail.id);
    };
    el.addEventListener("successful-payment", handler);
    return () => el.removeEventListener("successful-payment", handler);
  }, [details, onBook]);

  const update = <K extends keyof BookingDetails>(k: K, v: BookingDetails[K]) => {
    setFormError(null);
    setDetails((d) => ({ ...d, [k]: v }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!details.fullLegalName.trim()) missing.push("Full legal name");
    if (!details.dateOfBirth) missing.push("Date of birth");
    if (!details.email.trim()) missing.push("Email");
    if (!details.phone.trim()) missing.push("Mobile phone");
    if (!details.residentialAddress.trim()) missing.push("Address");
    if (missing.length > 0) {
      setFormError(`Please fill in: ${missing.join(", ")}.`);
      return;
    }
    setFormError(null);
    onBook(details, paymentIntentId ?? "simulated-payment-intent");
  };

  const inputClass =
    "h-12 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm text-black outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40";

  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
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
        <div>
          <h2 className="font-[family-name:var(--font-kanit)] text-lg text-black">
            Book {option.airline}
          </h2>
          <p className="text-xs text-black/60">
            ${option.priceUsd} &middot; {option.duration} &middot; {option.stops === "0" ? "Direct" : `${option.stops} stop(s)`}
          </p>
        </div>
      </div>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <label className="grid gap-1">
          <span className="text-xs font-medium text-black/70">Full legal name</span>
          <input
            value={details.fullLegalName}
            onChange={(e) => update("fullLegalName", e.target.value)}
            placeholder="e.g. Jane Alexandra Doe"
            className={inputClass}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-black/70">Date of birth</span>
            <input
              type="date"
              value={details.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-black/70">Gender</span>
            <select
              value={details.gender}
              onChange={(e) => update("gender", e.target.value as BookingDetails["gender"])}
              className={inputClass}
            >
              <option value="M">M</option>
              <option value="F">F</option>
              <option value="X">X</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-black/70">Email</span>
          <input
            type="email"
            value={details.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@domain.com"
            className={inputClass}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-black/70">Mobile phone</span>
          <input
            value={details.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 555 0100"
            className={inputClass}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs font-medium text-black/70">Residential address</span>
          <input
            value={details.residentialAddress}
            onChange={(e) => update("residentialAddress", e.target.value)}
            placeholder="Street, City, State, ZIP, Country"
            className={inputClass}
          />
        </label>

        {paymentIntentClientToken &&
          React.createElement("duffel-payments", {
            ref: duffelPaymentsRef,
            "payment-intent-client-token": paymentIntentClientToken,
          })}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 flex h-12 items-center justify-center rounded-2xl bg-[color:var(--z-blue)] text-sm font-semibold text-white transition hover:brightness-110 active:translate-y-px disabled:opacity-60"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Processing...
            </span>
          ) : (
            "Book"
          )}
        </button>

        {formError && <p className="text-xs text-red-500">{formError}</p>}
      </form>
    </div>
  );
}
