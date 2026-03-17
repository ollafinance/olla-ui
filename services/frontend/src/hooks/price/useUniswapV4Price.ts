import { useReadContract } from "wagmi";
import { keccak256, encodeAbiParameters } from "viem";
import { StateViewABI } from "@/constants/abis/StateView";
import { ChainlinkAggregatorV3ABI } from "@/constants/abis/ChainlinkAggregatorV3";
import {
  UNISWAP_V4_STATE_VIEW,
  CHAINLINK_ETH_USD,
  AZTEC_POOL_KEY,
  UNISWAP_REFETCH_MS,
  CHAINLINK_REFETCH_MS,
} from "@/constants/price-feeds";
import { RPC_URL_MAINNET } from "@olla-ui/types";

// Compute poolId = keccak256(abi.encode(currency0, currency1, fee, tickSpacing, hooks))
const poolId = keccak256(
  encodeAbiParameters(
    [
      { type: "address" },
      { type: "address" },
      { type: "uint24" },
      { type: "int24" },
      { type: "address" },
    ],
    [
      AZTEC_POOL_KEY.currency0,
      AZTEC_POOL_KEY.currency1,
      AZTEC_POOL_KEY.fee,
      AZTEC_POOL_KEY.tickSpacing,
      AZTEC_POOL_KEY.hooks,
    ]
  )
);

const enabled = !!RPC_URL_MAINNET;

export function useUniswapV4Price() {
  const { data: slot0Data } = useReadContract({
    address: UNISWAP_V4_STATE_VIEW as `0x${string}`,
    abi: StateViewABI,
    functionName: "getSlot0",
    args: [poolId],
    chainId: 1,
    query: {
      enabled,
      refetchInterval: UNISWAP_REFETCH_MS,
    },
  });

  const { data: chainlinkData } = useReadContract({
    address: CHAINLINK_ETH_USD as `0x${string}`,
    abi: ChainlinkAggregatorV3ABI,
    functionName: "latestRoundData",
    chainId: 1,
    query: {
      enabled,
      refetchInterval: CHAINLINK_REFETCH_MS,
    },
  });

  const { data: chainlinkDecimals } = useReadContract({
    address: CHAINLINK_ETH_USD as `0x${string}`,
    abi: ChainlinkAggregatorV3ABI,
    functionName: "decimals",
    chainId: 1,
    query: {
      enabled,
      staleTime: Infinity, // decimals never change
    },
  });

  let price: number | null = null;
  let ethPriceUsd: number | null = null;

  if (slot0Data && chainlinkData && chainlinkDecimals != null) {
    const sqrtPriceX96 = slot0Data[0];
    const ethUsdAnswer = chainlinkData[1];
    const decimals = chainlinkDecimals;

    // ethPriceUsd from Chainlink
    ethPriceUsd = Number(ethUsdAnswer) / 10 ** Number(decimals);

    // sqrtPriceX96 encodes sqrt(token1/token0) = sqrt(AZTEC/ETH)
    // price_ratio = (sqrtPriceX96 / 2^96)^2 = AZTEC per ETH
    // aztecPriceEth = 1 / price_ratio
    const sqrtPrice = Number(sqrtPriceX96) / 2 ** 96;
    const priceRatio = sqrtPrice * sqrtPrice; // AZTEC per ETH

    if (priceRatio > 0) {
      const aztecPriceEth = 1 / priceRatio;
      price = aztecPriceEth * ethPriceUsd;
    }
  }

  return { price, ethPriceUsd };
}
