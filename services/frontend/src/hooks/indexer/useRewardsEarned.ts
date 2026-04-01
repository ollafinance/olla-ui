import { useMemo } from "react";
import { useReadContract, useConnection } from "wagmi";
import { formatEther } from "viem";
import { useIndexerDeposits } from "./useIndexerDeposits";
import { useIndexerWithdrawals } from "./useIndexerWithdrawals";
import { useIndexerAccounting } from "./useIndexerAccounting";
import { useOllaCoreReads } from "@/hooks/protocol/useOllaCoreReads";
import { CONTRACTS } from "@/constants/contracts";
import type { components } from "@olla-ui/types/schema";

type AccountingUpdate = components["schemas"]["AccountingUpdate"];

const WAD = 1_000_000_000_000_000_000n; // 1e18

/**
 * Returns the exchange rate from the accounting snapshot at or immediately
 * before the given block number. If no snapshot exists before the deposit
 * (i.e. the user deposited before the first indexed AccountingUpdated event),
 * falls back to the earliest available snapshot.
 *
 * The snapshots array must be sorted by block_number ascending.
 */
function interpolateEntryRate(
  snapshots: AccountingUpdate[],
  depositBlock: number
): bigint | null {
  if (!snapshots.length) return null;

  // Binary search for the last snapshot at or before depositBlock
  let lo = 0;
  let hi = snapshots.length - 1;
  let best = -1;

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    if (snapshots[mid].block_number <= depositBlock) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  // Use best match, or fall back to the earliest snapshot if deposit
  // predates all indexed events
  const snapshot = best >= 0 ? snapshots[best] : snapshots[0];

  try {
    return BigInt(snapshot.exchange_rate);
  } catch {
    return null;
  }
}

/**
 * Calculates the total rewards earned by a user using per-deposit exchange
 * rate interpolation from indexed AccountingUpdated events.
 *
 * Formula (all values in AZT wei, rates are WAD-scaled 1e18 fixed-point):
 *
 *   For each deposit:
 *     entryRate = exchange_rate from the accounting snapshot nearest to
 *                 (at or before) the deposit's block_number
 *
 *   Unrealized gain (still-held shares):
 *     unrealizedGain += sharesHeld × (currentRate - entryRate) / WAD
 *     (weighted across deposits using proportional share ownership)
 *
 *   Realized gain (completed exits):
 *     For instant_redemption:
 *       realizedGain += shares × (exitRate - entryRate) / WAD
 *     For redeem_request (completed):
 *       realizedGain += assets_claimed - shares × entryRate / WAD
 *
 *   totalRewards = max(0, realizedGain + unrealizedGain)
 *
 * Falls back to average cost-basis if accounting history is unavailable,
 * and to "0.00" if no deposit data exists at all.
 */
export function useRewardsEarned() {
  const { address } = useConnection();

  const { data: deposits = [], isLoading: isLoadingDeposits } = useIndexerDeposits({
    address,
    limit: 1000,
  });

  const { data: completedWithdrawals = [], isLoading: isLoadingWithdrawals } =
    useIndexerWithdrawals({
      address,
      status: "completed",
      limit: 1000,
    });

  const { data: accountingHistory = [], isLoading: isLoadingAccounting } = useIndexerAccounting({
    contract: CONTRACTS.OllaCore.address,
  });

  const { exchangeRate } = useOllaCoreReads();

  // Raw stAztec balance (bigint wei) — read directly to avoid formatted-string round-trip
  const { data: rawStAztecBalance } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  const isLoading = isLoadingDeposits || isLoadingWithdrawals || isLoadingAccounting;

  const rewardsEarned = useMemo(() => {
    if (!deposits.length || !exchangeRate) {
      return "0.00";
    }

    const sharesHeld = (rawStAztecBalance as bigint | undefined) ?? 0n;
    const hasAccountingHistory = accountingHistory.length > 0;

    // -------------------------------------------------------------------------
    // Path A: Per-deposit rate interpolation (preferred when history is available)
    // -------------------------------------------------------------------------
    if (hasAccountingHistory) {
      // Build a map of deposit tx_hash -> entry rate for quick exit lookup.
      // We also need to track which shares are still held vs. exited.
      // Approach: process deposits oldest-first to build a FIFO share ledger,
      // then compute unrealized gain on remaining shares and realized gain on exits.

      // Sort deposits oldest-first (store returns newest-first)
      const sortedDeposits = [...deposits].sort((a, b) => a.block_number - b.block_number);

      // Each lot: { shares, entryRate }
      type Lot = { shares: bigint; entryRate: bigint };
      const lots: Lot[] = [];

      for (const d of sortedDeposits) {
        try {
          const shares = BigInt(d.shares);
          const entryRate = interpolateEntryRate(accountingHistory, d.block_number);
          if (entryRate === null || shares === 0n) continue;
          lots.push({ shares, entryRate });
        } catch {
          // Skip malformed entries
        }
      }

      if (!lots.length) return "0.00";

      // --- Realized gains from completed exits ---
      let realizedGain = 0n;

      for (const wr of completedWithdrawals) {
        try {
          if (!wr.shares) continue;
          const exitShares = BigInt(wr.shares);
          if (exitShares === 0n) continue;

          // Look up the exit exchange rate
          let exitRate: bigint | null = null;
          if (wr.exchange_rate) {
            try {
              exitRate = BigInt(wr.exchange_rate);
            } catch {
              // fall through
            }
          }

          if (wr.event_type === "instant_redemption" && exitRate !== null) {
            // Instant: rate-delta gain
            const entryRate = interpolateEntryRate(accountingHistory, wr.block_number);
            if (entryRate === null) continue;
            realizedGain += (exitShares * (exitRate - entryRate)) / WAD;
          } else if (wr.event_type === "redeem_request" && wr.assets_claimed) {
            // Queued withdrawal: use assets_claimed minus cost basis
            const assetsClaimed = BigInt(wr.assets_claimed);
            const entryRate = interpolateEntryRate(accountingHistory, wr.block_number);
            if (entryRate === null) continue;
            const costBasis = (exitShares * entryRate) / WAD;
            realizedGain += assetsClaimed - costBasis;
          }
        } catch {
          // Skip malformed entries
        }
      }

      // --- Unrealized gain on still-held shares ---
      // Weight entry rates by share proportion across lots
      let unrealizedGain = 0n;
      if (sharesHeld > 0n) {
        // Compute total shares deposited to weight entry rates
        const totalDeposited = lots.reduce((acc, l) => acc + l.shares, 0n);
        if (totalDeposited > 0n) {
          // Weighted average entry rate across all lots
          let weightedEntryRateSum = 0n;
          for (const lot of lots) {
            weightedEntryRateSum += (lot.entryRate * lot.shares) / totalDeposited;
          }
          const currentValue = (sharesHeld * exchangeRate) / WAD;
          const entryValue = (sharesHeld * weightedEntryRateSum) / WAD;
          unrealizedGain = currentValue - entryValue;
        }
      }

      const total = realizedGain + unrealizedGain;
      const clamped = total < 0n ? 0n : total;
      return Number(formatEther(clamped)).toFixed(2);
    }

    // -------------------------------------------------------------------------
    // Path B: Average cost-basis fallback (when accounting history unavailable)
    // -------------------------------------------------------------------------
    let totalAssetsIn = 0n;
    let totalSharesIn = 0n;

    for (const d of deposits) {
      try {
        totalAssetsIn += BigInt(d.assets);
        totalSharesIn += BigInt(d.shares);
      } catch {
        // Skip malformed entries
      }
    }

    if (totalSharesIn === 0n) return "0.00";

    const costOf = (shares: bigint): bigint => (shares * totalAssetsIn) / totalSharesIn;

    let realizedGain = 0n;
    for (const wr of completedWithdrawals) {
      try {
        if (wr.event_type === "instant_redemption" && wr.shares && wr.net_assets) {
          realizedGain += BigInt(wr.net_assets) - costOf(BigInt(wr.shares));
        } else if (wr.event_type === "redeem_request" && wr.shares && wr.assets_claimed) {
          realizedGain += BigInt(wr.assets_claimed) - costOf(BigInt(wr.shares));
        }
      } catch {
        // Skip malformed entries
      }
    }

    const currentValue = (sharesHeld * exchangeRate) / WAD;
    const unrealizedGain = currentValue - costOf(sharesHeld);

    const total = realizedGain + unrealizedGain;
    const clamped = total < 0n ? 0n : total;
    return Number(formatEther(clamped)).toFixed(2);
  }, [deposits, completedWithdrawals, accountingHistory, exchangeRate, rawStAztecBalance]);

  return { rewardsEarned, isLoading };
}
