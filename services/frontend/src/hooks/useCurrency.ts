import { useContext, createContext, useCallback } from "react";
import {
  toScaledBigInt,
  fromScaledBigInt,
  mulScaled,
  divScaled,
  toPlainDecimal,
} from "@/lib/utils";

const TOKEN_DECIMALS = 2;
const USD_DECIMALS = 2;

function trimTrailingDecimalZeros(s: string): string {
  if (!s.includes(".")) return s;
  return s.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

interface CurrencyContextValue {
  isUsdMode: boolean;
  toggle: () => void;
  aztecPriceUsd: number;
}

interface UseCurrencyOptions {
  exchangeRate?: number | null;
}

interface UseCurrencyReturn {
  isUsdMode: boolean;
  toggle: () => void;
  aztecPriceUsd: number;
  exchangeRate: number | null;
  aztecToUsd: (aztec: string | number) => string;
  usdToAztec: (usd: string | number) => string;
  stAztecToAztec: (stAztec: string | number) => string;
  aztecToStAztec: (aztec: string | number) => string;
  stAztecToUsd: (stAztec: string | number) => string;
  usdToStAztec: (usd: string | number) => string;
  formatUsd: (value: string | number) => string;
  formatToken: (value: string | number) => string;
}

export const CurrencyContext = createContext<CurrencyContextValue>({
  isUsdMode: false,
  toggle: () => {},
  aztecPriceUsd: 0,
});

export function useCurrency(options: UseCurrencyOptions = {}): UseCurrencyReturn {
  const { exchangeRate = null } = options;
  const { isUsdMode, toggle, aztecPriceUsd } = useContext(CurrencyContext);

  const formatUsd = useCallback((value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!Number.isFinite(num) || num === 0) return "0";
    return trimTrailingDecimalZeros(toPlainDecimal(num, USD_DECIMALS));
  }, []);

  const formatToken = useCallback((value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (!Number.isFinite(num) || num === 0) return "0";
    return trimTrailingDecimalZeros(toPlainDecimal(num, TOKEN_DECIMALS));
  }, []);

  const aztecToUsd = useCallback(
    (aztec: string | number): string => {
      const aztecBig = toScaledBigInt(aztec);
      if (aztecBig === 0n || aztecPriceUsd <= 0) return "0";
      return fromScaledBigInt(mulScaled(aztecBig, toScaledBigInt(aztecPriceUsd)), USD_DECIMALS);
    },
    [aztecPriceUsd]
  );

  const usdToAztec = useCallback(
    (usd: string | number): string => {
      const usdBig = toScaledBigInt(usd);
      const priceBig = toScaledBigInt(aztecPriceUsd);
      if (usdBig === 0n || priceBig === 0n) return "0";
      return fromScaledBigInt(divScaled(usdBig, priceBig), TOKEN_DECIMALS);
    },
    [aztecPriceUsd]
  );

  const stAztecToAztec = useCallback(
    (stAztec: string | number): string => {
      if (!exchangeRate || exchangeRate <= 0) return "0";
      const stAztecBig = toScaledBigInt(stAztec);
      if (stAztecBig === 0n) return "0";
      return fromScaledBigInt(mulScaled(stAztecBig, toScaledBigInt(exchangeRate)), TOKEN_DECIMALS);
    },
    [exchangeRate]
  );

  const aztecToStAztec = useCallback(
    (aztec: string | number): string => {
      if (!exchangeRate || exchangeRate <= 0) return "0";
      const aztecBig = toScaledBigInt(aztec);
      if (aztecBig === 0n) return "0";
      return fromScaledBigInt(divScaled(aztecBig, toScaledBigInt(exchangeRate)), TOKEN_DECIMALS);
    },
    [exchangeRate]
  );

  const stAztecToUsd = useCallback(
    (stAztec: string | number): string => {
      const aztec = stAztecToAztec(stAztec);
      return aztecToUsd(aztec);
    },
    [stAztecToAztec, aztecToUsd]
  );

  const usdToStAztec = useCallback(
    (usd: string | number): string => {
      const aztec = usdToAztec(usd);
      return aztecToStAztec(aztec);
    },
    [usdToAztec, aztecToStAztec]
  );

  return {
    isUsdMode,
    toggle,
    aztecPriceUsd,
    exchangeRate,
    aztecToUsd,
    usdToAztec,
    stAztecToAztec,
    aztecToStAztec,
    stAztecToUsd,
    usdToStAztec,
    formatUsd,
    formatToken,
  };
}
