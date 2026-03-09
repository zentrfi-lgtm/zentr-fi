"use client";

import * as React from "react";
import { motion } from "framer-motion";

/* ── tiny helpers ──────────────────────────────────────────── */

function Arrow({ vertical = false }: { vertical?: boolean }) {
  return vertical ? (
    <div className="flex flex-col items-center gap-0">
      <div className="h-6 w-px bg-gradient-to-b from-[color:var(--z-blue)]/60 to-[color:var(--z-blue)]/10" />
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="text-[color:var(--z-blue)]/40">
        <path d="M0 0L5 6L10 0" fill="currentColor" />
      </svg>
    </div>
  ) : (
    <div className="flex items-center gap-0">
      <div className="h-px w-6 bg-gradient-to-r from-[color:var(--z-blue)]/60 to-[color:var(--z-blue)]/10" />
      <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="text-[color:var(--z-blue)]/40">
        <path d="M0 0L6 5L0 10" fill="currentColor" />
      </svg>
    </div>
  );
}

interface BoxProps {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  accent?: string;
  delay?: number;
  badge?: string;
}

function Box({ icon, label, sub, accent = "var(--z-blue)", delay = 0, badge }: BoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-white px-4 py-4 text-center shadow-sm"
    >
      {badge && (
        <span
          className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-white"
          style={{ backgroundColor: accent }}
        >
          {badge}
        </span>
      )}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </div>
      <div className="text-[11px] font-semibold leading-tight text-black/80">{label}</div>
      {sub && <div className="text-[10px] leading-tight text-black/45">{sub}</div>}
    </motion.div>
  );
}

/* ── icons (inline SVG, no extra deps) ─────────────────────── */

const IcUser = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const IcBrain = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M12 2C8.5 2 6 4.2 6 7c0 1.3.5 2.5 1.3 3.4C5.9 11.4 5 12.9 5 14.5 5 17 7 19 9.5 19H10v3h4v-3h.5C17 19 19 17 19 14.5c0-1.6-.9-3.1-2.3-4.1C17.5 9.5 18 8.3 18 7c0-2.8-2.5-5-6-5zm0 2c2.8 0 4 1.5 4 3s-1.5 2.5-4 3-4-1-4-3 1.2-3 4-3z" />
  </svg>
);
const IcSearch = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
const IcRoute = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 12h18M3 6h6m6 0h6M3 18h6m6 0h6" />
  </svg>
);
const IcShield = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 3L4 7v6c0 5.25 3.75 10.16 8 11 4.25-.84 8-5.75 8-11V7L12 3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const IcHandshake = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M15 12l-3-3-3 3" />
    <path d="M3 9l4 4 2-2 4 4 2-2 4 4" />
  </svg>
);
const IcPlane = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);
const IcPayment = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M2 10h20" />
  </svg>
);
const IcMail = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);
const IcChain = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IcMap = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);
const IcFarcaster = () => (
  <svg viewBox="0 0 1000 1000" className="h-4 w-4" fill="currentColor">
    <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z" />
    <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" />
    <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.444H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z" />
  </svg>
);

/* ── Connector line between swim-lane rows ─────────────────── */
function VertConnector({ label, delay = 0 }: { label?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col items-center gap-1 py-1"
    >
      <div className="h-5 w-px bg-[color:var(--z-blue)]/30" />
      {label && (
        <span className="rounded-full border border-[color:var(--z-blue)]/20 bg-[color:var(--z-blue)]/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-widest text-[color:var(--z-blue)]">
          {label}
        </span>
      )}
      <div className="h-5 w-px bg-[color:var(--z-blue)]/30" />
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none" className="text-[color:var(--z-blue)]/40">
        <path d="M0 0L4 5L8 0" fill="currentColor" />
      </svg>
    </motion.div>
  );
}

/* ── Lane wrapper ───────────────────────────────────────────── */
function Lane({
  label,
  color,
  children,
  delay = 0,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-4"
    >
      {/* Lane label strip */}
      <div
        className="absolute left-0 top-0 flex h-full w-7 items-center justify-center rounded-l-2xl"
        style={{ backgroundColor: `${color}18` }}
      >
        <span
          className="origin-center -rotate-90 whitespace-nowrap text-[9px] font-semibold uppercase tracking-[0.15em]"
          style={{ color }}
        >
          {label}
        </span>
      </div>
      <div className="ml-7">{children}</div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main component
══════════════════════════════════════════════════════════════ */
export function FlowDiagram() {
  return (
    <section className="mt-20">
      <div className="rounded-[2.2rem] border border-[color:var(--border)] bg-white p-6 sm:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1 text-xs text-black/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--z-blue)]" />
            Platform Architecture
          </div>
          <h3 className="mt-4 font-[family-name:var(--font-kanit)] text-3xl tracking-tight sm:text-4xl">
            How Zentrifi works — end to end.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">
            From a single natural-language prompt to a confirmed ticket in your inbox. Every
            layer is visible here.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-col gap-0">

          {/* ── LAYER 1: User ──────────────────────────────────── */}
          <Lane label="User" color="#0000fe" delay={0.05}>
            <div className="flex items-center gap-3">
              <Box
                icon={<IcUser />}
                label="Natural Language Prompt"
                sub={'e.g. "Fly me from LA to NYC in March under $300"'}
                accent="#0000fe"
                delay={0.08}
              />
              <Arrow />
              <Box
                icon={<IcBrain />}
                label="Intent Extracted"
                sub="origin · destination · date · budget"
                accent="#0000fe"
                delay={0.12}
              />
              <Arrow />
              <Box
                icon={<IcMap />}
                label="Origin Airport Selected"
                sub="Duffel Place Autocomplete + MapBox"
                accent="#0000fe"
                delay={0.16}
              />
            </div>
          </Lane>

          <VertConnector label="orchestrate" delay={0.2} />

          {/* ── LAYER 2: AI / API ──────────────────────────────── */}
          <Lane label="AI & APIs" color="#8b5cf6" delay={0.22}>
            <div className="flex items-center gap-3">
              <Box
                icon={<IcBrain />}
                label="AI Intent Parser"
                sub="/api/plan-trip · OpenAI"
                accent="#8b5cf6"
                delay={0.25}
              />
              <Arrow />
              <Box
                icon={<IcPlane />}
                label="Flight Search"
                sub="/api/flights/search · Duffel Offers"
                accent="#8b5cf6"
                delay={0.28}
              />
              <Arrow />
              <Box
                icon={<IcSearch />}
                label="Place Autocomplete"
                sub="/api/flights/places · Duffel Places"
                accent="#8b5cf6"
                delay={0.31}
              />
            </div>
          </Lane>

          <VertConnector label="swarm" delay={0.35} />

          {/* ── LAYER 3: Agent Swarm ───────────────────────────── */}
          <Lane label="Agent Swarm" color="#10b981" delay={0.37}>
            <div className="flex flex-wrap items-center gap-3">
              <Box
                icon={<IcSearch />}
                label="Scout"
                sub="Scans destinations & trends"
                accent="#3b82f6"
                badge="Agent"
                delay={0.40}
              />
              <Arrow />
              <Box
                icon={<IcRoute />}
                label="Logician"
                sub="Calculates optimal route"
                accent="#8b5cf6"
                badge="Agent"
                delay={0.43}
              />
              <Arrow />
              <Box
                icon={<IcShield />}
                label="Auditor"
                sub="Enforces budget & escrow"
                accent="#10b981"
                badge="Agent"
                delay={0.46}
              />
              <Arrow />
              <Box
                icon={<IcHandshake />}
                label="Negotiator"
                sub="Executes booking"
                accent="#0000fe"
                badge="Agent"
                delay={0.49}
              />
            </div>
          </Lane>

          <VertConnector label="execute" delay={0.52} />

          {/* ── LAYER 4: Booking & Payment ─────────────────────── */}
          <Lane label="Booking & Payment" color="#f59e0b" delay={0.54}>
            <div className="flex flex-wrap items-center gap-3">
              <Box
                icon={<IcPayment />}
                label="Payment Intent"
                sub="/api/payments/payment-intent · Duffel"
                accent="#f59e0b"
                delay={0.57}
              />
              <Arrow />
              <Box
                icon={<IcPlane />}
                label="Order Created"
                sub="/api/book-flight · Duffel Orders API"
                accent="#f59e0b"
                delay={0.60}
              />
              <Arrow />
              <Box
                icon={<IcChain />}
                label="On-chain Settlement"
                sub="Base · smart-contract escrow"
                accent="#f59e0b"
                delay={0.63}
              />
            </div>
          </Lane>

          <VertConnector label="confirm" delay={0.66} />

          {/* ── LAYER 5: Confirmation ─────────────────────────── */}
          <Lane label="Confirmation" color="#ef4444" delay={0.68}>
            <div className="flex flex-wrap items-center gap-3">
              <Box
                icon={<IcMail />}
                label="Email Receipt"
                sub="Gmail SMTP · Nodemailer · branded template"
                accent="#ef4444"
                delay={0.71}
              />
              <Arrow />
              <Box
                icon={<IcFarcaster />}
                label="Farcaster Notification"
                sub="Web3 social push via Farcaster bot"
                accent="#8b5cf6"
                delay={0.74}
              />
              <Arrow />
              <Box
                icon={<IcRoute />}
                label="Trip History Logged"
                sub="/api/trip-history · persisted"
                accent="#ef4444"
                delay={0.77}
              />
            </div>
          </Lane>
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 flex flex-wrap gap-4 border-t border-[color:var(--border)] pt-6"
        >
          {[
            { color: "#0000fe", label: "User Interface" },
            { color: "#8b5cf6", label: "AI & Duffel APIs" },
            { color: "#10b981", label: "Autonomous Agents" },
            { color: "#f59e0b", label: "Booking & Payment" },
            { color: "#ef4444", label: "Notifications & History" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-black/60">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
