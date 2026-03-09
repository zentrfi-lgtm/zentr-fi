import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/src/components/navbar/Navbar";
import { AirplaneIcon } from "@/src/components/icons/AirplaneIcon";

function SectionCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
      <div className="font-[family-name:var(--font-kanit)] text-lg text-black">{title}</div>
      <div className="mt-2 text-sm leading-7 text-black/70">{body}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="relative overflow-hidden rounded-[2.2rem] border border-[color:var(--border)] bg-white p-8">
          <div className="pointer-events-none absolute -right-24 -top-24 opacity-20">
            <Image src="/airplane-bg.svg" alt="" width={720} height={480} />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1 text-xs text-black/70">
            <AirplaneIcon className="h-4 w-4 text-[color:var(--z-blue)]" />
            Privacy
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-kanit)] text-4xl tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/70">
            Zentrfi (Zentra Finance) is a Web4 AI travel planning swarm. This page explains what we
            collect in this demo UI, how it’s used, and what we recommend for production-grade
            compliance (encryption, least-privilege, and secure identity handling).
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--z-blue)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
            >
              Start Planning
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-black/5"
            >
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <SectionCard
            title="Data we collect (demo UI)"
            body="In this prototype, any trip prompts and booking details you enter are used to simulate planning and booking flows. The API routes are mocked and exist for UI realism."
          />
          <SectionCard
            title="Booking identity requirements"
            body="For real airline bookings, providers typically require Secure Flight fields (legal name, DOB, gender) plus contact info for ticket delivery and gate alerts."
          />
          <SectionCard
            title="Crypto settlement + wallet info"
            body="When you connect a wallet, we can display your address and request a mock signature for an escrow-style authorization step. We do not store private keys."
          />
          <SectionCard
            title="Security model (recommended)"
            body="Use encryption-at-rest for identity fields, short-lived access tokens, strict audit logs, and role-based access controls. Store only what’s needed for fulfillment."
          />
        </div>

        <div className="mt-10 rounded-[2.2rem] border border-[color:var(--border)] bg-white p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="text-xs font-medium uppercase tracking-widest text-black/60">
                Notes for 2026 identity
              </div>
              <h2 className="mt-3 font-[family-name:var(--font-kanit)] text-3xl tracking-tight">
                Digital Travel Credentials (DTC)
              </h2>
              <p className="mt-3 text-sm leading-7 text-black/70">
                If you integrate DTC/KYC providers, treat identity as a secure enclave: minimize
                exposure, keep verification proofs separate from user-entered data, and restrict
                access to only the booking worker and compliance services.
              </p>
            </div>
            <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6">
              <div className="text-sm font-medium text-black/80">Contact</div>
              <p className="mt-2 text-sm leading-7 text-black/70">
                For privacy questions, contact support via your project’s preferred channel. (Replace
                this with your actual support email/URL when you deploy.)
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-white px-3 py-2 text-xs text-black/60">
                <span className="font-mono">Last updated:</span> {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[color:var(--border)] bg-[#08054b] py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-white sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>© {new Date().getFullYear()} Zentrfi (Zentra Finance)</div>
          <div className="flex items-center justify-center gap-4">
            <a className="hover:text-black" href="/terms">
              Terms
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

