export const STAKING_CONSTANTS = {
  APY: "5.2%",
  TRANSACTION_FEE: "0.0001",
  EXCHANGE_RATE: 0.95,
} as const;

export const PERCENTAGE_OPTIONS = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "Max", value: 1 },
] as const;

export const RETURN_PERIODS = [
  { label: "1 Day", multiplier: 1 },
  { label: "1 Month", multiplier: 30 },
  { label: "1 Year", multiplier: 365 },
] as const;
