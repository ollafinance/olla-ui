import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { INDEXER_API_URL } from "@/constants/environment";
import { CLAIMS_REFRESH_INTERVAL_MS } from "@/constants/protocol";

export interface UseIndexerQueryOptions<TData> {
  /** TanStack Query cache key segments (after the shared `["indexer"]` prefix). */
  queryKey: unknown[];
  /**
   * Builds the full URL path + query-string for the request.
   * Only called when `address` is defined and `INDEXER_API_URL` is set.
   */
  buildUrl: (baseUrl: string) => string;
  /** Extracts the result array from the JSON response body. */
  selectData: (body: unknown) => TData[];
  address: `0x${string}` | undefined;
  enabled?: boolean;
  /** Human-readable resource name used in warning messages. */
  resourceName: string;
}

/**
 * Generic TanStack Query wrapper for indexer API calls.
 * Handles the shared concerns: missing URL, missing address, HTTP errors,
 * network errors, and polling interval — so individual hooks only need to
 * supply endpoint-specific details.
 */
export function useIndexerQuery<TData>(
  options: UseIndexerQueryOptions<TData>
): UseQueryResult<TData[]> {
  const { queryKey, buildUrl, selectData, address, enabled = true, resourceName } = options;

  return useQuery({
    queryKey: ["indexer", ...queryKey],
    queryFn: async (): Promise<TData[]> => {
      if (!INDEXER_API_URL) {
        console.warn("[Indexer] No indexer URL configured for this environment");
        return [];
      }

      if (!address) {
        throw new Error("Address is required");
      }

      const url = buildUrl(INDEXER_API_URL);

      try {
        const res = await fetch(url);

        if (!res.ok) {
          console.warn(
            `[Indexer] Failed to fetch ${resourceName}: ${res.status} ${res.statusText}`
          );
          return [];
        }

        const body = await res.json();
        return selectData(body) ?? [];
      } catch (error) {
        console.warn(`[Indexer] Error fetching ${resourceName}, falling back to RPC:`, error);
        return [];
      }
    },
    enabled: enabled && !!address,
    refetchInterval: CLAIMS_REFRESH_INTERVAL_MS,
    staleTime: CLAIMS_REFRESH_INTERVAL_MS,
    retry: 2,
  });
}
