"use client";

import * as React from "react";
import { useInView } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   Text nodes typed in order: title → value per agent
───────────────────────────────────────────────────────────────*/
const AGENTS = [
  { title: "Scout",      value: "Discovers destinations", color: "#3b82f6" },
  { title: "Logician",   value: "Optimises routes",       color: "#8b5cf6" },
  { title: "Auditor",    value: "Verifies budgets",       color: "#10b981" },
  { title: "Negotiator", value: "Execute bookings",       color: "#0000fe" },
] as const;

type TextNode = { agentIdx: number; kind: "title" | "value"; text: string };

const TEXT_NODES: TextNode[] = AGENTS.flatMap((a, i) => [
  { agentIdx: i, kind: "title",  text: a.title },
  { agentIdx: i, kind: "value",  text: a.value },
]);

/* Global char offset at which each node starts */
const NODE_OFFSETS: number[] = (() => {
  const out: number[] = [];
  let acc = 0;
  for (const n of TEXT_NODES) { out.push(acc); acc += n.text.length; }
  return out;
})();

const TOTAL_CHARS = TEXT_NODES.reduce((s, n) => s + n.text.length, 0);
const CHARS_PER_TICK = 1;   // 1 char at a time → true typewriter feel
const TICK_MS        = 45;  // ms between ticks

function visibleText(nodeIdx: number, globalCount: number): string {
  const start = NODE_OFFSETS[nodeIdx];
  if (globalCount <= start) return "";
  const revealed = Math.min(globalCount, start + TEXT_NODES[nodeIdx].text.length) - start;
  return TEXT_NODES[nodeIdx].text.slice(0, revealed);
}

function activeNodeIdx(globalCount: number): number {
  for (let i = TEXT_NODES.length - 1; i >= 0; i--) {
    if (globalCount > NODE_OFFSETS[i]) return i;
  }
  return 0;
}

/* ─── Blinking cursor — pure CSS inline keyframe ───────────── */
function Cursor() {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block",
        width: "2px",
        height: "0.9em",
        background: "currentColor",
        marginLeft: "1px",
        verticalAlign: "middle",
        animation: "tw-blink 0.75s steps(1) infinite",
      }}
    />
  );
}

/* ─── Component ─────────────────────────────────────────────── */
export function AgentRolesTypewriter() {
  const ref = React.useRef<HTMLDivElement>(null);
  /* fire once when 30 % of the card enters the viewport */
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const [count, setCount]   = React.useState(0);
  const [done,  setDone]    = React.useState(false);
  const [started, setStarted] = React.useState(false);

  /* Start the interval only after the element is visible */
  React.useEffect(() => {
    if (!inView || started || done) return;
    setStarted(true);
  }, [inView, started, done]);

  React.useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setCount((c) => {
        const next = c + CHARS_PER_TICK;
        if (next >= TOTAL_CHARS) {
          // briefly flash "Ready" then reset
          setDone(true);
          setTimeout(() => {
            setDone(false);
            setCount(0);
          }, 1200);
          return TOTAL_CHARS;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [started, done]);

  const activeNode = activeNodeIdx(count);

  return (
    <>
      {/* Inline keyframe for cursor blink — avoids Tailwind config dependency */}
      <style>{`
        @keyframes tw-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>

      <div
        ref={ref}
        className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--panel)] p-6"
      >
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-black/80">Agent roles</div>

          {!done ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--z-blue)]/10 px-2 py-0.5 text-[10px] font-medium text-[color:var(--z-blue)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--z-blue)]" />
              {started ? "Running swarm…" : "Standby…"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Ready
            </span>
          )}
        </div>

        {/* Agent rows */}
        <div className="mt-3 grid gap-3 text-sm text-black/70">
          {AGENTS.map((agent, agentIdx) => {
            const titleIdx = agentIdx * 2;
            const valueIdx = agentIdx * 2 + 1;

            const titleStr = visibleText(titleIdx, count);
            const valueStr = visibleText(valueIdx, count);

            const isTitleActive = !done && activeNode === titleIdx;
            const isValueActive = !done && activeNode === valueIdx;
            const isRowDone     = done || count >= NODE_OFFSETS[valueIdx] + agent.value.length;
            const rowVisible    = count > NODE_OFFSETS[titleIdx];

            return (
              <div
                key={agent.title}
                className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] bg-white/60 px-4 py-3 transition-opacity duration-300"
                style={{ opacity: rowVisible ? 1 : 0.25 }}
              >
                {/* Title (left) */}
                <span
                  className="min-w-[90px] font-[family-name:var(--font-kanit)] transition-colors duration-300"
                  style={{ color: isRowDone ? agent.color : undefined }}
                >
                  {titleStr}
                  {isTitleActive && <Cursor />}
                </span>

                {/* Value (right) */}
                <span className="text-right text-black/60">
                  {valueStr}
                  {isValueActive && <Cursor />}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-[2px] w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[color:var(--z-blue)] transition-[width] duration-75"
            style={{ width: `${(count / TOTAL_CHARS) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}
