import type { components } from "@olla-ui/types/schema";
import { useIndexerQuery } from "./useIndexerQuery";

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
  const { address, limit = 100, offset = 0, enabled } = options;

  return useIndexerQuery<Deposit>({
    queryKey: ["deposits", address, limit, offset],
    resourceName: "deposits",
    address,
    enabled,
    buildUrl: (baseUrl) => {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      return `${baseUrl}/api/v1/deposits/${address}?${params}`;
    },
    selectData: (body) => (body as DepositList).deposits ?? [],
  });
}
