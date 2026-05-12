import type { components } from "@olla-ui/types/schema";
import { useIndexerQuery } from "./useIndexerQuery";

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
  const { address, status, limit = 100, offset = 0, enabled } = options;

  return useIndexerQuery<WithdrawalRequest>({
    queryKey: ["withdrawals", address, status, limit, offset],
    resourceName: "withdrawals",
    address,
    enabled,
    buildUrl: (baseUrl) => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (status) params.set("status", status);
      return `${baseUrl}/api/v1/withdrawals/${address}?${params}`;
    },
    selectData: (body) => (body as WithdrawalList).withdrawals ?? [],
  });
}
