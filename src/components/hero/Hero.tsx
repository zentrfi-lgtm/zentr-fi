"use client";

import Link from "next/link";
import * as React from "react";
import { motion } from "framer-motion";
import { HeroParticles } from "./HeroParticles";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* ── Background video ── */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source src="/IMG_6410.MP4" type="video/mp4" />
      </video>

      {/* ── Dark inset overlay — keeps text legible over any video content ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
      {/* Subtle vignette on the sides */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />

      {/* Particle layer kept on top for depth */}
      <HeroParticles />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-28 pt-20 sm:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="text-white">
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--z-blue)] shadow-[0_0_18px_rgba(0,0,254,0.8)]" />
              Web4 AI travel orchestration
            </motion.div>

            <motion.h1
  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
  transition={{ delay: 0.05, duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
  className="mt-6 font-[family-name:var(--font-kanit)] text-4xl leading-[1.05] tracking-tight sm:text-5xl"
>
  <span className="flex items-center gap-3">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-plane h-6 w-6 text-primary"
    >
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>
    </svg>

    Travel Planned by AI.
  </span>

  
  Executed by Autonomous Agents.
</motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 max-w-xl text-base leading-7 text-white/75"
            >
              Describe your trip in natural language. Zentrfi’s swarm analyzes, optimizes, negotiates,
              and books using crypto-native settlement and an escrow-like flow.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 flex w-full justify-center sm:justify-start"
            >
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-[0_18px_60px_rgba(0,0,254,0.35)] hover:brightness-110"
              >
                Start Planning
              </Link>
            </motion.div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/10 to-white/0 blur-2xl" />
            <div className="relative rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-white/70">Zentrfi</div>
                <div className="text-xs text-white/60">Sample prompt</div>
              </div>
              {/* <div className="mt-4 grid gap-3">
                {[
                  ["Scout", "Scanning destinations & trends…"],
                  ["Logician", "Calculating optimal route…"],
                  ["Negotiator", "Searching airline nodes…"],
                  ["Auditor", "Verifying budget & escrow…"],
                ].map(([title, subtitle]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div>
                      <div className="font-[family-name:var(--font-kanit)] text-sm text-white">
                        {title}
                      </div>
                      <div className="text-xs text-white/60">{subtitle}</div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-[#0009fd] shadow-[0_0_18px_rgba(0,0,254,0.8)]" />
                  </div>
                ))}
              </div> */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-xs text-white/70">
                Example prompt:{" "}
                <span className="text-white/90">
                  “I want to travel from Florida to New York this month with a $350 budget.”
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

