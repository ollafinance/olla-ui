export const PROTOCOL_CONSTANTS = {
  SLIPPAGE_TOLERANCE_BP: 100n,
  DEADLINE_SECONDS: 3600,
} as const;

export const BP_DIVISOR = 10000n;

export const CONFIRMATION_TIMEOUT_MS = 30000; // 30 seconds

export function applySlippage(amount: bigint, slippageBp: bigint): bigint {
  return (amount * (BP_DIVISOR - slippageBp)) / BP_DIVISOR;
}
