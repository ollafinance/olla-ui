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

// Event signatures for OllaVault
const WITHDRAWAL_REQUESTED_EVENT = parseAbiItem(
  "event WithdrawalRequested(uint256 indexed requestId, address indexed owner, address indexed recipient, uint256 shares, uint256 assetsExpected, uint256 exchangeRate)"
);

const WITHDRAWAL_FINALIZED_EVENT = parseAbiItem(
  "event WithdrawalFinalized(uint256 available, uint256 used)"
);

const WITHDRAWAL_CLAIMED_EVENT = parseAbiItem(
  "event WithdrawalClaimed(uint256 requestId, address recipient, uint256 assets)"
);

/**
 * Fetches withdrawal event logs to get timestamps for requests.
 *
 * TODO: For mainnet, implement one of these solutions:
 * - Use an indexer (The Graph, Goldsky) for event queries
 * - Use Alchemy PAYG tier for larger block ranges
 * - Track last queried block and only fetch new blocks incrementally
 * - Use a backend service to index events
 *
 * @note Currently limited to 10 blocks for Alchemy free tier compatibility.
 */
export function useWithdrawalEvents(address: `0x${string}` | undefined) {
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
      // TODO: For mainnet, use an indexer or larger block range
      // Alchemy free tier limits eth_getLogs to 10 blocks
      const latestBlock = await publicClient.getBlockNumber();
      const fromBlock = latestBlock > 10n ? latestBlock - 10n : 0n;

      // Fetch WithdrawalRequested events for the user (indexed owner field)
      const requestedLogs = await publicClient.getLogs({
        address: CONTRACTS.OllaVault.address,
        event: WITHDRAWAL_REQUESTED_EVENT,
        args: {
          owner: address,
        },
        fromBlock,
        toBlock: "latest",
      });

      // Fetch WithdrawalFinalized events (batch-level, no per-request info)
      const finalizedLogs = await publicClient.getLogs({
        address: CONTRACTS.OllaVault.address,
        event: WITHDRAWAL_FINALIZED_EVENT,
        fromBlock,
        toBlock: "latest",
      });

      // Fetch WithdrawalClaimed events (fields unindexed, fetch all + client-side filter)
      const allClaimedLogs = await publicClient.getLogs({
        address: CONTRACTS.OllaVault.address,
        event: WITHDRAWAL_CLAIMED_EVENT,
        fromBlock,
        toBlock: "latest",
      });
      // Client-side filter by recipient address
      const claimedLogs = allClaimedLogs.filter(
        (log) => (log.args.recipient as string)?.toLowerCase() === address.toLowerCase()
      );

      // Create a map to store event data by request ID
      const eventMap = new Map<bigint, WithdrawalEventData>();
      const claimedIds: bigint[] = [];

      // Process requested events
      for (const log of requestedLogs) {
        const block = await publicClient.getBlock({
          blockHash: log.blockHash,
        });
        const requestId = log.args.requestId as bigint;

        const existing = eventMap.get(requestId) || { requestId };
        existing.requestedAt = Number(block.timestamp);
        eventMap.set(requestId, existing);
      }

      // WithdrawalFinalized is now batch-level (no per-request IDs).
      // We use the finalized block timestamp for all active request IDs
      // that have been finalized (determined by on-chain request state).
      // Skip per-request finalization tracking from events.
      void finalizedLogs;

      // Process claimed events
      for (const log of claimedLogs) {
        const block = await publicClient.getBlock({
          blockHash: log.blockHash,
        });
        const requestId = log.args.requestId as bigint;

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
  }, [publicClient, address]);

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
