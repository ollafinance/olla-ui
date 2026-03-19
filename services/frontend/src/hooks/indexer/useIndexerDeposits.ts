import { useQuery } from "@tanstack/react-query";
import type { components } from "@olla-ui/types/schema";
import { INDEXER_API_URL } from "@/constants/environment";
import { CLAIMS_REFRESH_INTERVAL_MS } from "@/constants/protocol";

type Deposit = components["schemas"]["Deposit"];
type DepositList = components["schemas"]["DepositList"];

interface UseIndexerDepositsOptions {
  address: `0x${string}` | undefined;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch deposit data from the backend indexer.
 * Falls back to empty array if indexer is unavailable.
 */
export function useIndexerDeposits(options: UseIndexerDepositsOptions) {
  const { address, limit = 100, offset = 0, enabled = true } = options;

  return useQuery({
    queryKey: ["indexer", "deposits", address, limit, offset],
    queryFn: async (): Promise<Deposit[]> => {
      if (!INDEXER_API_URL) {
        console.warn("[Indexer] No indexer URL configured for this environment");
        return [];
      }

      if (!address) {
        throw new Error("Address is required");
      }

      const params = new URLSearchParams();
      params.set("limit", String(limit));
      params.set("offset", String(offset));

      const url = `${INDEXER_API_URL}/api/v1/deposits/${address}?${params}`;

      try {
        const res = await fetch(url);

        if (!res.ok) {
          console.warn(`[Indexer] Failed to fetch deposits: ${res.status} ${res.statusText}`);
          return [];
        }

        const data: DepositList = await res.json();
        return data.deposits ?? [];
      } catch (error) {
        console.warn("[Indexer] Error fetching deposits, falling back to RPC:", error);
        return [];
      }
    },
    enabled: enabled && !!address,
    refetchInterval: CLAIMS_REFRESH_INTERVAL_MS,
    staleTime: CLAIMS_REFRESH_INTERVAL_MS,
    retry: 2,
  });
}
