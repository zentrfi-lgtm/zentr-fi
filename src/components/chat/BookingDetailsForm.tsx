"use client";

import * as React from "react";
import type { BookingDetails } from "@/src/types/travel";
import { createPaymentIntent } from "@/src/services/travel";
import { MultiChainPay } from "@/src/components/payments/MultiChainPay";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "duffel-payments": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "payment-intent-client-token": string;
        "on-successful-payment"?: (event: CustomEvent) => void;
      };
    }
  }
}

export function BookingDetailsForm({
  defaultEmail,
  onSubmit,
  submitting,
  amount,
  currency,
}: {
  defaultEmail?: string;
  submitting?: boolean;
  onSubmit: (details: BookingDetails, paymentIntentId: string) => void;
  amount: number;
  currency: string;
}) {
  const [details, setDetails] = React.useState<BookingDetails>({
    fullLegalName: "",
    dateOfBirth: "",
    gender: "X",
    email: defaultEmail || "",
    phone: "",
    residentialAddress: "",
  });
  const [paymentIntentClientToken, setPaymentIntentClientToken] = React.useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const duffelPaymentsRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    createPaymentIntent({ amount: amount.toFixed(2), currency: currency.toUpperCase() }).then((data) => {
      setPaymentIntentClientToken(data.client_secret);
      setPaymentIntentId(data.payment_intent_id);
    }).catch(() => {
      // Allow form to still be submitted in simulation mode
    });
  }, [amount, currency]);

  React.useEffect(() => {
    const duffelPaymentsElement = duffelPaymentsRef.current;
    if (!duffelPaymentsElement) return;

    const handleSuccessfulPayment = (event: Event) => {
      const customEvent = event as CustomEvent;
      onSubmit(details, customEvent.detail.id);
    };

    duffelPaymentsElement.addEventListener("successful-payment", handleSuccessfulPayment);

    return () => {
      duffelPaymentsElement.removeEventListener("successful-payment", handleSuccessfulPayment);
    };
  }, [details, onSubmit]);

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
    if (!details.residentialAddress.trim()) missing.push("Residential address");

    if (missing.length > 0) {
      setFormError(`Please fill in: ${missing.join(", ")}.`);
      return;
    }

    setFormError(null);
    onSubmit(details, paymentIntentId ?? "simulated-payment-intent");
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="text-sm font-medium text-black/80">
        Booking & identity details
      </div>
      <div className="text-xs text-black/60">
        This is a UI simulation. In production these fields should be encrypted and handled with
        strict compliance (Secure Flight / KYC).
      </div>

      <label className="grid gap-1">
        <span className="text-xs font-medium text-black/70">Full legal name</span>
        <input
          value={details.fullLegalName}
          onChange={(e) => update("fullLegalName", e.target.value)}
          placeholder="e.g. Jane Alexandra Doe"
          className="h-11 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm text-black outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs font-medium text-black/70">Date of birth</span>
          <input
            type="date"
            value={details.dateOfBirth}
            onChange={(e) => update("dateOfBirth", e.target.value)}
            className="h-11 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm text-black outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-medium text-black/70">Gender</span>
          <select
            value={details.gender}
            onChange={(e) => update("gender", e.target.value as BookingDetails["gender"])}
            className="h-11 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm text-black outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
          >
            <option value="M">M</option>
            <option value="F">F</option>
            <option value="X">X</option>
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">
          <span className="text-xs font-medium text-black/70">Email</span>
          <input
            type="email"
            value={details.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@domain.com"
            className="h-11 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm text-black outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-medium text-black/70">Mobile phone</span>
          <input
            value={details.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+1 555 0100"
            className="h-11 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm text-black outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
          />
        </label>
      </div>

      <label className="grid gap-1">
        <span className="text-xs font-medium text-black/70">
          Residential address (KYC)
        </span>
        <input
          value={details.residentialAddress}
          onChange={(e) => update("residentialAddress", e.target.value)}
          placeholder="Street, City, State, ZIP, Country"
          className="h-11 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm text-black outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
        />
      </label>

      {paymentIntentClientToken && (
        <duffel-payments
          ref={duffelPaymentsRef}
          payment-intent-client-token={paymentIntentClientToken}
          on-successful-payment={(event: CustomEvent) => {
            onSubmit(details, event.detail.id);
          }}
        />
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl bg-[color:var(--z-blue)] px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Processing…
          </span>
        ) : (
          "Book"
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[color:var(--border)]" />
        <span className="text-xs font-medium text-black/40">or</span>
        <div className="h-px flex-1 bg-[color:var(--border)]" />
      </div>

      {/* Multi-chain crypto payment */}
      <MultiChainPay
        amount={amount}
        currency={currency}
        disabled={submitting}
        onSuccess={(txHash) => {
          onSubmit(details, `crypto:${txHash}`);
        }}
      />

      {formError && (
        <p className="text-xs text-red-500">{formError}</p>
      )}
    </form>
  );
}
