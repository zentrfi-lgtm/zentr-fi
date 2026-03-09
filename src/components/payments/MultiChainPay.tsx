"use client";

import * as React from "react";
import { useAccount, useChainId, useSendTransaction } from "wagmi";
import { parseUnits } from "viem";
import { FF_MULTICHAIN_PAY } from "@/src/lib/featureFlags";
import {
  getSupportedChains,
  getTokenPrice,
  getMultiChainQuote,
  getTokenAddress,
  type SupportedChain,
} from "@/src/services/multichain";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

type MultiChainPayProps = {
  amount: number;   // USD
  currency: string;
  onSuccess: (txHash: string) => void;
  disabled?: boolean;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SETTLEMENT_CHAIN_ID = 8453; // Base
const CHAINS = getSupportedChains();

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MultiChainPay({ amount, currency, onSuccess, disabled }: MultiChainPayProps) {
  const { address, isConnected } = useAccount();
  const walletChainId = useChainId();
  const { sendTransactionAsync } = useSendTransaction();

  const [ethPrice, setEthPrice] = React.useState<number | null>(null);
  const [payToken, setPayToken] = React.useState<"ETH" | "USDC">("USDC");
  const [sourceChain, setSourceChain] = React.useState<SupportedChain>(CHAINS[0]);
  const [quoteLoading, setQuoteLoading] = React.useState(false);
  const [txLoading, setTxLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch ETH price on mount
  React.useEffect(() => {
    getTokenPrice("ETH").then(setEthPrice).catch(() => setEthPrice(3400));
  }, []);

  const ethEquivalent = ethPrice ? (amount / ethPrice).toFixed(6) : "…";
  const usdcEquivalent = amount.toFixed(2);

  const isFeatureActive = FF_MULTICHAIN_PAY;

  /* ---------------------------------------------------------------- */
  /*  Disabled / Coming-Soon state                                     */
  /* ---------------------------------------------------------------- */

  if (!isFeatureActive) {
    return (
      <div className="relative rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-5 opacity-50 select-none">
        {/* Coming Soon badge */}
        <div className="absolute right-3 top-3 rounded-full bg-black/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-black/50">
          Coming Soon
        </div>

        <div className="flex items-center gap-2.5">
          <CryptoIcon />
          <div className="font-[family-name:var(--font-kanit)] text-sm font-medium text-black/60">
            Pay with Crypto
          </div>
        </div>

        <p className="mt-2 text-xs text-black/40">
          Multi-chain crypto payments across Base, Optimism, Arbitrum, and Polygon.
        </p>

        <button
          type="button"
          disabled
          className="mt-4 inline-flex h-10 w-full cursor-not-allowed items-center justify-center rounded-2xl bg-black/10 text-sm font-semibold text-black/30"
        >
          Pay with Crypto
        </button>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Pay handler                                                      */
  /* ---------------------------------------------------------------- */

  const handlePay = async () => {
    if (!address || !isConnected) {
      setError("Connect your wallet first.");
      return;
    }

    setError(null);
    setTxLoading(true);

    try {
      const isCrossChain = sourceChain.id !== SETTLEMENT_CHAIN_ID;
      const fromToken = getTokenAddress(payToken, sourceChain.id);
      const toToken = getTokenAddress("USDC", SETTLEMENT_CHAIN_ID);

      // Convert amount to token decimals
      const decimals = payToken === "USDC" ? 6 : 18;
      const rawAmount = payToken === "USDC"
        ? amount.toFixed(2)
        : ethEquivalent;
      const fromAmount = parseUnits(rawAmount, decimals).toString();

      if (isCrossChain || payToken !== "USDC") {
        // Use LI.FI for cross-chain or token swap
        setQuoteLoading(true);
        const quote = await getMultiChainQuote(
          sourceChain.id,
          SETTLEMENT_CHAIN_ID,
          fromToken,
          toToken,
          fromAmount,
          address,
        );
        setQuoteLoading(false);

        const tx = quote.route as unknown as {
          transactionRequest?: {
            to: string;
            data: string;
            value: string;
            gasLimit: string;
          };
        };

        if (tx.transactionRequest) {
          const hash = await sendTransactionAsync({
            to: tx.transactionRequest.to as `0x${string}`,
            data: tx.transactionRequest.data as `0x${string}`,
            value: BigInt(tx.transactionRequest.value ?? "0"),
          });
          onSuccess(hash);
        } else {
          throw new Error("No transaction request returned from quote.");
        }
      } else {
        // Same-chain USDC on Base — direct transfer (simplified demo)
        const hash = await sendTransactionAsync({
          to: getTokenAddress("USDC", SETTLEMENT_CHAIN_ID) as `0x${string}`,
          value: BigInt(0),
          // In production this would be an ERC-20 transfer call
          // For demo purposes we send a 0-value tx to the USDC contract
        });
        onSuccess(hash);
      }
    } catch (err) {
      const msg = (err as Error)?.message ?? String(err);
      // Clean up wagmi / wallet error messages
      if (msg.includes("User rejected") || msg.includes("denied")) {
        setError("Transaction rejected by wallet.");
      } else {
        setError(msg.length > 120 ? msg.slice(0, 120) + "…" : msg);
      }
    } finally {
      setTxLoading(false);
      setQuoteLoading(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Active state                                                     */
  /* ---------------------------------------------------------------- */

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel)] p-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <CryptoIcon />
        <div className="font-[family-name:var(--font-kanit)] text-sm font-medium text-black">
          Pay with Crypto
        </div>
      </div>

      {/* Price display */}
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl border border-[color:var(--border)] bg-white p-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-black/50">
            Total ({currency.toUpperCase()})
          </div>
          <div className="mt-0.5 text-lg font-semibold text-black">
            ${amount.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-black/50">
            {payToken} Equivalent
          </div>
          <div className="mt-0.5 text-lg font-semibold text-black">
            {payToken === "USDC" ? `${usdcEquivalent} USDC` : `${ethEquivalent} ETH`}
          </div>
        </div>
      </div>

      {/* Token selector */}
      <div className="mt-3 flex gap-2">
        {(["USDC", "ETH"] as const).map((tok) => (
          <button
            key={tok}
            type="button"
            onClick={() => setPayToken(tok)}
            className={[
              "inline-flex h-9 flex-1 cursor-pointer items-center justify-center rounded-xl border text-xs font-semibold transition",
              payToken === tok
                ? "border-[color:var(--z-blue)] bg-[color:var(--z-blue)]/10 text-[color:var(--z-blue)]"
                : "border-[color:var(--border)] bg-white text-black/60 hover:bg-black/5",
            ].join(" ")}
          >
            {tok}
          </button>
        ))}
      </div>

      {/* Chain selector */}
      <div className="mt-3">
        <div className="text-[10px] font-medium uppercase tracking-wider text-black/50">
          Pay from chain
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CHAINS.map((chain) => (
            <button
              key={chain.id}
              type="button"
              onClick={() => setSourceChain(chain)}
              className={[
                "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold transition",
                sourceChain.id === chain.id
                  ? "border-[color:var(--z-blue)] bg-[color:var(--z-blue)]/10 text-[color:var(--z-blue)]"
                  : "border-[color:var(--border)] bg-white text-black/60 hover:bg-black/5",
              ].join(" ")}
            >
              <span>{chain.icon}</span>
              {chain.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cross-chain note */}
      {sourceChain.id !== SETTLEMENT_CHAIN_ID && (
        <div className="mt-3 rounded-xl border border-[color:var(--z-blue)]/20 bg-[color:var(--z-blue)]/5 px-3 py-2 text-xs text-black/60">
          Funds will be bridged from {sourceChain.name} to Base via LI.FI. Bridge fees may apply.
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="mt-3 text-xs text-red-500">{error}</p>
      )}

      {/* Pay button */}
      <button
        type="button"
        disabled={disabled || txLoading || !isConnected}
        onClick={handlePay}
        className="mt-4 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-[color:var(--z-blue)] text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {txLoading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            {quoteLoading ? "Getting quote…" : "Processing…"}
          </span>
        ) : !isConnected ? (
          "Connect wallet to pay"
        ) : (
          `Pay ${payToken === "USDC" ? `$${usdcEquivalent}` : `${ethEquivalent} ETH`}`
        )}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small crypto icon                                                  */
/* ------------------------------------------------------------------ */

function CryptoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-[color:var(--z-blue)]"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
