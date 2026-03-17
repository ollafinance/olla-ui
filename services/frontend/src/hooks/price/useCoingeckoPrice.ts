import { useQuery } from "@tanstack/react-query";
import {
  COINGECKO_API_URL,
  COINGECKO_AZTEC_ID,
  COINGECKO_REFETCH_MS,
} from "@/constants/price-feeds";

interface CoingeckoResponse {
  [id: string]: { usd?: number };
}

export function useCoingeckoPrice() {
  return useQuery({
    queryKey: ["aztec-price", "coingecko"],
    queryFn: async (): Promise<number | null> => {
      const url = `${COINGECKO_API_URL}?ids=${COINGECKO_AZTEC_ID}&vs_currencies=usd`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
      const data: CoingeckoResponse = await res.json();
      return data[COINGECKO_AZTEC_ID]?.usd ?? null;
    },
    refetchInterval: COINGECKO_REFETCH_MS,
    retry: 3,
    staleTime: COINGECKO_REFETCH_MS,
  });
}
