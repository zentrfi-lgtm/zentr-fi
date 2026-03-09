# Zentrfi — AI-Powered Web4 Travel Platform

> **Travel Planned by AI. Executed by Autonomous Agents.**

Zentrfi is a Web4 travel orchestration platform where users describe a trip in plain language and an autonomous AI agent swarm handles the rest — searching live flight offers, verifying budgets, and executing bookings with crypto-native settlement and an escrow-style flow.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Agent Swarm](#agent-swarm)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Feature Flags](#feature-flags)
- [API Routes](#api-routes)
- [Deployment](#deployment)

---

## Overview

Zentrfi replaces the traditional travel booking flow with a single natural-language prompt. The platform's AI swarm decomposes the intent, queries live airline inventory via the Duffel API, enforces the user's budget, and places the booking — all within a single conversation interface.

Wallet connection (via RainbowKit / WalletConnect) is required to authorise the escrow-style payment step. Every completed booking is persisted to MongoDB against the user's wallet address, and the full conversation can be restored from the sidebar at any time.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **AI / LLM** | Anthropic Claude, Groq, Google Gemini |
| **Flight Data** | [Duffel API](https://duffel.com) |
| **Wallet / Web3** | wagmi v2, RainbowKit, viem, WalletConnect |
| **Database** | MongoDB Atlas (native driver + Mongoose) |
| **Email** | Nodemailer + Gmail SMTP |
| **Animation** | Framer Motion |
| **Map** | Mapbox GL JS, Leaflet |
| **Social / Web3** | Farcaster (Neynar, MiniApp SDK), XMTP |
| **Payments** | Duffel Payments (balance / payment intent) |
| **Bots** | grammY (Telegram), Neynar (Farcaster) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        User                             │
│   Natural language prompt → Origin airport selection    │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│               AI Intent Parser                          │
│   /api/plan-trip  ·  Anthropic / Groq / Gemini          │
│   Extracts: origin, destination, date, budget           │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Agent Swarm                            │
│  Scout → Logician → Auditor → Negotiator                │
│  (Orchestrated within the planning pipeline)            │
└───────────┬──────────────────────────────┬──────────────┘
            │                              │
            ▼                              ▼
┌───────────────────────┐    ┌─────────────────────────────┐
│    Duffel Offers API  │    │   Place Autocomplete API    │
│  /api/flights/search  │    │   /api/flights/places       │
└───────────┬───────────┘    └─────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│            Booking & Payment Layer                      │
│  /api/payments/payment-intent  (Duffel Payment Intent)  │
│  /api/book-flight              (Duffel Orders API)      │
│  Balance payment (test) / Payment Intent (production)   │
└───────────┬─────────────────────────────┬───────────────┘
            │                             │
            ▼                             ▼
┌───────────────────────┐    ┌─────────────────────────────┐
│  MongoDB Atlas        │    │  Gmail SMTP (Nodemailer)    │
│  TripSession (Mongoose│    │  Branded confirmation email │
│  bookings (native)    │    │  sent to passenger          │
└───────────────────────┘    └─────────────────────────────┘
```

---

## Agent Swarm

| Agent | Role |
|---|---|
| **Scout** | Discovers destinations and surfaces live travel trends |
| **Logician** | Designs the optimal itinerary balancing time, stops, and constraints |
| **Auditor** | Enforces the budget and manages the swarm wallet for premium data |
| **Negotiator** | Interfaces with Duffel to secure the best rate and execute the booking |

---

## Features

- **1-prompt planning** — describe a trip in natural language; the swarm extracts origin, destination, date and budget
- **Live flight offers** — real-time inventory from Duffel Airlines API
- **Wallet-gated booking** — RainbowKit connect required before the booking form is shown
- **Booking form** — full passenger details (name, DOB, gender, email, phone, address) with inline validation
- **Payment scheduling** — Duffel balance payment in test mode; payment intent in production
- **Branded confirmation email** — sent to passenger via Gmail SMTP after every successful booking
- **Trip history sidebar** — all sessions stored in MongoDB per wallet address; click any item to fully restore the conversation, offers, and confirmation
- **Interactive map** — Mapbox GL renders origin → destination route after booking
- **Farcaster integration** — MiniApp, Frames v2, bot notifications via Neynar
- **XMTP messaging** — wallet-to-wallet itinerary sharing (feature-flagged)
- **Telegram bot** — grammY-powered booking assistant
- **Live market data** — flight price snapshot on the landing page
- **Auto-scroll & UX** — smooth scroll to booking form when a flight is selected, persistent origin-select banner, infinite typewriter animation on landing

---

## Project Structure

```
zentrifi/
├── app/
│   ├── api/
│   │   ├── book-flight/          # Duffel order creation + email + MongoDB save
│   │   ├── flights/
│   │   │   ├── market/           # Live market snapshot
│   │   │   ├── places/           # Duffel place autocomplete
│   │   │   └── search/           # Duffel offer search
│   │   ├── geo/                  # Country / state lookup
│   │   ├── payments/
│   │   │   └── payment-intent/   # Duffel payment intent creation
│   │   ├── plan-trip/            # AI intent parser
│   │   ├── trip-history/         # MongoDB session GET + POST
│   │   ├── watchlist/            # Price alert watchlist
│   │   ├── cron/                 # Scheduled jobs (price alerts, channel posts)
│   │   └── webhook/              # Farcaster + MiniApp webhooks
│   ├── dashboard/                # Main dashboard page
│   ├── miniapp/                  # Farcaster MiniApp pages
│   ├── privacy/ & terms/
│   └── page.tsx                  # Landing page
│
├── src/
│   ├── components/
│   │   ├── chat/                 # BookingDetailsForm, TravelOptionCard
│   │   ├── dashboard/            # DashboardShell, LocationModal
│   │   ├── hero/                 # Hero, HeroParticles, HeroScene
│   │   ├── landing/              # AgentRolesTypewriter, FlowDiagram, FAQ, Goals, LiveMarket
│   │   ├── map/                  # MapPanel (Mapbox + Leaflet)
│   │   ├── miniapp/              # Farcaster MiniApp components
│   │   ├── motion/               # Reveal scroll animation
│   │   ├── navbar/               # Navbar
│   │   └── cards/                # AgentCard
│   ├── server/
│   │   ├── duffel.ts             # Duffel SDK client
│   │   ├── mailer.ts             # Nodemailer + branded email template
│   │   ├── mongo.ts              # Mongoose connection singleton
│   │   ├── mongodb.ts            # Native MongoDB driver connection
│   │   └── models/
│   │       └── TripSession.ts    # Mongoose schema (wallet, messages, offers, confirmation)
│   ├── services/
│   │   └── travel.ts             # Client-side API service functions
│   ├── lib/
│   │   ├── featureFlags.ts       # NEXT_PUBLIC_FF_* feature flags
│   │   └── bot/                  # Farcaster bot utilities
│   └── types/
│       └── travel.ts             # Shared TypeScript types
│
└── public/
    ├── IMG_6410.MP4              # Hero background video
    └── airplane-bg.svg
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Duffel](https://duffel.com) account (test mode supported)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A [WalletConnect](https://walletconnect.com) project ID
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for SMTP

### Installation

```bash
# Clone the repo
git clone https://github.com/zentrfi-lgtm/zentr-fi.git
cd zentr-fi

# Install dependencies
npm install

# Copy the example env file and fill in your values
cp envexample.txt .env

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env` file in the project root. All required variables:

```env
# ── Duffel (flight booking) ────────────────────────────────────
NEXT_PUBLIC_DUFFEL_TOKEN=duffel_test_...

# ── WalletConnect ──────────────────────────────────────────────
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...

# ── AI / LLM ──────────────────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_GEMINI_API_KEY=...

# ── MongoDB ────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://...

# ── Email (Gmail SMTP) ─────────────────────────────────────────
SMTP_USER=you@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx   # Gmail App Password (no spaces)

# ── Farcaster / Neynar ─────────────────────────────────────────
NEYNAR_API_KEY=...
NEYNAR_WEBHOOK_SECRET=...
BOT_SIGNER_UUID=...

# ── App URL ────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://www.zentrfi.com
```

> **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## Feature Flags

Feature flags are controlled via `NEXT_PUBLIC_FF_*` env vars. Set to `"true"` to enable.

| Flag | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_FF_TRIP_HISTORY` | `true` | Persistent trip history sidebar (requires MongoDB) |
| `NEXT_PUBLIC_FF_XMTP` | `false` | XMTP wallet-to-wallet messaging |
| `NEXT_PUBLIC_FF_ENS_RESOLVE` | `false` | ENS / Base name resolution |
| `NEXT_PUBLIC_FF_FRAMES_V2` | `false` | Farcaster Frames v2 interactive booking |
| `NEXT_PUBLIC_FF_MULTICHAIN_PAY` | `false` | Multi-chain crypto payments |

---

## API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/plan-trip` | Parse natural language prompt → origin, destination, date, budget |
| `POST` | `/api/flights/search` | Search live Duffel flight offers |
| `GET` | `/api/flights/places` | Duffel place / airport autocomplete |
| `GET` | `/api/flights/market` | Live market flight price snapshot |
| `POST` | `/api/payments/payment-intent` | Create a Duffel payment intent |
| `POST` | `/api/book-flight` | Create Duffel order, save to MongoDB, send email |
| `GET` | `/api/trip-history?wallet=0x…` | Fetch trip sessions for a wallet |
| `POST` | `/api/trip-history` | Create or update a trip session |
| `GET/POST` | `/api/watchlist` | Manage price alert watchlist |
| `GET` | `/api/geo/countries` | Country list |
| `GET` | `/api/geo/states` | States for a country |
| `POST` | `/api/webhook/farcaster` | Farcaster webhook handler |
| `POST` | `/api/webhook/miniapp` | Farcaster MiniApp webhook handler |
| `GET` | `/api/cron/price-alerts` | Cron: check and fire price alerts |
| `GET` | `/api/cron/channel-posts` | Cron: publish Farcaster channel posts |

---

## Deployment

The project is designed to deploy on **Vercel**.

```bash
# Production build
npm run build

# Start production server
npm start
```

1. Push to your GitHub repository
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables from the table above in the Vercel dashboard
4. Set `NEXT_PUBLIC_FF_TRIP_HISTORY=true` and any other flags you want enabled
5. Deploy — Vercel handles the Next.js App Router automatically

---

## Social

- **X / Twitter** — [@ZentrFi](https://x.com/ZentrFi)
- **Farcaster** — [/zentrfi](https://farcaster.xyz/zentrfi)

---

## License

© 2026 Zentrfi (Zentra Finance). All rights reserved.
