import { usePublicClient } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { CLAIMS_REFRESH_INTERVAL_MS } from "@/constants/protocol";
import { useState, useEffect, useCallback } from "react";
import { parseAbiItem } from "viem";

export interface InstantRedemptionEvent {
  owner: `0x${string}`;
  recipient: `0x${string}`;
  shares: bigint;
  grossAssets: bigint;
  fee: bigint;
  netAssets: bigint;
  exchangeRate: bigint;
  timestamp: number;
}

// Event signature for OllaCore InstantRedemption
const INSTANT_REDEMPTION_EVENT = parseAbiItem(
  "event InstantRedemption(address indexed owner, address indexed recipient, uint256 shares, uint256 grossAssets, uint256 fee, uint256 netAssets, uint256 exchangeRate)"
);

/**
 * Fetches InstantRedemption events from OllaCore to track instant redemptions.
 * @note Fetches events from block 0. For mainnet, this could be slow/expensive.
 * Consider using an indexer (The Graph, Goldsky) or limiting block range for production.
 */
export function useInstantRedemptionEvents(address: `0x${string}` | undefined) {
  const publicClient = usePublicClient();
  const [events, setEvents] = useState<InstantRedemptionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!publicClient || !address) {
      setEvents([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch InstantRedemption events for the user
      const redemptionLogs = await publicClient.getLogs({
        address: CONTRACTS.OllaVault.address,
        event: INSTANT_REDEMPTION_EVENT,
        args: {
          owner: address,
        },
        fromBlock: 0n,
        toBlock: "latest",
      });

      // Process redemption events
      const redemptionEvents: InstantRedemptionEvent[] = [];
      for (const log of redemptionLogs) {
        const block = await publicClient.getBlock({
          blockHash: log.blockHash,
        });

        redemptionEvents.push({
          owner: log.args.owner as `0x${string}`,
          recipient: log.args.recipient as `0x${string}`,
          shares: log.args.shares as bigint,
          grossAssets: log.args.grossAssets as bigint,
          fee: log.args.fee as bigint,
          netAssets: log.args.netAssets as bigint,
          exchangeRate: log.args.exchangeRate as bigint,
          timestamp: Number(block.timestamp),
        });
      }

      // Sort by timestamp (newest first)
      redemptionEvents.sort((a, b) => b.timestamp - a.timestamp);

      setEvents(redemptionEvents);
    } catch (err) {
      console.error("Failed to fetch instant redemption events:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch instant redemption events"));
      setEvents([]);
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
    events,
    isLoading,
    error,
    refetch: fetchEvents,
  };
}
