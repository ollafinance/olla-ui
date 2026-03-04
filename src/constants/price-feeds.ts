// Uniswap V4 (Ethereum mainnet)
export const UNISWAP_V4_STATE_VIEW = "0x7ffe42c4a5deea5b0fec41c94c136cf115597227" as const;
export const AZTEC_TOKEN_MAINNET = "0xa27ec0006e59f245217ff08cd52a7e8b169e62d2" as const;
export const CHAINLINK_ETH_USD = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419" as const;

// Pool key — ETH (address(0)) is currency0, AZTEC is currency1
export const AZTEC_POOL_KEY = {
  currency0: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  currency1: AZTEC_TOKEN_MAINNET as `0x${string}`,
  fee: 3000,
  tickSpacing: 60,
  hooks: "0x0000000000000000000000000000000000000000" as `0x${string}`,
} as const;

// CoinGecko
export const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";
export const COINGECKO_AZTEC_ID = "aztec";

// Refetch intervals
export const COINGECKO_REFETCH_MS = 60_000;
export const UNISWAP_REFETCH_MS = 15_000;
export const CHAINLINK_REFETCH_MS = 30_000;

// Fallback price when both sources fail
export const AZTEC_PRICE_USD_FALLBACK = 2.1;
