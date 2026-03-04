import { useContext, createContext, useCallback } from "react";

const AZTEC_PRICE_USD = 2.1;
const TOKEN_DECIMALS = 2;
const USD_DECIMALS = 2;

interface CurrencyContextValue {
  isUsdMode: boolean;
  toggle: () => void;
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
});

export function useCurrency(options: UseCurrencyOptions = {}): UseCurrencyReturn {
  const { exchangeRate = null } = options;
  const { isUsdMode, toggle } = useContext(CurrencyContext);

  const formatUsd = useCallback((value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num) || num === 0) return "0";
    const formatted = num.toFixed(USD_DECIMALS);
    return parseFloat(formatted).toString();
  }, []);

  const formatToken = useCallback((value: string | number): string => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num) || num === 0) return "0";
    const formatted = num.toFixed(TOKEN_DECIMALS);
    return parseFloat(formatted).toString();
  }, []);

  const aztecToUsd = useCallback(
    (aztec: string | number): string => {
      const num = typeof aztec === "string" ? parseFloat(aztec) : aztec;
      if (isNaN(num) || num <= 0) return "0";
      return formatUsd(num * AZTEC_PRICE_USD);
    },
    [formatUsd]
  );

  const usdToAztec = useCallback(
    (usd: string | number): string => {
      const num = typeof usd === "string" ? parseFloat(usd) : usd;
      if (isNaN(num) || num <= 0 || AZTEC_PRICE_USD <= 0) return "0";
      return formatToken(num / AZTEC_PRICE_USD);
    },
    [formatToken]
  );

  const stAztecToAztec = useCallback(
    (stAztec: string | number): string => {
      if (!exchangeRate || exchangeRate <= 0) return "0";
      const num = typeof stAztec === "string" ? parseFloat(stAztec) : stAztec;
      if (isNaN(num) || num <= 0) return "0";
      return formatToken(num * exchangeRate);
    },
    [exchangeRate, formatToken]
  );

  const aztecToStAztec = useCallback(
    (aztec: string | number): string => {
      if (!exchangeRate || exchangeRate <= 0) return "0";
      const num = typeof aztec === "string" ? parseFloat(aztec) : aztec;
      if (isNaN(num) || num <= 0) return "0";
      return formatToken(num / exchangeRate);
    },
    [exchangeRate, formatToken]
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
    aztecPriceUsd: AZTEC_PRICE_USD,
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
