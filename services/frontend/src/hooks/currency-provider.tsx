import { useState, useCallback, useMemo, type ReactNode } from "react";
import { CurrencyContext } from "./useCurrency";
import { useAztecPrice } from "./price";

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [isUsdMode, setIsUsdMode] = useState(false);
  const { price: aztecPriceUsd } = useAztecPrice();

  const toggle = useCallback(() => {
    setIsUsdMode((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({ isUsdMode, toggle, aztecPriceUsd }),
    [isUsdMode, toggle, aztecPriceUsd]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
