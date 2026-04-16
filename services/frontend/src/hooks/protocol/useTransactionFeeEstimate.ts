import { useEstimateFeesPerGas } from "wagmi";
import { fromScaledBigInt } from "@/lib/utils";

export type TransactionType = "stake" | "withdraw-request" | "withdraw-instant";

// Typical gas units per operation. Exact values vary by path (permit vs
// approve-then-write) and calldata, but these are close enough for a UI
// "≈ X ETH" indicator.
const GAS_UNITS: Record<TransactionType, bigint> = {
  stake: 180_000n,
  "withdraw-request": 130_000n,
  "withdraw-instant": 170_000n,
};

// 7 decimals shows fees down to ~100 gwei × 100k gas without rounding to zero
// on low-fee chains (Sepolia/foundry), while still fitting on desktop.
const DISPLAY_DECIMALS = 7;

/**
 * Estimates the gas fee (in ETH) for a given protocol operation by combining
 * the current EIP-1559 max fee per gas with a typical gas-units constant.
 * Returns a trimmed decimal string; "0" while the fee data is loading.
 */
export function useTransactionFeeEstimate(type: TransactionType): string {
  const { data } = useEstimateFeesPerGas({
    query: { refetchInterval: 15_000 },
  });

  const feePerGas = data?.maxFeePerGas ?? data?.gasPrice;
  if (!feePerGas) return "0";

  // weiCost is already 18-decimal-scaled (wei = ETH × 10^18), so fromScaledBigInt
  // with SCALE_DECIMALS=18 formats it directly into an ETH string.
  const weiCost = GAS_UNITS[type] * feePerGas;
  if (weiCost === 0n) return "0";
  return fromScaledBigInt(weiCost, DISPLAY_DECIMALS);
}
