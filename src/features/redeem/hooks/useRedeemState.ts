import { useState, useCallback } from "react";
import type { ClaimItem } from "../constants";
import { MOCK_CLAIMS } from "../constants";

export type RedeemState = "idle" | "pending" | "success" | "error";

interface UseRedeemStateOptions {
  initialState?: RedeemState;
  demoMode?: boolean;
}

interface UseRedeemStateReturn {
  state: RedeemState;
  amount: string;
  setAmount: (val: string) => void;
  withdraw: () => void;
  withdrawWithError: () => void;
  reset: () => void;
  error: string | null;
  simulatedReceived: string;
  claims: ClaimItem[];
  claimItem: (id: number) => void;
  _internal: {
    transitionToSuccess: () => void;
    transitionToError: (errorMessage: string) => void;
  };
}

export function useRedeemState(
  options: UseRedeemStateOptions = {},
): UseRedeemStateReturn {
  const { initialState = "idle", demoMode = true } = options;

  const [state, setState] = useState<RedeemState>(initialState);
  const [amount, setAmount] = useState("95.00");
  const [error, setError] = useState<string | null>(null);
  const [claims, setClaims] = useState<ClaimItem[]>(MOCK_CLAIMS);

  const simulatedReceived =
    amount && !isNaN(Number(amount))
      ? (Number(amount) * 0.95).toFixed(2)
      : "0.00";

  const withdraw = useCallback(() => {
    if (!demoMode) return;
    setError(null);
    setState("pending");
  }, [demoMode]);

  const withdrawWithError = useCallback(() => {
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
    const newClaim: ClaimItem = {
      id: Date.now(),
      amount: amount,
      status: "processing",
      usdValue: (Number(amount) * 2.1).toFixed(2),
      daysLeft: 2,
    };
    setClaims((prev) => [newClaim, ...prev]);
  }, [amount]);

  const transitionToError = useCallback((errorMessage: string) => {
    setState("error");
    setError(errorMessage);
  }, []);

  const claimItem = useCallback((id: number) => {
    setClaims((prev) =>
      prev.map((claim) =>
        claim.id === id
          ? {
              ...claim,
              status: "claimed",
              claimedDate: new Date().toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
            }
          : claim,
      ),
    );
  }, []);

  return {
    state,
    amount,
    setAmount,
    withdraw,
    withdrawWithError,
    reset,
    error,
    simulatedReceived,
    claims,
    claimItem,
    _internal: {
      transitionToSuccess,
      transitionToError,
    },
  };
}

