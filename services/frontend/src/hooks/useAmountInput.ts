import { useState } from "react";
import { sanitizeNumericInput } from "@/lib/utils";

interface UseAmountInputOptions {
  /** External canonical amount in the internal (token) unit. */
  amount: string;
  /** Whether the user is currently editing in USD. */
  isUsdMode: boolean;
  /** Called with the next internal (token) amount whenever the user types. */
  onAmountChange: (val: string) => void;
  /** Convert a USD value to the internal (token) representation. */
  usdToToken: (usd: string | number) => string;
  /** Convert an internal (token) value to USD for display. */
  tokenToUsd: (token: string | number) => string;
}

/**
 * Manages a numeric amount input that can toggle between USD and a token unit,
 * keeping the displayed text stable while the user types (no cursor jumps or
 * reformatting) and re-syncing when the external amount or currency mode changes.
 */
export function useAmountInput({
  amount,
  isUsdMode,
  onAmountChange,
  usdToToken,
  tokenToUsd,
}: UseAmountInputOptions) {
  const [inputValue, setInputValue] = useState("");
  const [lastSyncedAmount, setLastSyncedAmount] = useState(amount);
  const [lastMode, setLastMode] = useState(isUsdMode);

  if (amount !== lastSyncedAmount || isUsdMode !== lastMode) {
    const shouldUpdate = (() => {
      if (isUsdMode !== lastMode) return true;
      const inputAsToken = isUsdMode ? usdToToken(inputValue) : inputValue;
      // Exact string match — the user's current input already represents `amount`.
      if (inputAsToken === amount) return false;
      const parsedInput = parseFloat(inputAsToken);
      const parsedAmount = parseFloat(amount || "0");
      // Numerical equality — preserves partial input like "1." or "1.0" that
      // parses to the same number as `amount`.
      if (!isNaN(parsedInput) && parsedInput === parsedAmount) return false;
      if (!inputAsToken || isNaN(parsedInput)) return true;
      // Fall back to an absolute-drift check.
      return Math.abs(parsedInput - parsedAmount) > 0.000001;
    })();

    if (shouldUpdate) {
      const newValue = isUsdMode ? tokenToUsd(amount) : amount;
      setInputValue(newValue === "0" ? "" : newValue);
    }

    setLastSyncedAmount(amount);
    setLastMode(isUsdMode);
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (!/^\d*\.?\d*$/.test(rawValue)) return;

    setInputValue(rawValue);
    const sanitizedValue = sanitizeNumericInput(rawValue);

    if (isUsdMode) {
      const usdAmount = parseFloat(sanitizedValue);
      if (!isNaN(usdAmount) && usdAmount > 0) {
        onAmountChange(usdToToken(usdAmount));
      } else {
        onAmountChange("0");
      }
    } else {
      onAmountChange(sanitizedValue);
    }
  };

  return { inputValue, handleInputChange };
}
