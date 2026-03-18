import { useReadContracts, useConnection } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { PROTOCOL_CONSTANTS, CLAIMS_REFRESH_INTERVAL_MS } from "@/constants/protocol";
import { useWithdrawalEvents } from "@/hooks/protocol/useWithdrawalEvents";
import { useInstantRedemptionEvents } from "@/hooks/protocol/useInstantRedemptionEvents";
import { useIndexerWithdrawals } from "@/hooks/indexer";
import { useCurrency } from "@/hooks/useCurrency";
import { useOllaCoreReads } from "@/hooks/protocol/useOllaCoreReads";
import { useState, useMemo, useCallback, useEffect } from "react";
import { formatEther } from "viem";
import type { components } from "@olla-ui/types/schema";

type WithdrawalRequest = components["schemas"]["WithdrawalRequest"];

export type ClaimStatus = "ready" | "processing" | "claimed" | "instant";
export type ClaimType = "queued" | "instant";

export interface ClaimItemData {
  id: number;
  amount: string; // Formatted assets (e.g., "250.00")
  status: ClaimStatus;
  claimType: ClaimType;
  usdValue: string; // Calculated USD value
  daysLeft?: number; // For processing status
  claimedDate?: string; // Relative time for claimed status (e.g., "2 days ago")
  shares: bigint; // Raw shares for reference
  assetsExpected: bigint; // Raw assets for reference
  requestedAt?: number; // Timestamp (if available)
  finalized: boolean;
  claimed: boolean;
  isInstant?: boolean; // Whether this is an instant redemption
}

const CLAIMS_PAGE_SIZE = 10;

/**
 * Hook to fetch and manage withdrawal claims data.
 * Merges data from:
 * - Backend indexer (historical withdrawals, timestamps)
 * - RPC calls (active request state, real-time status)
 * - Event logs (recent events as fallback)
 *
 * Provides pagination with priority sorting (ready > processing > instant > claimed).
 */
export function useClaims() {
  const { address } = useConnection();
  const [page, setPage] = useState(1);

  // Get active request IDs from contract (non-claimed requests)
  const { activeRequestIds, exchangeRate } = useOllaCoreReads({
    address: address,
  });

  // Fetch withdrawals from backend indexer
  const {
    data: indexedWithdrawals,
    isLoading: isLoadingIndexed,
    error: indexerError,
  } = useIndexerWithdrawals({
    address,
    limit: 100,
    enabled: !!address,
  });

  // Get claimed request IDs and event timestamps from withdrawal event logs
  // Keep this as fallback for recent events not yet indexed
  const {
    eventData,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useWithdrawalEvents(address);

  // Get instant redemption events from RPC
  const {
    events: instantRedemptionEvents,
    isLoading: isLoadingInstantEvents,
    error: instantEventsError,
    refetch: refetchInstantEvents,
  } = useInstantRedemptionEvents(address);

  // Log indexer errors but continue with RPC fallback
  useEffect(() => {
    if (indexerError) {
      console.warn("[Claims] Indexer unavailable, falling back to RPC:", indexerError);
    }
  }, [indexerError]);

  // Get currency utilities for USD calculations
  const exchangeRateNum = exchangeRate ? Number(formatEther(exchangeRate)) : null;
  const { stAztecToUsd } = useCurrency({
    exchangeRate: exchangeRateNum,
  });

  // Calculate days left until claimable
  const calculateDaysLeft = useCallback((requestedAt?: number): number | undefined => {
    if (!requestedAt) return undefined;

    const now = Math.floor(Date.now() / 1000);
    const unlockTime = requestedAt + PROTOCOL_CONSTANTS.WITHDRAWAL_DELAY_DAYS * 24 * 60 * 60;
    const secondsLeft = Math.max(0, unlockTime - now);
    const daysLeft = Math.ceil(secondsLeft / (24 * 60 * 60));

    return daysLeft > 0 ? daysLeft : undefined;
  }, []);

  // Format relative date (e.g., "2 days ago", "just now")
  const formatRelativeDate = useCallback((timestamp?: number): string | undefined => {
    if (!timestamp) return undefined;

    const now = Math.floor(Date.now() / 1000);
    const diffSeconds = now - timestamp;
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffSeconds / 3600);
    const diffDays = Math.floor(diffSeconds / 86400);

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 30) return `${diffDays} days ago`;

    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Fetch RPC state for ALL active requests to determine real-time status
  // This includes both indexed and non-indexed active requests
  const activeRequestContracts = useMemo(() => {
    return activeRequestIds.map((id) => ({
      address: CONTRACTS.WithdrawalQueue.address,
      abi: CONTRACTS.WithdrawalQueue.abi,
      functionName: "getRequest",
      args: [id],
    }));
  }, [activeRequestIds]);

  const {
    data: activeRequestDetailsData,
    isLoading: isLoadingActiveRequests,
    error: activeRequestsError,
    refetch: refetchActiveRequests,
  } = useReadContracts({
    contracts: activeRequestContracts,
    query: {
      enabled: activeRequestContracts.length > 0,
      refetchInterval: CLAIMS_REFRESH_INTERVAL_MS,
    },
  });

  // Create a map of requestId -> RPC state for quick lookup
  const activeRequestStateMap = useMemo(() => {
    const map = new Map<
      number,
      { finalized: boolean; claimed: boolean; shares: bigint; assetsExpected: bigint }
    >();

    if (!activeRequestDetailsData) return map;

    activeRequestDetailsData.forEach((result, index) => {
      if (!result.result) return;

      const requestId = Number(activeRequestIds[index]);
      const request = result.result as {
        recipient: `0x${string}`;
        finalized: boolean;
        claimed: boolean;
        shares: bigint;
        assetsExpected: bigint;
        rate: bigint;
      };

      map.set(requestId, {
        finalized: request.finalized,
        claimed: request.claimed,
        shares: request.shares,
        assetsExpected: request.assetsExpected,
      });
    });

    return map;
  }, [activeRequestDetailsData, activeRequestIds]);

  // Group indexed withdrawals by request_id for deduplication
  // For each request_id, pick the most relevant event:
  // - withdrawal_requested: initial request (has shares)
  // - redeem_request: user initiated claim
  // - withdrawal_claimed: completed
  const groupedIndexedWithdrawals = useMemo(() => {
    const groups = new Map<number | string, WithdrawalRequest[]>();

    for (const withdrawal of indexedWithdrawals ?? []) {
      // Handle instant redemptions separately (no request_id)
      if (withdrawal.event_type === "instant_redemption") {
        const key = `instant-${withdrawal.id}`;
        groups.set(key, [withdrawal]);
        continue;
      }

      // Skip entries without request_id (shouldn't happen for non-instant)
      if (withdrawal.request_id == null) continue;

      const key = Number(withdrawal.request_id);
      const existing = groups.get(key) ?? [];
      groups.set(key, [...existing, withdrawal]);
    }

    return groups;
  }, [indexedWithdrawals]);

  // Transform indexed withdrawal data to ClaimItemData
  // Deduplicated by request_id
  const indexedClaims: ClaimItemData[] = useMemo(() => {
    const claims: ClaimItemData[] = [];

    for (const [key, withdrawals] of groupedIndexedWithdrawals.entries()) {
      // Handle instant redemptions
      if (typeof key === "string" && key.startsWith("instant-")) {
        const withdrawal = withdrawals[0];
        if (!withdrawal) continue;

        // Parse timestamps
        const requestedAt = withdrawal.created_at
          ? Math.floor(new Date(withdrawal.created_at).getTime() / 1000)
          : undefined;

        // Calculate amounts - use net_assets for instant redemptions
        const shares = withdrawal.shares ? BigInt(withdrawal.shares) : 0n;
        const netAssets = withdrawal.net_assets ? BigInt(withdrawal.net_assets) : 0n;

        const sharesFormatted = formatEther(shares);
        const netAssetsFormatted = formatEther(netAssets);
        const usdValue = stAztecToUsd(sharesFormatted);

        claims.push({
          id: -withdrawal.id, // Negative ID to avoid conflicts with request IDs
          amount: netAssetsFormatted,
          status: "instant",
          claimType: "instant",
          usdValue,
          claimedDate: formatRelativeDate(requestedAt),
          shares,
          assetsExpected: netAssets,
          requestedAt,
          finalized: true,
          claimed: true,
          isInstant: true,
        });
        continue;
      }

      // For regular withdrawals, find the best event to represent this request
      const requestId = Number(key);

      // Find withdrawal_requested event (has shares info)
      const requestedEvent = withdrawals.find((w) => w.event_type === "withdrawal_requested");

      // Find redeem_request event
      const redeemEvent = withdrawals.find((w) => w.event_type === "redeem_request");

      // Use requested event as base, or fallback to any event
      const baseEvent = requestedEvent ?? redeemEvent ?? withdrawals[0];
      if (!baseEvent) continue;

      // Determine if this request is still active (in activeRequestIds from RPC)
      const isActive = activeRequestIds.some((id) => Number(id) === requestId);
      
      // Get real-time state from RPC if available
      const rpcState = activeRequestStateMap.get(requestId);

      // Determine final status
      // Priority: RPC state > indexer state
      let status: ClaimStatus;
      if (!isActive) {
        // Not in active list - it's been completed
        status = "claimed";
      } else if (rpcState) {
        // Active and we have RPC state - check if finalized
        if (rpcState.claimed) {
          status = "claimed";
        } else if (rpcState.finalized) {
          status = "ready";
        } else {
          status = "processing";
        }
      } else {
        // Active but no RPC state yet - assume processing
        status = "processing";
      }

      // Parse timestamps from indexer
      // Use the withdrawal record's completed_at field if available
      const requestedAt = baseEvent.created_at
        ? Math.floor(new Date(baseEvent.created_at).getTime() / 1000)
        : undefined;

      // For completed withdrawals, use the completed_at timestamp from any event in the group
      const completedAt = baseEvent.completed_at
        ? Math.floor(new Date(baseEvent.completed_at).getTime() / 1000)
        : undefined;

      // Calculate amounts from requested event (has shares/assets_expected)
      const shares = requestedEvent?.shares
        ? BigInt(requestedEvent.shares)
        : baseEvent.shares
          ? BigInt(baseEvent.shares)
          : 0n;

      const assetsExpected = requestedEvent?.assets_expected
        ? BigInt(requestedEvent.assets_expected)
        : baseEvent.assets_expected
          ? BigInt(baseEvent.assets_expected)
          : 0n;

      const sharesFormatted = formatEther(shares);
      const assetsFormatted = formatEther(assetsExpected);
      const usdValue = stAztecToUsd(sharesFormatted);

      // Calculate days left for processing requests
      const daysLeft = status === "processing" ? calculateDaysLeft(requestedAt) : undefined;

      // Format claimed date
      const claimedDate = status === "claimed" ? formatRelativeDate(completedAt) : undefined;

      claims.push({
        id: requestId,
        amount: assetsFormatted,
        status,
        claimType: "queued",
        usdValue,
        daysLeft,
        claimedDate,
        shares,
        assetsExpected,
        requestedAt,
        finalized: status !== "processing",
        claimed: status === "claimed",
        isInstant: false,
      });
    }

    return claims;
  }, [
    groupedIndexedWithdrawals,
    activeRequestIds,
    activeRequestStateMap,
    stAztecToUsd,
    calculateDaysLeft,
    formatRelativeDate,
  ]);

  // Get IDs of requests already covered by indexed claims
  const indexedRequestIds = useMemo(() => {
    return new Set(indexedClaims.filter((c) => !c.isInstant).map((claim) => claim.id));
  }, [indexedClaims]);

  // Find active requests NOT in indexer (need to fetch separately)
  const missingActiveRequestIds = useMemo(() => {
    return activeRequestIds.filter((id) => !indexedRequestIds.has(Number(id)));
  }, [activeRequestIds, indexedRequestIds]);

  // Transform RPC-only withdrawal data (for requests not in indexer yet)
  // Uses the activeRequestStateMap which already contains all active request states
  const rpcOnlyClaims: ClaimItemData[] = useMemo(() => {
    if (missingActiveRequestIds.length === 0) return [];

    return missingActiveRequestIds
      .map((requestId) => {
        const rpcState = activeRequestStateMap.get(Number(requestId));
        if (!rpcState) return null;

        const eventInfo = eventData.get(requestId);

        // Determine status from RPC (real-time)
        let status: ClaimStatus;
        if (rpcState.claimed) {
          status = "claimed";
        } else if (rpcState.finalized) {
          status = "ready";
        } else {
          status = "processing";
        }

        // Calculate amounts
        const sharesFormatted = formatEther(rpcState.shares);
        const assetsFormatted = formatEther(rpcState.assetsExpected);
        const usdValue = stAztecToUsd(sharesFormatted);

        // Calculate days left for processing requests
        const daysLeft =
          status === "processing" ? calculateDaysLeft(eventInfo?.requestedAt) : undefined;

        // Format claimed date
        const claimedDate =
          status === "claimed" ? formatRelativeDate(eventInfo?.claimedAt) : undefined;

        return {
          id: Number(requestId),
          amount: assetsFormatted,
          status,
          claimType: "queued",
          usdValue,
          daysLeft,
          claimedDate,
          shares: rpcState.shares,
          assetsExpected: rpcState.assetsExpected,
          requestedAt: eventInfo?.requestedAt,
          finalized: rpcState.finalized,
          claimed: rpcState.claimed,
          isInstant: false,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null) as ClaimItemData[];
  }, [
    missingActiveRequestIds,
    activeRequestStateMap,
    eventData,
    stAztecToUsd,
    calculateDaysLeft,
    formatRelativeDate,
  ]);

  // Transform instant redemption events to ClaimItemData[]
  // Only use RPC events if indexer didn't capture them
  const instantClaimsFromRpc: ClaimItemData[] = useMemo(() => {
    if (!instantRedemptionEvents || instantRedemptionEvents.length === 0) return [];

    // Filter out instant redemptions already captured by indexer
    const indexedInstantIds = new Set(indexedClaims.filter((c) => c.isInstant).map((c) => -c.id));

    return instantRedemptionEvents
      .filter((_, index) => !indexedInstantIds.has(-(index + 1)))
      .map((event, index) => {
        // Calculate amounts
        const sharesFormatted = formatEther(event.shares);
        const netAssetsFormatted = formatEther(event.netAssets);
        const usdValue = stAztecToUsd(sharesFormatted);

        // Format completion date
        const completedDate = formatRelativeDate(event.timestamp);

        // Generate a unique ID for instant redemptions (use negative numbers to avoid conflicts)
        const id = -1 * (index + 1);

        return {
          id,
          amount: netAssetsFormatted,
          status: "instant",
          claimType: "instant",
          usdValue,
          claimedDate: completedDate,
          shares: event.shares,
          assetsExpected: event.netAssets,
          requestedAt: event.timestamp,
          finalized: true,
          claimed: true,
          isInstant: true,
        };
      });
  }, [instantRedemptionEvents, indexedClaims, stAztecToUsd, formatRelativeDate]);

  // Combine all claims: indexed + RPC-only + instant from RPC (fallback)
  const allClaims = useMemo(() => {
    return [...indexedClaims, ...rpcOnlyClaims, ...instantClaimsFromRpc];
  }, [indexedClaims, rpcOnlyClaims, instantClaimsFromRpc]);

  // Sort by priority: ready > processing > (instant = claimed by time)
  const sortedClaims = useMemo(() => {
    const priority: Record<ClaimStatus, number> = {
      ready: 0,
      processing: 1,
      instant: 2,
      claimed: 2, // Same priority as instant - both sorted by time
    };

    return [...allClaims].sort((a, b) => {
      // First sort by status priority
      const priorityDiff = priority[a.status] - priority[b.status];
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by timestamp (newest first)
      const aTime = a.requestedAt || 0;
      const bTime = b.requestedAt || 0;
      return bTime - aTime;
    });
  }, [allClaims]);

  // Pagination
  const totalClaims = sortedClaims.length;
  const totalPages = Math.ceil(totalClaims / CLAIMS_PAGE_SIZE);
  const hasMore = page < totalPages;

  const paginatedClaims = useMemo(() => {
    return sortedClaims.slice(0, page * CLAIMS_PAGE_SIZE);
  }, [sortedClaims, page]);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore]);

  // Manual refetch function
  const refetch = useCallback(() => {
    refetchActiveRequests();
    refetchEvents();
    refetchInstantEvents();
  }, [refetchActiveRequests, refetchEvents, refetchInstantEvents]);

  // Determine loading and error states
  const isLoading =
    isLoadingIndexed || isLoadingActiveRequests || isLoadingEvents || isLoadingInstantEvents;
  const error = indexerError || activeRequestsError || eventsError || instantEventsError;

  // Track when initial load completes (regardless of success/error)
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasInitiallyLoaded(true);
    }
  }, [isLoading]);

  return {
    claims: paginatedClaims,
    allClaims: sortedClaims,
    isLoading,
    hasInitiallyLoaded,
    error,
    hasMore,
    loadMore,
    refetch,
    totalClaims,
  };
}
