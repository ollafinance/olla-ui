import { useState, useCallback, type ReactNode } from "react";
import { CurrencyContext } from "./useCurrency";

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const [isUsdMode, setIsUsdMode] = useState(false);

  const toggle = useCallback(() => {
    setIsUsdMode((prev) => !prev);
  }, []);

  return (
    <CurrencyContext.Provider value={{ isUsdMode, toggle }}>{children}</CurrencyContext.Provider>
  );
}
