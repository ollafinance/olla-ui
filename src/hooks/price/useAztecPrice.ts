import { useCoingeckoPrice } from "./useCoingeckoPrice";
import { useUniswapV4Price } from "./useUniswapV4Price";
import { AZTEC_PRICE_USD_FALLBACK } from "@/constants/price-feeds";

export function useAztecPrice() {
  const coingecko = useCoingeckoPrice();
  const uniswap = useUniswapV4Price();

  const coingeckoPrice = coingecko.data ?? null;
  const uniswapPrice = uniswap.price;
  const ethPriceUsd = uniswap.ethPriceUsd;

  const price = coingeckoPrice ?? uniswapPrice ?? AZTEC_PRICE_USD_FALLBACK;
  const source: "coingecko" | "uniswap" | "fallback" = coingeckoPrice
    ? "coingecko"
    : uniswapPrice
      ? "uniswap"
      : "fallback";
  const isLoading = coingecko.isLoading;

  return { price, source, isLoading, coingeckoPrice, uniswapPrice, ethPriceUsd };
}
