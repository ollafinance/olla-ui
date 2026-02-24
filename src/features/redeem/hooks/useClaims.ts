import { useReadContracts, useConnection } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { PROTOCOL_CONSTANTS, CLAIMS_REFRESH_INTERVAL_MS } from "@/constants/protocol";
import { useWithdrawalEvents } from "@/hooks/protocol/useWithdrawalEvents";
import { useCurrency } from "@/hooks/useCurrency";
import { useOllaCoreReads } from "@/hooks/protocol/useOllaCoreReads";
import { useState, useMemo, useCallback } from "react";
import { formatEther } from "viem";

export type ClaimStatus = "ready" | "processing" | "claimed";

export interface ClaimItemData {
  id: number;
  amount: string; // Formatted assets (e.g., "250.00")
  status: ClaimStatus;
  usdValue: string; // Calculated USD value
  daysLeft?: number; // For processing status
  claimedDate?: string; // Relative time for claimed status (e.g., "2 days ago")
  shares: bigint; // Raw shares for reference
  assetsExpected: bigint; // Raw assets for reference
  requestedAt?: number; // Timestamp (if available)
  finalized: boolean;
  claimed: boolean;
}

const CLAIMS_PAGE_SIZE = 10;

/**
 * Hook to fetch and manage withdrawal claims data.
 * Fetches active requests, enriches with event timestamps, calculates USD values,
 * and provides pagination with priority sorting (ready > processing > claimed).
 */
export function useClaims() {
  const { address } = useConnection();
  const [page, setPage] = useState(1);

  // Get active request IDs
  const { activeRequestIds, exchangeRate } = useOllaCoreReads({
    address: address,
  });

  // Fetch request details using multicall
  const requestDetailsContracts = useMemo(() => {
    return activeRequestIds.map((id) => ({
      address: CONTRACTS.WithdrawalQueue.address,
      abi: CONTRACTS.WithdrawalQueue.abi,
      functionName: "getRequest",
      args: [id],
    }));
  }, [activeRequestIds]);

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

  // Fetch event timestamps
  const {
    eventData,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useWithdrawalEvents(address, activeRequestIds);

  // Get currency utilities for USD calculations
  const exchangeRateNum = exchangeRate ? Number(formatEther(exchangeRate)) : null;
  const { stAztecToUsd } = useCurrency({
    exchangeRate: exchangeRateNum,
  });

  // Calculate days left until claimable
  const calculateDaysLeft = useCallback(
    (requestedAt?: number): number | undefined => {
      if (!requestedAt) return undefined;

      const now = Math.floor(Date.now() / 1000);
      const unlockTime = requestedAt + PROTOCOL_CONSTANTS.WITHDRAWAL_DELAY_DAYS * 24 * 60 * 60;
      const secondsLeft = Math.max(0, unlockTime - now);
      const daysLeft = Math.ceil(secondsLeft / (24 * 60 * 60));

      return daysLeft > 0 ? daysLeft : undefined;
    },
    []
  );

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

  // Transform raw data to ClaimItemData[]
  const claims: ClaimItemData[] = useMemo(() => {
    if (!requestDetailsData || requestDetailsData.length === 0) return [];

    return requestDetailsData
      .map((result, index) => {
        if (!result.result) return null;

        const requestId = activeRequestIds[index];
        const request = result.result as {
          recipient: `0x${string}`;
          finalized: boolean;
          claimed: boolean;
          shares: bigint;
          assetsExpected: bigint;
          rate: bigint;
        };

        const eventInfo = eventData.get(requestId);

        // Determine status
        let status: ClaimStatus;
        if (request.claimed) {
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
          usdValue,
          daysLeft,
          claimedDate,
          shares: request.shares,
          assetsExpected: request.assetsExpected,
          requestedAt: eventInfo?.requestedAt,
          finalized: request.finalized,
          claimed: request.claimed,
        };
      })
      .filter((item): item is ClaimItemData => item !== null);
  }, [
    requestDetailsData,
    activeRequestIds,
    eventData,
    stAztecToUsd,
    calculateDaysLeft,
    formatRelativeDate,
  ]);

  // Sort by priority: ready > processing > claimed
  const sortedClaims = useMemo(() => {
    const priority: Record<ClaimStatus, number> = {
      ready: 0,
      processing: 1,
      claimed: 2,
    };

    return [...claims].sort((a, b) => {
      // First sort by status priority
      const priorityDiff = priority[a.status] - priority[b.status];
      if (priorityDiff !== 0) return priorityDiff;

      // Then sort by request ID (descending - newest first)
      return b.id - a.id;
    });
  }, [claims]);

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
  }, [refetchRequests, refetchEvents]);

  // Determine loading and error states
  const isLoading = isLoadingRequests || isLoadingEvents;
  const error = requestsError || eventsError;

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
