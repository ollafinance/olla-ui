import { useState } from "react";

interface UsePercentageSelectOptions {
  /** User's balance in the internal (token) unit — Aztec for staking, stAztec for withdraw. */
  balance: string;
  /** Whether the user is currently editing in USD. */
  isUsdMode: boolean;
  /** Called with the next internal (token) amount. */
  onAmountChange: (val: string) => void;
  /** Convert a USD value to the internal (token) representation. */
  usdToToken: (usd: string | number) => string;
  /** Convert an internal (token) value to USD. */
  tokenToUsd: (token: string | number) => string;
  /** Initial preselected percentage (e.g. 0.25). */
  initialPercentage?: number;
}

/**
 * Manages the "select a balance percentage" controls. Computes the next amount
 * in the internal token unit (USD path round-trips via the provided converters)
 * and clamps the result to `balance` so rounding can't push it over 100%.
 */
export function usePercentageSelect({
  balance,
  isUsdMode,
  onAmountChange,
  usdToToken,
  tokenToUsd,
  initialPercentage,
}: UsePercentageSelectOptions) {
  const [selectedPercentage, setSelectedPercentage] = useState<number | undefined>(
    initialPercentage
  );

  const handlePercentageSelect = (percentage: number) => {
    setSelectedPercentage(percentage);
    const parsedBalance = parseFloat(balance);
    if (isNaN(parsedBalance) || parsedBalance <= 0) return;

    let next: string;
    if (isUsdMode) {
      const usdBalance = tokenToUsd(parsedBalance);
      const newUsdAmount = (parseFloat(usdBalance) * percentage).toFixed(2);
      next = usdToToken(newUsdAmount);
    } else {
      next = (parsedBalance * percentage).toFixed(2);
    }

    onAmountChange(Number(next) > parsedBalance ? balance : next);
  };

  return { selectedPercentage, setSelectedPercentage, handlePercentageSelect };
}
