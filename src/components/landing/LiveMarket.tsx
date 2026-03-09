"use client";

import * as React from "react";
import { AirplaneIcon } from "@/src/components/icons/AirplaneIcon";

type MarketRoute = {
  id: string;
  from: string;
  to: string;
  duration: string;
  priceUsd: number;
};

export function LiveMarket() {
  const [routes, setRoutes] = React.useState<MarketRoute[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "error" | "ok">("idle");
  const [message, setMessage] = React.useState<string>("");
  const [errorTitle, setErrorTitle] = React.useState<string>("Live pricing unavailable");
  const [warning, setWarning] = React.useState<string>("");

  React.useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetch("/api/flights/market", { cache: "no-store" })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          const err = String(data?.error || `Failed to load market (${r.status})`);
          const hint = data?.hint ? `\n\n${String(data.hint)}` : "";
          throw new Error(err + hint);
        }
        return data as { routes: MarketRoute[]; warning?: string };
      })
      .then((data) => {
        if (cancelled) return;
        setRoutes(data.routes);
        setWarning(String(data.warning || ""));
        setStatus("ok");
      })
      .catch((e) => {
        if (cancelled) return;
        setStatus("error");
        const msg = String(e?.message || e);
        setMessage(msg);
        setErrorTitle(
          msg.includes("Missing NEXT_PUBLIC_DUFFEL_TOKEN")
            ? "Duffel token not found on server"
            : "Live pricing unavailable",
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-20">
      <div className="rounded-[2.2rem] border border-[color:var(--border)] bg-white p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1 text-xs text-black/70">
          <AirplaneIcon className="h-4 w-4 text-[color:var(--z-blue)]" />
          Live routes & pricing (read‑only)
        </div>
        <h3 className="mt-4 font-[family-name:var(--font-kanit)] text-3xl tracking-tight sm:text-4xl">
          Market snapshot
        </h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-black/70">
          This section is wired to the same backend services the dashboard will use. When a pricing
          provider isn’t configured yet, we’ll show a clear setup message instead of dummy data.
        </p>

        {status === "loading" && (
          <div className="mt-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6 text-sm text-black/70">
            Loading…
          </div>
        )}

        {status === "error" && (
          <div className="mt-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6 text-sm text-black/70">
            <div className="font-semibold text-black">{errorTitle}</div>
            <div className="mt-2">
              {message}
            </div>
            <div className="mt-2 text-xs text-black/60">
              If you just set <span className="font-mono">NEXT_PUBLIC_DUFFEL_TOKEN</span>, restart <span className="font-mono">npm run dev</span>.
            </div>
          </div>
        )}

        {status === "ok" && (
          <>
            {warning && (
              <div className="mt-8 rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6 text-sm text-black/70">
                <div className="font-semibold text-black">No offers available</div>
                <div className="mt-2">{warning}</div>
              </div>
            )}
            {routes.length > 0 && (
              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {routes.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-[family-name:var(--font-kanit)] text-lg text-black">
                          {r.from} → {r.to}
                        </div>
                        <div className="mt-1 text-xs text-black/60">
                          Read‑only sample from Duffel
                        </div>
                      </div>
                      <div className="rounded-2xl bg-[color:var(--z-blue)] px-3 py-1 text-xs font-semibold text-white">
                        ${r.priceUsd}
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-[color:var(--border)] bg-white/70 px-4 py-3 text-sm text-black/70">
                      Estimated duration:{" "}
                      <span className="font-medium text-black">{r.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

