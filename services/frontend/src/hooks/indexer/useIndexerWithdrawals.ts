import { useQuery } from "@tanstack/react-query";
import type { components } from "@olla-ui/types/schema";
import { INDEXER_API_URL } from "@/constants/environment";
import { CLAIMS_REFRESH_INTERVAL_MS } from "@/constants/protocol";

type WithdrawalRequest = components["schemas"]["WithdrawalRequest"];
type WithdrawalList = components["schemas"]["WithdrawalList"];

interface UseIndexerWithdrawalsOptions {
  address: `0x${string}` | undefined;
  status?: "pending" | "completed";
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch withdrawal data from the backend indexer.
 * Falls back to empty array if indexer is unavailable.
 */
export function useIndexerWithdrawals(options: UseIndexerWithdrawalsOptions) {
  const { address, status, limit = 100, offset = 0, enabled = true } = options;

  return useQuery({
    queryKey: ["indexer", "withdrawals", address, status, limit, offset],
    queryFn: async (): Promise<WithdrawalRequest[]> => {
      if (!INDEXER_API_URL) {
        console.warn("[Indexer] No indexer URL configured for this environment");
        return [];
      }

      if (!address) {
        throw new Error("Address is required");
      }

      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("limit", String(limit));
      params.set("offset", String(offset));

      const url = `${INDEXER_API_URL}/api/v1/withdrawals/${address}?${params}`;

      try {
        const res = await fetch(url);

        if (!res.ok) {
          console.warn(`[Indexer] Failed to fetch withdrawals: ${res.status} ${res.statusText}`);
          return [];
        }

        const data: WithdrawalList = await res.json();
        return data.withdrawals ?? [];
      } catch (error) {
        console.warn("[Indexer] Error fetching withdrawals, falling back to RPC:", error);
        return [];
      }
    },
    enabled: enabled && !!address,
    refetchInterval: CLAIMS_REFRESH_INTERVAL_MS,
    staleTime: CLAIMS_REFRESH_INTERVAL_MS,
    retry: 2,
  });
}
