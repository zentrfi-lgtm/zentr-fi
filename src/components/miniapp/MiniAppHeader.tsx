"use client";

import * as React from "react";
import { useAccount } from "wagmi";

export function MiniAppHeader() {
  const { address, isConnected } = useAccount();

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border)] bg-white">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-[color:var(--z-blue)] flex items-center justify-center">
          <svg viewBox="0 0 64 64" className="h-4 w-4" fill="none" aria-hidden="true">
            <path
              d="M7 34.5h13.8l10.2 19.2c.6 1.1 1.7 1.8 3 1.8h4.2l-6.6-22.8H53c2.8 0 5-2.2 5-5s-2.2-5-5-5H31.6l6.6-22.8H34c-1.3 0-2.4.7-3 1.8L20.8 21.5H7c-1.4 0-2.5 1.1-2.5 2.5v8c0 1.4 1.1 2.5 2.5 2.5Z"
              fill="white"
              fillOpacity="0.92"
            />
          </svg>
        </div>
        <span className="font-[family-name:var(--font-kanit)] text-lg font-semibold text-black">
          Zentrfi
        </span>
      </div>
      {isConnected && address && (
        <div className="rounded-full border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-1 text-xs text-black/60">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      )}
    </header>
  );
}
