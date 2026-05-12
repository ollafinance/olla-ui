import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { type Address } from "viem";

/**
 * Minimal ABI for the Aztec Rollup contract functions needed to calculate APR.
 * Sourced from: https://github.com/AztecProtocol/staking-dashboard
 */
const ROLLUP_APR_ABI = [
  {
    inputs: [],
    name: "getRewardConfig",
    outputs: [
      {
        components: [
          { name: "rewardDistributor", type: "address" },
          { name: "sequencerBps", type: "uint16" },
          { name: "booster", type: "address" },
          { name: "blockReward", type: "uint96" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSlotDuration",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getActiveAttesterCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getEntryQueueLength",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getActivationThreshold",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const SECONDS_PER_YEAR = BigInt(365 * 24 * 60 * 60);

interface UseAztecAprReturn {
  /** APR as a percentage string, e.g. "4.50" */
  apr: string | null;
  isLoading: boolean;
}

/**
 * Calculates the Aztec network base staking APR from on-chain Rollup data.
 *
 * Formula (from Aztec staking dashboard):
 *   sequencerBlockReward = blockReward × sequencerBps / 10000
 *   slotsPerYear = secondsPerYear / slotDuration
 *   rewardsPerValidator = (sequencerBlockReward × slotsPerYear) / totalAttesterCount
 *   APR = (rewardsPerValidator / activationThreshold) × 100
 *
 * @param rollupAddress - Address of the Aztec Rollup contract. Pass `null` to disable.
 */
export function useAztecApr(rollupAddress: Address | null): UseAztecAprReturn {
  const publicClient = usePublicClient();
  const [apr, setApr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculate = useCallback(async () => {
    if (!publicClient || !rollupAddress) {
      setIsLoading(false);
      return;
    }

    try {
      const [rewardConfig, slotDuration, activeCount, queueLength, activationThreshold] =
        await Promise.all([
          publicClient.readContract({
            address: rollupAddress,
            abi: ROLLUP_APR_ABI,
            functionName: "getRewardConfig",
          }),
          publicClient.readContract({
            address: rollupAddress,
            abi: ROLLUP_APR_ABI,
            functionName: "getSlotDuration",
          }),
          publicClient.readContract({
            address: rollupAddress,
            abi: ROLLUP_APR_ABI,
            functionName: "getActiveAttesterCount",
          }),
          publicClient.readContract({
            address: rollupAddress,
            abi: ROLLUP_APR_ABI,
            functionName: "getEntryQueueLength",
          }),
          publicClient.readContract({
            address: rollupAddress,
            abi: ROLLUP_APR_ABI,
            functionName: "getActivationThreshold",
          }),
        ]);

      const blockReward = BigInt(rewardConfig.blockReward);
      const sequencerBps = BigInt(rewardConfig.sequencerBps);
      const stakingRequirement = activationThreshold;
      const totalAttesterCount = activeCount + queueLength;

      if (stakingRequirement === 0n || slotDuration === 0n) {
        setIsLoading(false);
        return;
      }

      // Sequencer portion of block reward
      const sequencerBlockReward = (blockReward * sequencerBps) / 10_000n;

      // Annualize
      const slotsPerYear = SECONDS_PER_YEAR / slotDuration;
      const totalAnnualRewards = sequencerBlockReward * slotsPerYear;

      const rewardsPerValidator =
        totalAttesterCount > 0n ? totalAnnualRewards / totalAttesterCount : totalAnnualRewards;

      // Use basis points for precision before converting to percentage
      const aprBasisPoints = (rewardsPerValidator * 10_000n) / stakingRequirement;
      const aprPercent = Number(aprBasisPoints) / 100;

      if (aprPercent > 0 && isFinite(aprPercent)) {
        setApr(aprPercent.toFixed(2));
      }
    } catch (err) {
      console.error("Failed to calculate Aztec APR:", err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, rollupAddress]);

  useEffect(() => {
    calculate();
  }, [calculate]);

  // Refresh every 5 minutes (Aztec APR changes slowly)
  useEffect(() => {
    const interval = setInterval(calculate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [calculate]);

  return { apr, isLoading };
}
