import { Navbar } from "@/src/components/navbar/Navbar";
import { Hero } from "@/src/components/hero/Hero";
import { Reveal } from "@/src/components/motion/Reveal";
import { AgentCard } from "@/src/components/cards/AgentCard";
import Image from "next/image";
import { AirplaneIcon } from "@/src/components/icons/AirplaneIcon";
import { Goals } from "@/src/components/landing/Goals";
import { LiveMarket } from "@/src/components/landing/LiveMarket";
import { FAQ } from "@/src/components/landing/FAQ";
import { AgentRolesTypewriter } from "@/src/components/landing/AgentRolesTypewriter";
// import { FlowDiagram } from "@/src/components/landing/FlowDiagram";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <Hero />

      <main className="mx-auto w-full max-w-6xl px-4 py-20">
        <section id="agents" className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="pointer-events-none absolute -right-10 -top-10 opacity-20 blur-[0.3px]">
            <Image src="/airplane-bg.svg" alt="" width={520} height={360} priority={false} />
          </div>
          <Reveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1 text-xs text-black/70">
                Swarm Ecosystem
              </div>
              <h2 className="mt-5 font-[family-name:var(--font-kanit)] text-3xl leading-tight tracking-tight sm:text-4xl">
                A specialized AI swarm that reasons, negotiates, and executes.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-black/70">
                Zentrfi isn’t a search engine. It’s an orchestration layer where agents collaborate to
                find, optimize, budget-check, and book then deliver the ticket to your email.
          </p>
        </div>
          </Reveal>

          <Reveal delay={0.05}>
            <AgentRolesTypewriter />
          </Reveal>
        </section>

        <section className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Reveal>
            <AgentCard
              title="Scout"
              description="Discovers destinations and live travel trends from real-time signals."
              imageSrc="https://id-preview--569ddaf6-086b-470c-801a-01a684ceeb48.lovable.app/assets/agent-scout-CuDiYxN8.png"
            />
          </Reveal>
          <Reveal delay={0.05}>
            <AgentCard
              title="Logician"
              description="Designs the optimal itinerary balancing time, stops, and constraints."
              imageSrc="https://id-preview--569ddaf6-086b-470c-801a-01a684ceeb48.lovable.app/assets/agent-logician-CgShivdD.png"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <AgentCard
              title="Auditor"
              description="Tracks budget in real-time and manages the swarm wallet for premium data."
              imageSrc="https://id-preview--569ddaf6-086b-470c-801a-01a684ceeb48.lovable.app/assets/agent-auditor-DguTcNDH.png"
            />
          </Reveal>
          <Reveal delay={0.15}>
            <AgentCard
              title="Negotiator"
              description="Interacts with booking services to secure the best rate and execute the purchase."
              imageSrc="https://id-preview--569ddaf6-086b-470c-801a-01a684ceeb48.lovable.app/assets/agent-negotiator-BlMyqK78.png"
            />
          </Reveal>
        </section>

        {/* Strategic visual #1 */}
        <section className="mt-14">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2.2rem] border border-[color:var(--border)]">
              <div className="relative h-[240px] w-full sm:h-[320px]">
                <Image
                  src="https://www1.grc.nasa.gov/wp-content/uploads/ECO-150R.png"
                  alt="Aircraft operations visual"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1100px"
                    unoptimized
                />
              </div>

              <div className="relative px-6 py-7 sm:px-8 sm:py-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1 text-xs text-black/70">
                  <AirplaneIcon className="h-4 w-4 text-[color:var(--z-blue)]" />
                  Live ops simulation
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                  <div>
                    <div className="font-[family-name:var(--font-kanit)] text-2xl tracking-tight sm:text-3xl">
                      From prompt to route — then to execution.
                    </div>
                    <div className="mt-2 max-w-3xl text-sm leading-7 text-black/70">
                      Zentrfi’s swarm coordinates analysis, negotiation, and booking steps into one
                      autonomous pipeline. This UI renders the experience as a control-center flow.
                    </div>
                  </div>
                  <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
                    <div className="text-xs font-medium uppercase tracking-widest text-black/50">
                      Signal
                    </div>
                    <div className="mt-2 text-sm text-black/75">
                      Cheapest fare found → escrow authorized → booking executed → receipt delivered.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="how" className="mt-20 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <h3 className="font-[family-name:var(--font-kanit)] text-3xl tracking-tight sm:text-4xl">
              How it works
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-black/70">
              You type a prompt. The swarm runs a multi-agent pipeline. You provide Secure Flight +
              contact details. You sign an escrow-style transaction . A backend worker keeps
              checking for the cheapest option and books when conditions match.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <ol className="grid gap-3">
              {[
                "User submits travel prompt",
                "AI swarm analyzes the request",
                "Best travel options generated",
                "User provides booking details",
                "User signs escrow transaction",
                "Booking executed + ticket emailed",
              ].map((step, idx) => (
                <li
                  key={step}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--z-blue)] text-sm font-bold text-white">
                      {idx + 1}
                    </div>
                    <div className="text-sm font-medium text-black/85">
                      {step}
                    </div>
                  </div>
                  <AirplaneIcon className="h-5 w-5 text-[color:var(--z-blue)] opacity-70" />
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        <section id="web4" className="mt-20">
          <Reveal>
            <div className="rounded-[2.2rem] border border-[color:var(--border)] bg-[color:var(--panel)] p-8">
              <div className="text-xs font-medium uppercase tracking-widest text-black">
                Web4 capability — economic autonomy
              </div>

              {/* Strategic visual #2 */}
              <div className="mt-5 overflow-hidden rounded-3xl border border-[color:var(--border)] bg-white">
                <div className="relative h-[220px] w-full sm:h-[260px]">
                  <Image
                    src="https://www.lot.com/content/dam/lot/lot-com/eco-destination/eco-dest-9.coreimg.jpg/1723629530155/eco-dest-9.jpg"
                    alt="Destination inspiration"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 1100px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 py-3 text-sm text-black/70 backdrop-blur">
                    The Scout agent surfaces destinations from trends, sentiment, and live signals.
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-6 lg:grid-cols-3">
                {[
                  [
                    "Autonomous Payments",
                    "Agents can pay for premium travel data using an integrated crypto wallet.",
                  ],
                  [
                    "Smart-Contract Settlement",
                    "Bookings finalize via blockchain protocols for instant confirmation.",
                  ],
                  [
                    "M2M Negotiation",
                    "Agents talk directly to provider systems to surface hidden deals and availability.",
                  ],
                ].map(([title, body]) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-[color:var(--border)] bg-white/60 p-6"
                  >
                    <div className="font-[family-name:var(--font-kanit)] text-lg">{title}</div>
                  <div className="mt-2 text-sm leading-6 text-black/70">
                      {body}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:items-center sm:text-left">
              {/* <div className="text-sm text-black/70 sm:text-left">
                  Ready to see it in action? Launch the chat-style dashboard.
                </div> */}
                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--z-blue)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(0,0,254,0.25)] hover:brightness-110 sm:self-auto"
                >
                  Launch Dashboard
          </a>
        </div>
            </div>
          </Reveal>
        </section>

        <Goals />
        {/* <FlowDiagram /> */}
        <LiveMarket />
        <FAQ />
      </main>

      <footer className="border-t border-[color:var(--border)] text-white bg-[#08054b] py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 text-center text-sm text-white sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="text-white/70">© {new Date().getFullYear()} Zentrfi (Zentra Finance)</div>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {/* X / Twitter */}
            <a
              href="https://x.com/ZentrFi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X / Twitter"
              className="text-white/60 transition hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* Farcaster */}
            <a
              href="https://farcaster.xyz/zentrfi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Farcaster"
              className="text-white/60 transition hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1000 1000" fill="currentColor" aria-hidden="true">
                <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z"/>
                <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/>
                <path d="M675.556 746.667C663.283 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.444H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"/>
              </svg>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/zentrfi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram"
              className="text-white/60 transition hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </a>
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-4 text-white/60">
            <a className="transition hover:text-white" href="/privacy">Privacy</a>
            <a className="transition hover:text-white" href="/terms">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
