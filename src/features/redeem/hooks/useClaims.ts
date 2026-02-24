import { useReadContracts, useConnection } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { PROTOCOL_CONSTANTS, CLAIMS_REFRESH_INTERVAL_MS } from "@/constants/protocol";
import { useWithdrawalEvents } from "@/hooks/protocol/useWithdrawalEvents";
import { useInstantRedemptionEvents } from "@/hooks/protocol/useInstantRedemptionEvents";
import { useCurrency } from "@/hooks/useCurrency";
import { useOllaCoreReads } from "@/hooks/protocol/useOllaCoreReads";
import { useState, useMemo, useCallback } from "react";
import { formatEther } from "viem";

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
 * Fetches both active requests and historical claimed requests from events,
 * plus instant redemptions, enriches with timestamps, calculates USD values,
 * and provides pagination with priority sorting (ready > processing > instant > claimed).
 */
export function useClaims() {
  const { address } = useConnection();
  const [page, setPage] = useState(1);

  // Get active request IDs from contract (non-claimed requests)
  const { activeRequestIds, exchangeRate } = useOllaCoreReads({
    address: address,
  });

  // Get claimed request IDs and event timestamps from withdrawal event logs
  const {
    eventData,
    claimedRequestIds,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useWithdrawalEvents(address, activeRequestIds);

  // Get instant redemption events
  const {
    events: instantRedemptionEvents,
    isLoading: isLoadingInstantEvents,
    error: instantEventsError,
    refetch: refetchInstantEvents,
  } = useInstantRedemptionEvents(address);

  // Combine active and claimed request IDs, removing duplicates
  const allRequestIds = useMemo(() => {
    const combined = [...activeRequestIds];

    // Add claimed request IDs that aren't already in the active list
    for (const claimedId of claimedRequestIds) {
      if (!combined.some((id) => id === claimedId)) {
        combined.push(claimedId);
      }
    }

    return combined;
  }, [activeRequestIds, claimedRequestIds]);

  // Fetch request details using multicall for ALL requests (active + claimed)
  const requestDetailsContracts = useMemo(() => {
    return allRequestIds.map((id) => ({
      address: CONTRACTS.WithdrawalQueue.address,
      abi: CONTRACTS.WithdrawalQueue.abi,
      functionName: "getRequest",
      args: [id],
    }));
  }, [allRequestIds]);

  const {
    data: requestDetailsData,
    isLoading: isLoadingRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = useReadContracts({
    contracts: requestDetailsContracts,
    query: {
      enabled: requestDetailsContracts.length > 0,
      refetchInterval: CLAIMS_REFRESH_INTERVAL_MS,
    },
  });

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

  // Transform queued withdrawal data to ClaimItemData[]
  const queuedClaims: ClaimItemData[] = useMemo(() => {
    if (!requestDetailsData || requestDetailsData.length === 0) return [];

    return requestDetailsData
      .map((result, index) => {
        if (!result.result) return null;

        const requestId = allRequestIds[index];
        const request = result.result as {
          recipient: `0x${string}`;
          finalized: boolean;
          claimed: boolean;
          shares: bigint;
          assetsExpected: bigint;
          rate: bigint;
        };

        const eventInfo = eventData.get(requestId);
        const isClaimed = claimedRequestIds.includes(requestId);

        // Determine status
        let status: ClaimStatus;
        if (isClaimed || request.claimed) {
          status = "claimed";
        } else if (request.finalized) {
          status = "ready";
        } else {
          status = "processing";
        }

        // Calculate amounts
        const sharesFormatted = formatEther(request.shares);
        const assetsFormatted = formatEther(request.assetsExpected);
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
          shares: request.shares,
          assetsExpected: request.assetsExpected,
          requestedAt: eventInfo?.requestedAt,
          finalized: request.finalized,
          claimed: isClaimed || request.claimed,
          isInstant: false,
        };
      })
      .filter((item): item is ClaimItemData => item !== null);
  }, [
    requestDetailsData,
    allRequestIds,
    eventData,
    claimedRequestIds,
    stAztecToUsd,
    calculateDaysLeft,
    formatRelativeDate,
  ]);

  // Transform instant redemption events to ClaimItemData[]
  const instantClaims: ClaimItemData[] = useMemo(() => {
    if (!instantRedemptionEvents || instantRedemptionEvents.length === 0) return [];

    return instantRedemptionEvents.map((event, index) => {
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
  }, [instantRedemptionEvents, stAztecToUsd, formatRelativeDate]);

  // Combine all claims
  const allClaims = useMemo(() => {
    return [...queuedClaims, ...instantClaims];
  }, [queuedClaims, instantClaims]);

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
    refetchRequests();
    refetchEvents();
    refetchInstantEvents();
  }, [refetchRequests, refetchEvents, refetchInstantEvents]);

  // Determine loading and error states
  const isLoading = isLoadingRequests || isLoadingEvents || isLoadingInstantEvents;
  const error = requestsError || eventsError || instantEventsError;

  return {
    claims: paginatedClaims,
    allClaims: sortedClaims,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
    totalClaims,
  };
}
