import { usePublicClient } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { CLAIMS_REFRESH_INTERVAL_MS } from "@/constants/protocol";
import { useState, useEffect, useCallback } from "react";
import { parseAbiItem } from "viem";

export interface WithdrawalEventData {
  requestId: bigint;
  requestedAt?: number; // Unix timestamp in seconds
  finalizedAt?: number; // Unix timestamp in seconds
  claimedAt?: number; // Unix timestamp in seconds
}

// Event signatures for WithdrawalQueue
const WITHDRAWAL_REQUESTED_EVENT = parseAbiItem(
  "event WithdrawalRequested(uint256 indexed id, address indexed recipient, uint256 shares, uint256 assetsExpected, uint256 rate)"
);

const WITHDRAWAL_FINALIZED_EVENT = parseAbiItem(
  "event WithdrawalFinalized(uint256 indexed id, uint256 assets)"
);

const WITHDRAWAL_CLAIMED_EVENT = parseAbiItem(
  "event WithdrawalClaimed(uint256 indexed id, address indexed recipient, uint256 assetsExpected)"
);

/**
 * Fetches withdrawal event logs to get timestamps for requests.
 * @note Fetches events from block 0. For mainnet, this could be slow/expensive.
 * Consider using an indexer (The Graph, Goldsky) or limiting block range for production.
 */
export function useWithdrawalEvents(address: `0x${string}` | undefined, requestIds: bigint[]) {
  const publicClient = usePublicClient();
  const [eventData, setEventData] = useState<Map<bigint, WithdrawalEventData>>(new Map());
  const [claimedRequestIds, setClaimedRequestIds] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!publicClient || !address) {
      setEventData(new Map());
      setClaimedRequestIds([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch WithdrawalRequested events for the user
      const requestedLogs = await publicClient.getLogs({
        address: CONTRACTS.WithdrawalQueue.address,
        event: WITHDRAWAL_REQUESTED_EVENT,
        args: {
          recipient: address,
        },
        fromBlock: 0n,
        toBlock: "latest",
      });

      // Fetch WithdrawalFinalized events for the specific request IDs
      const finalizedLogs = await publicClient.getLogs({
        address: CONTRACTS.WithdrawalQueue.address,
        event: WITHDRAWAL_FINALIZED_EVENT,
        fromBlock: 0n,
        toBlock: "latest",
      });

      // Fetch WithdrawalClaimed events
      const claimedLogs = await publicClient.getLogs({
        address: CONTRACTS.WithdrawalQueue.address,
        event: WITHDRAWAL_CLAIMED_EVENT,
        args: {
          recipient: address,
        },
        fromBlock: 0n,
        toBlock: "latest",
      });

      // Create a map to store event data by request ID
      const eventMap = new Map<bigint, WithdrawalEventData>();
      const claimedIds: bigint[] = [];

      // Process requested events
      for (const log of requestedLogs) {
        const block = await publicClient.getBlock({
          blockHash: log.blockHash,
        });
        const requestId = log.args.id as bigint;

        const existing = eventMap.get(requestId) || { requestId };
        existing.requestedAt = Number(block.timestamp);
        eventMap.set(requestId, existing);
      }

      // Process finalized events (filter for user's requests)
      for (const log of finalizedLogs) {
        const requestId = log.args.id as bigint;
        // Only process if this request ID is in our list
        if (requestIds.includes(requestId)) {
          const block = await publicClient.getBlock({
            blockHash: log.blockHash,
          });

          const existing = eventMap.get(requestId) || { requestId };
          existing.finalizedAt = Number(block.timestamp);
          eventMap.set(requestId, existing);
        }
      }

      // Process claimed events
      for (const log of claimedLogs) {
        const block = await publicClient.getBlock({
          blockHash: log.blockHash,
        });
        const requestId = log.args.id as bigint;

        const existing = eventMap.get(requestId) || { requestId };
        existing.claimedAt = Number(block.timestamp);
        eventMap.set(requestId, existing);

        // Track claimed request IDs
        if (!claimedIds.includes(requestId)) {
          claimedIds.push(requestId);
        }
      }

      setEventData(eventMap);
      setClaimedRequestIds(claimedIds);
    } catch (err) {
      console.error("Failed to fetch withdrawal events:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch event logs"));
      // On error, return empty map - fallback will use hardcoded estimates
      setEventData(new Map());
      setClaimedRequestIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, address, requestIds]);

  // Fetch events on mount and when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!address) return;

    const interval = setInterval(() => {
      fetchEvents();
    }, CLAIMS_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchEvents, address]);

  return {
    eventData,
    claimedRequestIds,
    isLoading,
    error,
    refetch: fetchEvents,
  };
}
