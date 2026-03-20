import { useQuery } from "@tanstack/react-query";
import type { components } from "@olla-ui/types/schema";
import { CONTRACTS } from "@/constants/contracts";
import { INDEXER_API_URL } from "@/constants/environment";
import { useAztecApr } from "./useAztecApr";

type ApyResponse = components["schemas"]["ApyResponse"];

const APY_REFETCH_INTERVAL_MS = 60_000;

interface UseProtocolApyReturn {
  /** APY as a percentage string, e.g. "5.20" */
  apy: string;
  /** Whether the APY is derived from on-chain data (vs hardcoded fallback) */
  isLive: boolean;
  isLoading: boolean;
}

/**
 * Calculates protocol APY by querying the backend indexer.
 *
 * The indexer computes APY server-side using the following strategy cascade:
 * 1. **multi_event** — two `AccountingUpdated` events, compound-annualised exchange rate ratio
 * 2. **single_report** — single event vs current wall clock, grossRewards / (totalAssets - grossRewards)
 * 3. **none** — insufficient data; falls back to Aztec base APR from the Rollup contract
 *
 * Falls back to `useAztecApr` when the indexer is unavailable or returns `is_live: false`.
 */
export function useProtocolApy(): UseProtocolApyReturn {
  const { apr: aztecApr, isLoading: aztecLoading } = useAztecApr(CONTRACTS.AztecRollup.address);

  const {
    data: apyData,
    isLoading: indexerLoading,
  } = useQuery({
    queryKey: ["indexer", "apy", CONTRACTS.OllaCore.address],
    queryFn: async (): Promise<ApyResponse | null> => {
      if (!INDEXER_API_URL) {
        console.warn("[Indexer] No indexer URL configured for this environment");
        return null;
      }

      const url = `${INDEXER_API_URL}/api/v1/apy/${CONTRACTS.OllaCore.address}`;

      try {
        const res = await fetch(url);

        if (!res.ok) {
          console.warn(`[Indexer] Failed to fetch APY: ${res.status} ${res.statusText}`);
          return null;
        }

        return (await res.json()) as ApyResponse;
      } catch (error) {
        console.warn("[Indexer] Error fetching APY, falling back to Aztec APR:", error);
        return null;
      }
    },
    refetchInterval: APY_REFETCH_INTERVAL_MS,
    staleTime: APY_REFETCH_INTERVAL_MS,
    retry: 2,
  });

  const ollaApy = apyData?.is_live ? apyData.apy : null;

  // Resolve final APY: Olla's own APY > Aztec base APR > "0.0"
  const apy = ollaApy ?? aztecApr ?? "0.0";
  const isLive = ollaApy !== null || aztecApr !== null;

  return {
    apy,
    isLive,
    isLoading: indexerLoading || aztecLoading,
  };
}
