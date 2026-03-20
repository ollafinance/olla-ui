import { useMemo } from "react";
import { useReadContract, useConnection } from "wagmi";
import { formatEther } from "viem";
import { useIndexerDeposits } from "./useIndexerDeposits";
import { useIndexerWithdrawals } from "./useIndexerWithdrawals";
import { useOllaCoreReads } from "@/hooks/protocol/useOllaCoreReads";
import { CONTRACTS } from "@/constants/contracts";

const WAD = 1_000_000_000_000_000_000n; // 1e18

/**
 * Calculates the total rewards earned by a user using average cost basis.
 *
 * Formula (all values in AZT wei):
 *   avgBuyRate = totalAssetsIn / totalSharesIn
 *
 *   For each completed queued exit (redeem_request, status=completed):
 *     realizedGain += assetsClaimed - shares × avgBuyRate
 *
 *   For each instant redemption:
 *     realizedGain += netAssets - shares × avgBuyRate
 *
 *   unrealizedGain = sharesHeld × (currentRate - avgBuyRate)
 *
 *   totalRewards = max(0, realizedGain + unrealizedGain)
 *
 * Falls back to "0.00" when the indexer is unavailable or data is loading.
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

  const isLoading = isLoadingDeposits || isLoadingWithdrawals;

  const rewardsEarned = useMemo(() => {
    // Need at least some deposit history and the current exchange rate
    if (!deposits.length || !exchangeRate) {
      return "0.00";
    }

    // --- Step 1: Compute average buy rate (avgBuyRate = totalAssets / totalShares, WAD-scaled) ---
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

    if (totalSharesIn === 0n) {
      return "0.00";
    }

    // avgBuyRate is a WAD-scaled ratio: avgBuyRate * WAD / totalSharesIn
    // To avoid division before multiplication we keep it as a fraction:
    //   costOf(shares) = shares * totalAssetsIn / totalSharesIn
    const costOf = (shares: bigint): bigint => (shares * totalAssetsIn) / totalSharesIn;

    // --- Step 2: Realized gains from completed exits ---
    let realizedGain = 0n;

    for (const wr of completedWithdrawals) {
      try {
        if (wr.event_type === "instant_redemption" && wr.shares && wr.net_assets) {
          // Instant redemption: user received net_assets for shares
          const shares = BigInt(wr.shares);
          const netAssets = BigInt(wr.net_assets);
          realizedGain += netAssets - costOf(shares);
        } else if (wr.event_type === "redeem_request" && wr.shares && wr.assets_claimed) {
          // Completed queued withdrawal: redeem_request row updated with assets_claimed
          const shares = BigInt(wr.shares);
          const assetsClaimed = BigInt(wr.assets_claimed);
          realizedGain += assetsClaimed - costOf(shares);
        }
        // withdrawal_claimed rows: shares=null, skip (the paired redeem_request row covers this)
      } catch {
        // Skip malformed entries
      }
    }

    // --- Step 3: Unrealized gains on still-held shares ---
    const sharesHeld = (rawStAztecBalance as bigint | undefined) ?? 0n;
    // exchangeRate is a WAD-scaled value: 1 share = exchangeRate/WAD assets
    const currentValue = (sharesHeld * exchangeRate) / WAD;
    const costOfHeld = costOf(sharesHeld);
    const unrealizedGain = currentValue - costOfHeld;

    // --- Step 4: Total, clamped at zero ---
    const total = realizedGain + unrealizedGain;
    const clamped = total < 0n ? 0n : total;

    return Number(formatEther(clamped)).toFixed(2);
  }, [deposits, completedWithdrawals, exchangeRate, rawStAztecBalance]);

  return { rewardsEarned, isLoading };
}
