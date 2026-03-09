import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/src/components/navbar/Navbar";
import { AirplaneIcon } from "@/src/components/icons/AirplaneIcon";

function Clause({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
      <div className="font-[family-name:var(--font-kanit)] text-lg text-black">{title}</div>
      <div className="mt-2 text-sm leading-7 text-black/70">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-[color:var(--border)] bg-white p-8">
          <div className="pointer-events-none absolute -left-24 -top-24 opacity-20">
            <Image src="/airplane-bg.svg" alt="" width={720} height={480} />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1 text-xs text-black/70">
            <AirplaneIcon className="h-4 w-4 text-[color:var(--z-blue)]" />
            Terms
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-kanit)] text-4xl tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/70">
            These terms are written for the Zentrfi demo UI. Replace with counsel-reviewed terms
            before production. The experience simulates AI agents, escrow signing, and autonomous
            booking execution.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-black/5"
            >
              Read Privacy
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--z-blue)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Clause title="1) Prototype status">
            The dashboard and API routes are mocked for UX demonstration. 
          </Clause>
          <Clause title="2) Wallet signatures">
            Wallet connection and signatures are used to demonstrate a crypto-native “escrow
            authorization” step. You are responsible for verifying what you sign in any real
            deployment.
          </Clause>
          <Clause title="3) Booking details">
            If you enter identity and contact details, do not treat this prototype as a secure vault.
            In production, these fields should be encrypted and subject to strict access controls.
          </Clause>
          <Clause title="4) Availability and accuracy">
            AI-generated recommendations can be incomplete or wrong. Always review options and
            verify constraints (budget, dates, documents) before confirming.
          </Clause>
          <Clause title="5) Acceptable use">
            Don’t attempt abuse (scraping, attacks, automated load) or use the platform for unlawful
            purposes. We may restrict access to protect the service.
          </Clause>
          <Clause title="6) Contact + updates">
            Replace this section with your operational contact and change log policy before
            launching.
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-white px-3 py-2 text-xs text-black/60">
              <span className="font-mono">Last updated:</span> {new Date().toLocaleDateString()}
            </div>
          </Clause>
        </div>
      </main>

      <footer className="border-t border-[color:var(--border)] bg-[#08054b] py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-white sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>© {new Date().getFullYear()} Zentrfi (Zentra Finance)</div>
          <div className="flex items-center justify-center gap-4">
            <a className="hover:text-black" href="/privacy">
              Privacy
            </a>
            <a
              className="hover:text-black"
              href="https://x.com/ZentrFi"
              target="_blank"
              rel="noopener noreferrer"
            >
              X / Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

