export const STAKING_CONSTANTS = {
  APY: "5.2%",
  EXCHANGE_RATE: 0.95,
  TRANSACTION_FEE: "0.0001",
  AZTEC_PRICE_USD: 0.52,
} as const;

export const MOCK_BALANCES = {
  AZTEC_BALANCE: "539.21",
  STAKED_BALANCE: "3000.00",
  REWARDS_EARNED: "295.00",
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

export const ERROR_MESSAGES = {
  INSUFFICIENT_GAS: "Insufficient Gas Fee's",
  INSUFFICIENT_BALANCE: "Insufficient Balance",
  TRANSACTION_REJECTED: "Transaction Rejected",
} as const;
