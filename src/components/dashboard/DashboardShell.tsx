"use client";

import Link from "next/link";
import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ProfileModal } from "@/src/components/profile/ProfileModal";
import { useProfile } from "@/src/hooks/useProfile";
import { useResolvedName } from "@/src/hooks/useResolvedName";
import {
  planTrip,
  bookFlight,
  getTripHistory,
  searchFlights,
  saveSession,
} from "@/src/services/travel";
import type { BookingDetails, TravelOption, TripHistoryItem, ChatMessage } from "@/src/types/travel";
import { MapPanel } from "@/src/components/map/MapPanel";
import { TravelOptionCard } from "@/src/components/chat/TravelOptionCard";
import { BookingDetailsForm } from "@/src/components/chat/BookingDetailsForm";
import { LocationModal } from "@/src/components/dashboard/LocationModal";
import { ShareItinerary } from "@/src/components/xmtp/ShareItinerary";
import { XmtpChatPanel } from "@/src/components/xmtp/XmtpChatPanel";

/* ── helpers ─────────────────────────────────────────────── */
function shortAddress(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

const BOOT_MSG: ChatMessage = {
  id: "m-boot",
  role: "agent",
  kind: "status",
  text: "Describe your trip. I'll orchestrate the swarm simulation and generate options.",
};

const agentStatuses = [
  "Scout scanning destinations…",
  "Logician calculating optimal routes…",
  "Negotiator searching airline deals…",
  "Auditor verifying budget & constraints…",
];

/* ── component ───────────────────────────────────────────── */
export function DashboardShell() {
  const { address, isConnected } = useAccount();
  const queryClient = useQueryClient();
  const { profile } = useProfile(address);
  const { resolvedName } = useResolvedName(address as `0x${string}` | undefined);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  /* ── chat state ── */
  const [messages, setMessages] = React.useState<ChatMessage[]>([BOOT_MSG]);
  const [prompt, setPrompt] = React.useState("");
  const [options, setOptions] = React.useState<TravelOption[]>([]);
  const [selected, setSelected] = React.useState<TravelOption | null>(null);
  const [locationOpen, setLocationOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [detectedDestination, setDetectedDestination] = React.useState("");
  const [detectedDate, setDetectedDate] = React.useState<string | null>(null);
  const [stage, setStage] = React.useState<"idle" | "planning" | "details" | "booking" | "done">("idle");
  const [confirmation, setConfirmation] = React.useState<null | {
    confirmationId: string;
    receiptEmailSentTo: string;
  }>(null);

  /* ── session persistence ── */
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  /* ── sidebar active session highlight ── */
  const [activeSidebarId, setActiveSidebarId] = React.useState<string | null>(null);

  /* ── history (wallet-gated) ── */
  const historyQuery = useQuery({
    queryKey: ["tripHistory", address],
    queryFn: () => getTripHistory(address),
    enabled: !!address,
  });

  /* ── auto-scroll to booking form ── */
  const bookingFormRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (stage === "details" && selected && bookingFormRef.current) {
      bookingFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [stage, selected]);

  /* ── restore session from sidebar click ── */
  function restoreSession(item: TripHistoryItem) {
    setActiveSidebarId(item.id);
    setSessionId(item.id);
    setMessages(item.messages.length ? item.messages : [BOOT_MSG]);
    setOptions(item.options);
    setSelected(item.selected);
    setConfirmation(item.confirmation);
    setStage(item.confirmation ? "done" : item.selected ? "details" : "idle");
    setPrompt(item.prompt);
    setMobileOpen(false);
  }

  /* ── start a fresh conversation ── */
  function newConversation() {
    setActiveSidebarId(null);
    setSessionId(null);
    setMessages([BOOT_MSG]);
    setOptions([]);
    setSelected(null);
    setConfirmation(null);
    setStage("idle");
    setPrompt("");
    setDetectedDestination("");
    setDetectedDate(null);
    setMobileOpen(false);
  }

  /* ── plan mutation ── */
  const planMutation = useMutation({
    mutationFn: (p: string) => planTrip(p),
    onMutate: (p) => {
      setStage("planning");
      setSelected(null);
      setConfirmation(null);
      setOptions([]);
      setLocationOpen(false);
      setMessages((m) => [
        ...m,
        { id: `u-${Date.now()}`, role: "user", text: p },
        { id: `a-${Date.now()}-status`, role: "agent", kind: "status", text: agentStatuses[0] },
      ]);
    },
    onSuccess: (data) => {
      setDetectedDestination(data.parsed.destination);
      setDetectedDate(data.parsed.date);
      setStage("idle");
      setLocationOpen(true);
      setMessages((m) => [
        ...m.filter((x) => (x.role === "agent" ? x.kind !== "status" : true)),
        {
          id: `a-${Date.now()}-result`,
          role: "agent",
          kind: "location-prompt",
          text: `I parsed your destination as "${data.parsed.destination}". Select your current city/airport to fetch live Duffel offers.`,
        },
      ]);
    },
    onError: (e) => {
      setStage("idle");
      const msg = String((e as Error)?.message || e);
      const guidance =
        msg.includes("missing_fields") || msg.includes("missing")
          ? 'Try something like: "I want to travel from Florida to New York with a budget of $100."'
          : "Please try again with a bit more detail (origin, destination, and date if possible).";
      setMessages((m) => [
        ...m.filter((x) => (x.role === "agent" ? x.kind !== "status" : true)),
        { id: `a-${Date.now()}-help`, role: "agent", kind: "result", text: guidance },
      ]);
    },
  });

  /* ── search mutation ── */
  const searchMutation = useMutation({
    mutationFn: (args: { originIata: string; destinationIata: string; departureDate: string }) =>
      searchFlights({
        origin_iata: args.originIata,
        destination_iata: args.destinationIata,
        departure_date: args.departureDate,
        passengers: 1,
      }),
    onMutate: () => {
      setStage("planning");
      setOptions([]);
      setSelected(null);
      setLocationOpen(false);
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}-status2`,
          role: "agent",
          kind: "status",
          text: "Negotiator querying Duffel offers…",
        },
      ]);
    },
    onSuccess: (data) => {
      const newOptions = data.offers.map((o) => ({
        id: o.id,
        airline: o.airline,
        priceUsd: o.priceUsd,
        currency: o.currency,
        stops: o.stops,
        duration: o.duration,
        origin: o.origin,
        destination: o.destination,
      }));
      setOptions(newOptions);
      setStage("idle");
      const nextMsgs: ChatMessage[] = [
        ...messages.filter((x) => (x.role === "agent" ? x.kind !== "status" : true)),
        {
          id: `a-${Date.now()}-offers`,
          role: "agent",
          kind: "result",
          text: "Live offers ready. Select an itinerary to proceed to booking details.",
        },
      ];
      setMessages(nextMsgs);

      // Persist session to MongoDB as soon as offers arrive (wallet required)
      if (address) {
        saveSession({
          sessionId: sessionId ?? undefined,
          walletAddress: address,
          prompt,
          messages: nextMsgs,
          options: newOptions,
          selected: null,
        })
          .then(({ sessionId: sid }) => setSessionId(sid))
          .catch(console.error);
      }
    },
    onError: (e) => {
      setStage("idle");
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}-err`,
          role: "agent",
          kind: "result",
          text: `Duffel search failed: ${String((e as Error)?.message || e)}`,
        },
      ]);
    },
  });

  /* ── status cycling ── */
  React.useEffect(() => {
    if (stage !== "planning") return;
    let i = 0;
    const t = setInterval(() => {
      i = Math.min(i + 1, agentStatuses.length - 1);
      setMessages((m) => [
        ...m.filter((x) => (x.role === "agent" ? x.kind !== "status" : true)),
        { id: `a-${Date.now()}-status`, role: "agent", kind: "status", text: agentStatuses[i] },
      ]);
    }, 650);
    return () => clearInterval(t);
  }, [stage]);

  /* ── book mutation ── */
  const bookMutation = useMutation({
    mutationFn: async (input: { details: BookingDetails; paymentIntentId: string }) => {
      if (!selected) throw new Error("No option selected");
      setStage("booking");

      return await bookFlight({
        prompt,
        optionId: selected.id,
        details: input.details,
        paymentIntentId: input.paymentIntentId,
        amount: selected.priceUsd,
        currency: selected.currency ?? "USD",
        airline: selected.airline,
        origin: selected.origin.label,
        destination: selected.destination.label,
        duration: selected.duration,
        // session persistence
        walletAddress: address,
        sessionId: sessionId ?? undefined,
        messages,
        options,
        selected,
        flightMeta: {
          airline: selected.airline,
          route: `${selected.origin?.label ?? "?"} → ${selected.destination?.label ?? "?"}`,
          stops: selected.stops,
          duration: selected.duration,
        },
      });
    },
    onSuccess: (data) => {
      const conf = {
        confirmationId: data.confirmationId,
        receiptEmailSentTo: data.receiptEmailSentTo,
      };
      setConfirmation(conf);
      setStage("done");
      if (data.sessionId) setSessionId(data.sessionId);
      historyQuery.refetch();

      const nextMsgs: ChatMessage[] = [
        ...messages,
        {
          id: `a-${Date.now()}-booked`,
          role: "agent",
          kind: "result",
          text: `Booked. Confirmation ${data.confirmationId}. Receipt sent to ${data.receiptEmailSentTo}.`,
        },
      ];
      setMessages(nextMsgs);

      // Update session with final messages + confirmation
      if (address && sessionId) {
        saveSession({
          sessionId,
          walletAddress: address,
          prompt,
          messages: nextMsgs,
          options,
          selected,
          confirmation: conf,
        }).catch(console.error);
      }

      // Refresh sidebar
      queryClient.invalidateQueries({ queryKey: ["tripHistory", address] });
    },
    onError: (e) => {
      setStage("details");
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}-bookerr`,
          role: "agent",
          kind: "result",
          text: `Couldn't continue booking: ${String((e as Error)?.message || e)}`,
        },
      ]);
    },
  });

  const activeRoute = selected || options[0];

  /* ────────────────────────────────────────────────────────
     SIDEBAR CONTENT (shared between desktop + mobile drawer)
  ─────────────────────────────────────────────────────────*/
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-[color:var(--border)] px-4 py-4">
        <div className="font-[family-name:var(--font-kanit)] text-lg">Trip history</div>
        {!isConnected && (
          <div className="mt-1 text-xs text-black/50">Connect wallet to see history</div>
        )}
      </div>

      {/* New chat button */}
      <div className="border-b border-[color:var(--border)] px-3 py-2">
        <button
          type="button"
          onClick={newConversation}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--z-blue)]/40 bg-[color:var(--z-blue)]/5 px-3 py-2.5 text-xs font-semibold text-[color:var(--z-blue)] transition hover:bg-[color:var(--z-blue)]/10"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          New conversation
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3">
        {!isConnected ? (
          <div className="mt-4 flex flex-col items-center gap-3 px-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--panel)] border border-[color:var(--border)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/40" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <p className="text-xs text-black/50">Connect your wallet to view and restore past trips.</p>
          </div>
        ) : historyQuery.isLoading ? (
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-4 text-sm text-black/70">
            Loading…
          </div>
        ) : (historyQuery.data?.items ?? []).length === 0 ? (
          <div className="mt-4 px-2 text-center text-xs text-black/40">
            No trips yet. Start a conversation to save your first trip.
          </div>
        ) : (
          <div className="grid gap-2">
            {(historyQuery.data?.items ?? []).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => restoreSession(item)}
                className={[
                  "w-full rounded-2xl border px-3 py-3 text-left text-sm transition hover:bg-black/5",
                  activeSidebarId === item.id
                    ? "border-[color:var(--z-blue)]/50 bg-[color:var(--z-blue)]/8"
                    : "border-[color:var(--border)] bg-[color:var(--panel)]",
                ].join(" ")}
              >
                <div className="line-clamp-2 font-medium text-black/80">{item.prompt || "Trip"}</div>
                {item.confirmation && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-medium text-emerald-600">Booked</span>
                  </div>
                )}
                <div className="mt-1.5 text-xs text-black/40">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="h-dvh bg-white text-black">
      <div className="flex h-full flex-col">

        {/* ── Header ── */}
        <header className="sticky top-0 z-[60] flex items-center justify-between border-b border-[color:var(--border)] bg-white/85 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-white text-black/80 shadow-sm hover:bg-black/5 lg:hidden"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <Link href="/" className="hidden text-sm font-medium text-black/70 hover:text-black lg:inline">
              ← Back
            </Link>
            <div className="hidden items-center gap-2 sm:flex">
              <div className="h-2 w-2 rounded-full bg-[color:var(--z-blue)] shadow-[0_0_18px_rgba(0,0,254,0.6)]" />
              <div className="font-[family-name:var(--font-kanit)] text-sm text-black">
                Zentrfi Dashboard
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-xs text-black/60 md:block">
              {address ? `Wallet: ${resolvedName || shortAddress(address)}` : "Wallet not connected"}
            </div>
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;
                return (
                  <div
                    aria-hidden={!ready}
                    style={!ready ? { opacity: 0, pointerEvents: "none", userSelect: "none" } : undefined}
                    className="flex items-center gap-2"
                  >
                    {!connected ? (
                      <button
                        type="button"
                        onClick={openConnectModal}
                        className="inline-flex h-10 items-center justify-center rounded-2xl bg-[color:var(--z-blue)] px-4 text-sm font-semibold text-white shadow-sm hover:brightness-110"
                      >
                        Connect Wallet
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={openChainModal}
                          className="hidden h-10 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-white px-3 text-xs font-semibold text-black/80 shadow-sm hover:bg-black/5 sm:inline-flex"
                        >
                          {chain.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfileOpen(true)}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-[color:var(--border)] bg-white px-3 text-sm font-semibold text-black shadow-sm hover:bg-black/5"
                        >
                          {profile?.profilePic && (
                            <img src={profile.profilePic} alt="" className="h-5 w-5 rounded-full object-cover" />
                          )}
                          {resolvedName || account.displayName}
                        </button>
                      </>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </header>

        <LocationModal
          open={locationOpen}
          onClose={() => setLocationOpen(false)}
          detectedDestination={detectedDestination}
          detectedDate={detectedDate}
          onConfirm={({ originIata, destinationIata, departureDate }) => {
            searchMutation.mutate({ originIata, destinationIata, departureDate });
          }}
        />

        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
        />

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/30"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-[80vw] max-w-[420px] flex-col border-r border-[color:var(--border)] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-4">
                <div className="font-[family-name:var(--font-kanit)] text-lg">Menu</div>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-white text-black/80 hover:bg-black/5"
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="border-b border-[color:var(--border)] px-4 py-3">
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-[color:var(--border)] bg-white px-4 py-3 text-sm font-medium text-black hover:bg-black/5"
                >
                  ← Back to Home
                </Link>
              </div>
              <div className="min-h-0 flex-1 overflow-auto">
                <SidebarContent />
              </div>
            </aside>
          </div>
        )}

        {/* ── Main 3-column grid ── */}
        <div className="grid h-full min-h-0 grid-cols-1 gap-0 lg:grid-cols-[300px_1fr_460px]">

          {/* Desktop Sidebar */}
          <aside className="hidden min-h-0 border-r border-[color:var(--border)] lg:block">
            <SidebarContent />
          </aside>

          {/* Chat panel */}
          <section className="min-h-0 border-r border-[color:var(--border)]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="min-h-0 flex-1 overflow-auto p-4">
                <div className="grid gap-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={[
                        "max-w-[92%] rounded-3xl border px-4 py-3 text-sm leading-6",
                        m.role === "user"
                          ? "ml-auto border-[color:var(--z-blue)]/35 bg-[color:var(--z-blue)]/10"
                          : "mr-auto border-[color:var(--border)] bg-[color:var(--panel)]",
                      ].join(" ")}
                    >
                      <div className="text-xs font-medium text-black/50">
                        {m.role === "user" ? "You" : "Zentrfi Swarm"}
                      </div>
                      <div className="mt-1">{m.text}</div>
                      {m.role === "agent" && m.kind === "location-prompt" && options.length === 0 && stage === "idle" && (
                        <button
                          type="button"
                          onClick={() => setLocationOpen(true)}
                          className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-2xl bg-[color:var(--z-blue)] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill="currentColor" />
                          </svg>
                          Select origin airport →
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {options.length > 0 && (
                  <div className="mt-6 grid gap-3">
                    <div className="text-xs font-medium uppercase tracking-widest text-black/50">
                      Options
                    </div>
                    {options.map((o) => (
                      <TravelOptionCard
                        key={o.id}
                        option={o}
                        selected={selected?.id === o.id}
                        onSelect={(opt) => {
                          setSelected(opt);
                          setStage("details");
                        }}
                      />
                    ))}
                  </div>
                )}

                {stage === "details" && selected && (
                  <div ref={bookingFormRef} className="mt-6 rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-4">
                    {/* ── Wallet gate ── */}
                    {!isConnected ? (
                      <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--z-blue)]/10">
                          <svg viewBox="0 0 24 24" className="h-6 w-6 text-[color:var(--z-blue)]" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <rect x="2" y="7" width="20" height="14" rx="2" />
                            <path d="M16 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" stroke="none" />
                            <path d="M22 11V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-[family-name:var(--font-kanit)] text-base font-semibold">
                            Wallet required to book
                          </div>
                          <div className="mt-1 text-xs text-black/60">
                            Connect your wallet to authorise the escrow and complete the booking.
                          </div>
                        </div>
                        <ConnectButton />
                      </div>
                    ) : (
                      <BookingDetailsForm
                        submitting={bookMutation.isPending}
                        onSubmit={(details, paymentIntentId) =>
                          bookMutation.mutate({ details, paymentIntentId })
                        }
                        amount={selected.priceUsd}
                        currency={selected.currency ?? "USD"}
                      />
                    )}
                  </div>
                )}

                {confirmation && (
                  <div className="mt-6 rounded-3xl border border-[color:var(--z-blue)]/35 bg-[color:var(--z-blue)]/10 p-5">
                    <div className="font-[family-name:var(--font-kanit)] text-lg">
                      Booking confirmation
                    </div>
                    <div className="mt-2 text-sm text-black/70">
                      Confirmation: <span className="font-mono">{confirmation.confirmationId}</span>
                      <br />
                      Receipt sent to:{" "}
                      <span className="font-medium">{confirmation.receiptEmailSentTo}</span>
                    </div>
                    <div className="mt-3">
                      <ShareItinerary
                        confirmationId={confirmation.confirmationId}
                        route={selected ? `${selected.origin?.label ?? "Origin"} → ${selected.destination?.label ?? "Destination"}` : ""}
                        airline={selected?.airline ?? ""}
                      />
                    </div>
                  </div>
                )}

                {stage === "done" && confirmation && !mobileOpen && (
                  <div className="mt-6 lg:hidden">
                    <div className="mx-auto h-[36vh] min-h-[220px] w-[90vw] max-w-[720px]">
                      <MapPanel
                        option={
                          activeRoute
                            ? { origin: activeRoute.origin, destination: activeRoute.destination }
                            : undefined
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Destination banner */}
              {detectedDestination && !locationOpen && options.length === 0 && stage === "idle" && (
                <div className="flex items-center justify-between gap-3 border-t border-[color:var(--z-blue)]/30 bg-[color:var(--z-blue)]/8 px-4 py-2.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[color:var(--z-blue)]" fill="none" aria-hidden="true">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" fill="currentColor" />
                    </svg>
                    <span className="truncate text-xs text-black/70">
                      Destination <span className="font-semibold text-black">"{detectedDestination}"</span> — origin not yet selected
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationOpen(true)}
                    className="shrink-0 cursor-pointer rounded-xl bg-[color:var(--z-blue)] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110"
                  >
                    Select origin →
                  </button>
                </div>
              )}

              {/* Chat input */}
              <div className="border-t border-[color:var(--border)] p-3">
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const p = prompt.trim();
                    if (!p) return;
                    planMutation.mutate(p);
                  }}
                >
                  <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='Try: "Florida to California on the 7th, budget $100"'
                    className="h-11 flex-1 rounded-2xl border border-[color:var(--border)] bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-[color:var(--z-blue)]/40"
                  />
                  <button
                    type="submit"
                    disabled={planMutation.isPending}
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-[color:var(--z-blue)] px-4 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {planMutation.isPending ? "Planning…" : "Send"}
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Map panel */}
          <section className="hidden min-h-0 p-4 lg:block">
            <MapPanel
              option={
                activeRoute
                  ? { origin: activeRoute.origin, destination: activeRoute.destination }
                  : undefined
              }
            />
          </section>
        </div>
      </div>
      <XmtpChatPanel />
    </div>
  );
}
