export type ClaimStatus = "ready" | "processing" | "claimed";

export interface ClaimItem {
  id: number;
  amount: string;
  status: ClaimStatus;
  usdValue: string;
  daysLeft?: number;
  claimedDate?: string;
}

export const REDEEM_CONSTANTS = {
  AZTEC_PRICE_USD: 2.1,
  EXCHANGE_RATE: "0.95",
  TRANSACTION_FEE: "0.0001",
  APY: "5.2%",
  INSTANT_WITHDRAW_FEE_PERCENT: 0.005,
  WITHDRAWAL_TIME_ESTIMATE: "~7 days",
};

export const MOCK_CLAIMS: ClaimItem[] = [
  {
    id: 1,
    amount: "250.00",
    status: "ready",
    usdValue: "526.32",
  },
  {
    id: 2,
    amount: "250.00",
    status: "processing",
    usdValue: "526.32",
    daysLeft: 2,
  },
  {
    id: 3,
    amount: "250.00",
    status: "claimed",
    usdValue: "526.32",
    claimedDate: "10 Jan 2025",
  },
];
