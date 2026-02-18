import { useState, useCallback } from "react";

export type StakingState = "idle" | "pending" | "success" | "error";

interface UseStakingStateOptions {
  initialState?: StakingState;
  demoMode?: boolean;
}

interface UseStakingStateReturn {
  state: StakingState;
  amount: string;
  setAmount: (val: string) => void;
  stake: () => void;
  stakeWithError: () => void;
  reset: () => void;
  error: string | null;
  simulatedShares: string;
  _internal: {
    transitionToSuccess: () => void;
    transitionToError: (errorMessage: string) => void;
  };
}

export function useStakingState(options: UseStakingStateOptions = {}): UseStakingStateReturn {
  const { initialState = "idle", demoMode = true } = options;
  
  const [state, setState] = useState<StakingState>(initialState);
  const [amount, setAmount] = useState("95.00");
  const [error, setError] = useState<string | null>(null);

  const simulatedShares = amount && !isNaN(Number(amount))
    ? (Number(amount) * 0.95).toFixed(2)
    : "0.00";

  const stake = useCallback(() => {
    if (!demoMode) return;
    setError(null);
    setState("pending");
  }, [demoMode]);

  const stakeWithError = useCallback(() => {
    if (!demoMode) return;
    setError(null);
    setState("pending");
  }, [demoMode]);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
  }, []);

  const transitionToSuccess = useCallback(() => {
    setState("success");
  }, []);

  const transitionToError = useCallback((errorMessage: string) => {
    setState("error");
    setError(errorMessage);
  }, []);

  return {
    state,
    amount,
    setAmount,
    stake,
    stakeWithError,
    reset,
    error,
    simulatedShares,
    _internal: {
      transitionToSuccess,
      transitionToError,
    },
  };
}