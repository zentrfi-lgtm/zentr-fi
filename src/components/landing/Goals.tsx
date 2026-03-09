"use client";

import * as React from "react";
import { AirplaneIcon } from "@/src/components/icons/AirplaneIcon";

const goals = [
  {
    title: "1‑Prompt planning",
    body: "Users describe intent; the swarm extracts constraints and generates viable itineraries.",
  },
  {
    title: "Autonomous negotiation",
    body: "Agents query providers, compare offers, and negotiate for hidden rates where possible.",
  },
  {
    title: "Budget safety",
    body: "The Auditor monitors spend in real-time and enforces budget constraints across the pipeline.",
  },
  {
    title: "Crypto‑native settlement",
    body: "Escrow + on-chain settlement on Base enables instant confirmation and machine-to-machine payments.",
  },
];

export function Goals() {
  return (
    <section className="mt-20">
      <div className="rounded-[2.2rem] border border-[color:var(--border)] bg-white p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1 text-xs text-black/70">
          <AirplaneIcon className="h-4 w-4 text-[color:var(--z-blue)]" />
          Goals
        </div>
        <h3 className="mt-4 font-[family-name:var(--font-kanit)] text-3xl tracking-tight sm:text-4xl">
          Build the first Web4 travel entity that can execute end‑to‑end.
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-black/70">
          Zentrfi is designed as an autonomous orchestration layer. The UI communicates intent, the swarm
          coordinates actions, and settlement moves on-chain.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {goals.map((g) => (
            <div
              key={g.title}
              className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6"
            >
              <div className="font-[family-name:var(--font-kanit)] text-lg text-black">
                {g.title}
              </div>
              <div className="mt-2 text-sm leading-7 text-black/70">{g.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

