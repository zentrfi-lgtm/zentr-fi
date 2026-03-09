"use client";

import * as React from "react";

const faqs: Array<{ q: string; a: string }> = [
  {
    q: "What is Zentrfi?",
    a: "Zentrfi (Zentra Finance) is a Web4 travel orchestration UI where multiple specialized AI agents collaborate to plan, optimize, negotiate, and execute bookings.",
  },
  {
    q: "Is this a real booking engine right now?",
    a: "The UI is real.",
  },
  {
    q: "Why do I need to select my current city?",
    a: "Browsers can’t reliably pinpoint location on desktop/mobile without explicit permission and accuracy varies. City selection gives us clean, predictable routing for maps + pricing.",
  },
  {
    q: "Which agents are in the swarm?",
    a: "Scout (discovery), Logician (routing/optimization), Auditor (budget + wallet), Negotiator (provider interaction + execution).",
  },
  {
    q: "Does Zentrfi store my booking identity details?",
    a: "In production, identity fields must be encrypted and protected under strict access controls. This prototype is a UX simulation and should not be treated as a vault.",
  },
  {
    q: "How does the escrow step work?",
    a: "The wallet signature demonstrates an escrow-style authorization. Later you’ll connect it to an on-chain escrow contract on Base for real settlement.",
  },
  {
    q: "Can the swarm pay for premium data?",
    a: "That’s the Web4 model: the swarm has economic agency. It can pay for higher-fidelity data feeds and settle bookings using crypto-native rails.",
  },
  {
    q: "Do you support hotels and activities?",
    a: "The architecture is multi-provider by design. Flights are the first workflow; hotels and activities can be added using the same agent pipeline.",
  },
  {
    q: "What networks are supported?",
    a: "WalletConnect is configured for Base (and Base Sepolia). You can expand chains later if needed.",
  },
  {
    q: "What do I need to enable live prices?",
    a: "Configure a flight pricing provider in the backend (API key). The landing page and dashboard will automatically switch from placeholders to live data once configured.",
  },
];

export function FAQ() {
  return (
    <section className="mt-20">
      <div className="rounded-[2.2rem] border border-[color:var(--border)] bg-white p-8">
        <div className="text-xs font-medium uppercase tracking-widest text-black/60">FAQ</div>
        <h3 className="mt-3 font-[family-name:var(--font-kanit)] text-3xl tracking-tight sm:text-4xl">
          Questions people ask before trusting an autonomous swarm
        </h3>

        <div className="mt-8 grid gap-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-sm font-semibold text-black">{f.q}</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-white text-black/70 group-open:rotate-45 transition">
                  +
                </span>
              </summary>
              <div className="mt-3 text-sm leading-7 text-black/70">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

