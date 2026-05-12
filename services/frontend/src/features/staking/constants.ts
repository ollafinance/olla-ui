export const STAKING_CONSTANTS = {
  APY: "0.0",
  TRANSACTION_FEE: "0.0001",
  EXCHANGE_RATE: 0.95,
} as const;

export const RETURN_PERIODS = [
  { label: "1 Day", multiplier: 1 },
  { label: "1 Month", multiplier: 30 },
  { label: "1 Year", multiplier: 365 },
] as const;
