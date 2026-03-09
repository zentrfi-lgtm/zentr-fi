"use client";

import { useEnsName } from "wagmi";
import { base } from "wagmi/chains";
import { useProfile } from "@/src/hooks/useProfile";
import { FF_ENS_RESOLVE } from "@/src/lib/featureFlags";

/**
 * Base L2 ENS Universal Resolver address.
 * Resolves both ENS names and Base names (*.base.eth) on Base mainnet.
 */
const BASE_ENS_RESOLVER = "0xC6d566A56A1aFf6508b41f6c90ff131615583BCD" as const;

function shortAddress(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}\u2026${addr.slice(-4)}`;
}

/**
 * Returns the best display name for a wallet address.
 *
 * Priority: user-set nickname > ENS/Base name > truncated address.
 * When `FF_ENS_RESOLVE` is disabled the hook skips on-chain resolution
 * and returns `nickname || truncatedAddress`.
 */
export function useResolvedName(address: `0x${string}` | undefined) {
  const { profile } = useProfile(address);

  // ENS / Base name resolution via the Base L2 resolver
  const { data: ensName, isLoading } = useEnsName({
    address,
    chainId: base.id,
    universalResolverAddress: BASE_ENS_RESOLVER,
    query: {
      enabled: FF_ENS_RESOLVE && !!address,
    },
  });

  // Priority: nickname > ENS/basename > truncated address
  const resolvedName =
    profile?.nickname || ensName || shortAddress(address) || null;

  return {
    /** Best display name (never null when address is provided). */
    resolvedName,
    /** The raw ENS/Base name, if resolved. */
    ensName: FF_ENS_RESOLVE ? ensName ?? null : null,
    /** Whether on-chain resolution is still in flight. */
    isLoading: FF_ENS_RESOLVE ? isLoading : false,
  };
}
