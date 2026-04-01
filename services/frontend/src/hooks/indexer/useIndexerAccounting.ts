import { useQuery } from "@tanstack/react-query";
import type { components } from "@olla-ui/types/schema";
import { INDEXER_API_URL } from "@/constants/environment";
import { CLAIMS_REFRESH_INTERVAL_MS } from "@/constants/protocol";

type AccountingUpdate = components["schemas"]["AccountingUpdate"];

interface AccountingUpdateList {
  updates: AccountingUpdate[];
  total: number;
}

interface UseIndexerAccountingOptions {
  contract: `0x${string}` | undefined;
  /** Max snapshots to fetch. Defaults to 5000 which covers years of weekly events. */
  limit?: number;
}

/**
 * Fetches the full AccountingUpdated event history for an OllaCore contract,
 * ordered by block_number ascending (oldest first).
 *
 * This dataset is contract-scoped (not user-specific) and is used by
 * useRewardsEarned to look up the exchange rate at the time of each deposit,
 * enabling per-deposit-rate rewards calculation instead of average cost-basis.
 *
 * Falls back to an empty array when the indexer is unavailable.
 */
export function useIndexerAccounting(options: UseIndexerAccountingOptions) {
  const { contract, limit = 5000 } = options;

  return useQuery({
    queryKey: ["indexer", "accounting", contract, limit],
    queryFn: async (): Promise<AccountingUpdate[]> => {
      if (!INDEXER_API_URL) {
        console.warn("[Indexer] No indexer URL configured for this environment");
        return [];
      }

      if (!contract) {
        return [];
      }

      const params = new URLSearchParams({ limit: String(limit), offset: "0" });
      const url = `${INDEXER_API_URL}/api/v1/accounting/${contract}?${params}`;

      try {
        const res = await fetch(url);

        if (!res.ok) {
          console.warn(`[Indexer] Failed to fetch accounting history: ${res.status} ${res.statusText}`);
          return [];
        }

        const body = (await res.json()) as AccountingUpdateList;
        return body.updates ?? [];
      } catch (error) {
        console.warn("[Indexer] Error fetching accounting history:", error);
        return [];
      }
    },
    enabled: !!contract && !!INDEXER_API_URL,
    // Refresh and stale time are aligned with other indexer data; this is acceptable
    // since historical entries never change and new entries arrive infrequently.
    refetchInterval: CLAIMS_REFRESH_INTERVAL_MS,
    staleTime: CLAIMS_REFRESH_INTERVAL_MS,
    retry: 2,
  });
}
