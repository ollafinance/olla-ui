import { useState, useCallback, type ReactNode } from "react";
import { CurrencySwapContext, type CurrencySwapState } from "@/hooks/useCurrencySwap";

interface CurrencySwapProviderProps {
  children: ReactNode;
}

export function CurrencySwapProvider({ children }: CurrencySwapProviderProps) {
  const [isUsdMode, setIsUsdMode] = useState(false);

  const toggle = useCallback(() => {
    setIsUsdMode((prev) => !prev);
  }, []);

  const value: CurrencySwapState = {
    isUsdMode,
    toggle,
  };

  return <CurrencySwapContext.Provider value={value}>{children}</CurrencySwapContext.Provider>;
}
