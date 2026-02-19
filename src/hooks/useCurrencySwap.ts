import { createContext, useContext } from "react";

export type CurrencySwapState = {
  isUsdMode: boolean;
  toggle: () => void;
};

export const initialCurrencySwapState: CurrencySwapState = {
  isUsdMode: false,
  toggle: () => null,
};

export const CurrencySwapContext = createContext<CurrencySwapState>(initialCurrencySwapState);

export const useCurrencySwap = () => {
  const context = useContext(CurrencySwapContext);

  if (context === undefined)
    throw new Error("useCurrencySwap must be used within a CurrencySwapProvider");

  return context;
};
