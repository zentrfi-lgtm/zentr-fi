import { getQuote, getStatus } from "@lifi/sdk";
import type { Route } from "@lifi/sdk";

/* ------------------------------------------------------------------ */
/*  Supported chains                                                   */
/* ------------------------------------------------------------------ */

export type SupportedChain = {
  id: number;
  name: string;
  icon: string; // emoji fallback
  nativeCurrency: string;
};

const SUPPORTED_CHAINS: SupportedChain[] = [
  { id: 8453, name: "Base", icon: "🔵", nativeCurrency: "ETH" },
  { id: 10, name: "Optimism", icon: "🔴", nativeCurrency: "ETH" },
  { id: 42161, name: "Arbitrum", icon: "🔷", nativeCurrency: "ETH" },
  { id: 137, name: "Polygon", icon: "🟣", nativeCurrency: "MATIC" },
];

export function getSupportedChains(): SupportedChain[] {
  return SUPPORTED_CHAINS;
}

/* ------------------------------------------------------------------ */
/*  Token addresses (well-known on each chain)                         */
/* ------------------------------------------------------------------ */

/** Native token placeholder used by LI.FI */
const NATIVE = "0x0000000000000000000000000000000000000000";

const USDC_ADDRESSES: Record<number, string> = {
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
  10: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",   // Optimism
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
  137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",   // Polygon
};

export function getTokenAddress(
  symbol: "ETH" | "USDC" | "MATIC",
  chainId: number,
): string {
  if (symbol === "USDC") return USDC_ADDRESSES[chainId] ?? USDC_ADDRESSES[8453];
  return NATIVE; // ETH / MATIC native
}

/* ------------------------------------------------------------------ */
/*  Price helpers                                                      */
/* ------------------------------------------------------------------ */

const PRICE_CACHE: Map<string, { price: number; ts: number }> = new Map();
const CACHE_TTL = 60_000; // 1 min

/**
 * Simple price fetch.  Uses CoinGecko free API.
 * Falls back to hardcoded values if the fetch fails (demo-safe).
 */
export async function getTokenPrice(
  symbol: "ETH" | "USDC" | "MATIC",
): Promise<number> {
  if (symbol === "USDC") return 1;

  const cached = PRICE_CACHE.get(symbol);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.price;

  const geckoId = symbol === "ETH" ? "ethereum" : "matic-network";

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`,
      { next: { revalidate: 60 } },
    );
    const json = await res.json();
    const price: number = json[geckoId]?.usd;
    if (price) {
      PRICE_CACHE.set(symbol, { price, ts: Date.now() });
      return price;
    }
  } catch {
    // fall through to fallback
  }

  // Hardcoded fallback so the UI never breaks
  const fallback: Record<string, number> = { ETH: 3400, MATIC: 0.55 };
  return fallback[symbol] ?? 1;
}

/* ------------------------------------------------------------------ */
/*  LI.FI quote                                                        */
/* ------------------------------------------------------------------ */

export type MultiChainQuote = {
  route: Route;
  estimateUsd: number;
  estimateToken: string;
  estimateAmount: string;
  bridgeFeeUsd: number;
};

/**
 * Get a LI.FI quote for a cross-chain (or same-chain) swap/bridge.
 *
 * @param fromChainId  - Source chain id
 * @param toChainId    - Destination chain id (8453 = Base for settlement)
 * @param fromToken    - Source token address
 * @param toToken      - Destination token address
 * @param fromAmount   - Amount in smallest unit (wei / 6-dec for USDC)
 * @param fromAddress  - Sender wallet address
 */
export async function getMultiChainQuote(
  fromChainId: number,
  toChainId: number,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  fromAddress: string,
): Promise<MultiChainQuote> {
  const result = await getQuote({
    fromChain: fromChainId,
    toChain: toChainId,
    fromToken,
    toToken,
    fromAmount,
    fromAddress,
  });

  const route = result as unknown as Route;

  return {
    route,
    estimateUsd: Number(result.estimate?.toAmountUSD ?? "0"),
    estimateToken: result.action?.toToken?.symbol ?? "USDC",
    estimateAmount: result.estimate?.toAmount ?? "0",
    bridgeFeeUsd: Number(result.estimate?.feeCosts?.[0]?.amountUSD ?? "0"),
  };
}

/**
 * Poll LI.FI for transaction status after execution.
 */
export async function getTransactionStatus(txHash: string, fromChainId: number) {
  return getStatus({ txHash, bridge: "across", fromChain: fromChainId });
}
