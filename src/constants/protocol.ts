export const PROTOCOL_CONSTANTS = {
  SLIPPAGE_TOLERANCE_BP: 100n,
  DEADLINE_SECONDS: 3600,
  WITHDRAWAL_DELAY_DAYS: 7, // Days until withdrawal is claimable
} as const;

export const BP_DIVISOR = 10000n;

export const CONFIRMATION_TIMEOUT_MS = 30000; // 30 seconds

export const CLAIMS_REFRESH_INTERVAL_MS = 10000; // 10 seconds

export function applySlippage(amount: bigint, slippageBp: bigint): bigint {
  return (amount * (BP_DIVISOR - slippageBp)) / BP_DIVISOR;
}
