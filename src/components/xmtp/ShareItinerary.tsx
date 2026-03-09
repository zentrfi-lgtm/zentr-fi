"use client";

import * as React from "react";
import { useWalletClient } from "wagmi";
import { FF_XMTP } from "@/src/lib/featureFlags";

interface ShareItineraryProps {
  confirmationId: string;
  route: string;
  airline: string;
}

export function ShareItinerary({ confirmationId, route, airline }: ShareItineraryProps) {
  const { data: walletClient } = useWalletClient();
  const [open, setOpen] = React.useState(false);
  const [recipient, setRecipient] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState("");

  // Pre-fill message when modal opens
  React.useEffect(() => {
    if (open) {
      setMessage(
        `ZentrFi Booking Confirmed!\n\nConfirmation: ${confirmationId}\nRoute: ${route}\nAirline: ${airline}\n\nShared via ZentrFi`,
      );
      setSent(false);
      setError("");
    }
  }, [open, confirmationId, route, airline]);

  const handleSend = async () => {
    if (!recipient.trim() || !walletClient) return;

    setSending(true);
    setError("");

    try {
      // Dynamic import to avoid SSR issues with XMTP browser SDK
      const { Client } = await import("@xmtp/browser-sdk");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const xmtpClient = await Client.create(walletClient as any, {
        env: "production",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const conversation = await (xmtpClient.conversations as any).newDm(recipient.trim());
      await conversation.send(message);

      setSent(true);
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      console.error("XMTP send failed:", err);
      setError(String((err as Error)?.message || "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  // Disabled / coming soon state
  if (!FF_XMTP) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 rounded-2xl border border-black/8 bg-black/[0.03] px-4 py-2.5 text-sm font-medium text-black/30 cursor-not-allowed"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Share via XMTP
        <span className="rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black/30">
          Coming Soon
        </span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--z-blue)]/30 bg-[color:var(--z-blue)]/8 px-4 py-2.5 text-sm font-semibold text-[color:var(--z-blue)] transition hover:bg-[color:var(--z-blue)]/15"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Share via XMTP
      </button>

      {/* Share modal */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => !sending && setOpen(false)}
        >
          <div
            className="relative w-[400px] max-w-[90vw] rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={sending}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-black/50 hover:bg-black/10 hover:text-black disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <div className="font-[family-name:var(--font-kanit)] text-lg">Share Itinerary</div>
            <p className="mt-1 text-xs text-black/50">
              Send your booking details to any wallet via XMTP
            </p>

            {/* Recipient input */}
            <div className="mt-5">
              <label className="text-xs font-medium text-black/60">Recipient wallet address</label>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="mt-1.5 h-11 w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
              />
            </div>

            {/* Message preview */}
            <div className="mt-4">
              <label className="text-xs font-medium text-black/60">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="mt-1.5 w-full resize-none rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] px-4 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
              />
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            {sent && (
              <div className="mt-3 rounded-xl border border-green-200 bg-green-50/60 px-3 py-2 text-xs text-green-700">
                Message sent successfully!
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={sending}
                className="flex-1 rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm font-medium text-black/70 transition hover:bg-black/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !recipient.trim() || !walletClient || sent}
                className="flex-1 rounded-2xl bg-[color:var(--z-blue)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                {sending ? "Sending..." : sent ? "Sent!" : "Send via XMTP"}
              </button>
            </div>

            {!walletClient && (
              <p className="mt-3 text-center text-xs text-black/40">
                Connect your wallet to send messages
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
