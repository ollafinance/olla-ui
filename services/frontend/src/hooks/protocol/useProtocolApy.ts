import { useState, useEffect, useCallback } from "react";
import { usePublicClient, useReadContract } from "wagmi";
import { parseAbiItem, formatEther, type PublicClient } from "viem";
import { CONTRACTS } from "@olla-ui/types";
import { useAztecApr } from "./useAztecApr";

const ACCOUNTING_UPDATED_EVENT = parseAbiItem(
  "event AccountingUpdated(uint256 totalAssets, uint256 exchangeRate, uint256 grossRewards, int256 netFlows)"
);

/** How far back (in blocks) to look for exchange rate history. */
// TODO: For mainnet, increase this value and use an indexer or Alchemy PAYG tier
// Alchemy free tier limits eth_getLogs to 10 blocks
const LOOKBACK_BLOCKS = 10n;

/** Minimum time between two data points to produce a meaningful APY (1 hour). */
const MIN_PERIOD_SECONDS = 3600;

const SECONDS_PER_YEAR = 365.25 * 24 * 3600;

interface LatestReport {
  totalAssets: bigint;
  exchangeRate: bigint;
  grossRewards: bigint;
  netFlows: bigint;
  rewardsSnapshot: bigint;
  timestamp: bigint;
}

interface UseProtocolApyReturn {
  /** APY as a percentage string, e.g. "5.20" */
  apy: string;
  /** Whether the APY is derived from on-chain data (vs hardcoded fallback) */
  isLive: boolean;
  isLoading: boolean;
}

function isValidApy(value: number | null): value is number {
  return value !== null && value > 0 && isFinite(value);
}

function parseLatestReport(data: unknown): LatestReport {
  if (Array.isArray(data)) {
    return {
      totalAssets: data[0] as bigint,
      exchangeRate: data[1] as bigint,
      grossRewards: data[2] as bigint,
      netFlows: data[3] as bigint,
      rewardsSnapshot: data[4] as bigint,
      timestamp: data[5] as bigint,
    };
  }
  return data as LatestReport;
}

/**
 * Strategy 1: Compute APY from exchange rate change across multiple
 * `AccountingUpdated` events. Most accurate — smooths out single-period noise.
 */
async function apyFromEvents(client: PublicClient): Promise<number | null> {
  const currentBlock = await client.getBlockNumber();
  const fromBlock = currentBlock > LOOKBACK_BLOCKS ? currentBlock - LOOKBACK_BLOCKS : 0n;

  const logs = await client.getLogs({
    address: CONTRACTS.OllaCore.address,
    event: ACCOUNTING_UPDATED_EVENT,
    fromBlock,
    toBlock: "latest",
  });

  if (logs.length < 2) return null;

  const earliest = logs[0];
  const latest = logs[logs.length - 1];

  const earliestRate = Number(formatEther(earliest.args.exchangeRate as bigint));
  const latestRate = Number(formatEther(latest.args.exchangeRate as bigint));

  if (earliestRate <= 0 || latestRate <= 0) return null;

  const [earliestBlock, latestBlock] = await Promise.all([
    client.getBlock({ blockHash: earliest.blockHash }),
    client.getBlock({ blockHash: latest.blockHash }),
  ]);

  const elapsedSeconds = Number(latestBlock.timestamp) - Number(earliestBlock.timestamp);

  if (elapsedSeconds < MIN_PERIOD_SECONDS) return null;

  const rateRatio = latestRate / earliestRate;
  const annualized = Math.pow(rateRatio, SECONDS_PER_YEAR / elapsedSeconds) - 1;

  return annualized * 100;
}

/**
 * Strategy 2: Annualize the most recent report period's yield using
 * `grossRewards / (totalAssets - grossRewards)`.
 */
function apyFromReport(report: LatestReport): number | null {
  const totalAssets = Number(formatEther(report.totalAssets));
  const grossRewards = Number(formatEther(report.grossRewards));
  const reportTimestamp = Number(report.timestamp);

  if (totalAssets <= 0 || grossRewards <= 0 || reportTimestamp <= 0) return null;

  const now = Date.now() / 1000;
  const elapsed = now - reportTimestamp;

  if (elapsed < 1) return null;

  const preRewardAssets = totalAssets - grossRewards;
  if (preRewardAssets <= 0) return null;

  const periodYield = grossRewards / preRewardAssets;
  const annualized = Math.pow(1 + periodYield, SECONDS_PER_YEAR / elapsed) - 1;

  return annualized * 100;
}

/**
 * Calculates protocol APY from on-chain data.
 *
 * Strategy (in priority order):
 * 1. **Multi-event**: Read `AccountingUpdated` events and compute APY from
 *    exchange rate change between the earliest and latest event.
 * 2. **Single-report**: Use `latestReport()` to annualize the most recent
 *    period's `grossRewards / totalAssets`.
 * 3. **Aztec base APR**: Fall back to the Aztec network staking APR derived
 *    from the Rollup contract's reward config. Used at launch before Olla
 *    has accumulated enough data for its own APY calculation.
 * 4. **Hardcoded fallback**: Use `"0.0"` when nothing else is available.
 */
export function useProtocolApy(): UseProtocolApyReturn {
  const publicClient = usePublicClient();
  const [ollaApy, setOllaApy] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { apr: aztecApr, isLoading: aztecLoading } = useAztecApr(CONTRACTS.AztecRollup.address);

  const { data: latestReportData } = useReadContract({
    address: CONTRACTS.OllaCore.address,
    abi: CONTRACTS.OllaCore.abi,
    functionName: "latestReport",
    query: { refetchInterval: 30_000 },
  });

  const calculate = useCallback(async () => {
    if (!publicClient) {
      setIsLoading(false);
      return;
    }

    try {
      // Strategy 1: Multi-event exchange rate APY
      const eventApy = await apyFromEvents(publicClient);
      if (isValidApy(eventApy)) {
        setOllaApy(eventApy.toFixed(2));
        return;
      }

      // Strategy 2: Single latestReport snapshot
      if (latestReportData) {
        const report = parseLatestReport(latestReportData);
        const reportApy = apyFromReport(report);
        if (isValidApy(reportApy)) {
          setOllaApy(reportApy.toFixed(2));
          return;
        }
      }

      // Strategies 1 & 2 failed — Aztec APR fallback handled in return value
      setOllaApy(null);
    } catch (err) {
      console.error("Failed to calculate protocol APY:", err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, latestReportData]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(calculate, 60_000);
    return () => clearInterval(interval);
  }, [calculate]);

  // Resolve final APY: Olla's own APY > Aztec base APR > "0.0"
  const apy = ollaApy ?? aztecApr ?? "0.0";
  const live = ollaApy !== null || aztecApr !== null;

  return {
    apy,
    isLive: live,
    isLoading: isLoading || aztecLoading,
  };
}
