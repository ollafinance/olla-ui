import { useState, useMemo, useCallback } from "react";
import { useConnection } from "wagmi";
import { formatEther } from "viem";
import { useDeposit } from "@/hooks/protocol/useDeposit";
import { useOllaCoreReads } from "@/hooks/protocol/useOllaCoreReads";
import { useAztecToken } from "@/hooks/protocol/useAztecToken";
import { useStAztec } from "@/hooks/protocol/useStAztec";

export type StakingState = "idle" | "signing" | "pending" | "confirming" | "success" | "error";

interface UseStakingStateReturn {
  isConnected: boolean;
  state: StakingState;
  amount: string;
  setAmount: (val: string) => void;
  stake: () => void;
  reset: () => void;
  error: string | null;
  aztecBalance: string;
  stAztecBalance: string;
  exchangeRate: string;
  previewShares: string;
  hash: `0x${string}` | undefined;
}

export function useStakingState(): UseStakingStateReturn {
  const { address, isConnected } = useConnection();
  const [amount, setAmount] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  const deposit = useDeposit({
    onSuccess: () => {
      setManualError(null);
    },
    onConfirmed: () => {
      // Queries are automatically invalidated in useDeposit hook
      // This callback can be used for additional UI updates if needed
    },
  });

  const reads = useOllaCoreReads({
    amountToConvert: amount,
    address: address,
  });

  const { balance: aztecBalance } = useAztecToken();
  const { balance: stAztecBalance } = useStAztec();

  const state = useMemo<StakingState>(() => {
    if (manualError || deposit.error) return "error";
    if (deposit.isConfirmed) return "success";
    if (deposit.isConfirming) return "confirming";
    if (deposit.isPending) return "pending";
    if (deposit.isSigning) return "signing";
    return "idle";
  }, [
    deposit.isSigning,
    deposit.isPending,
    deposit.isConfirming,
    deposit.isConfirmed,
    deposit.error,
    manualError,
  ]);

  const error = useMemo(() => {
    if (manualError) return manualError;
    if (deposit.error) {
      const err = deposit.error as Error & { shortMessage?: string };
      return err.shortMessage || err.message || "Transaction failed";
    }
    return null;
  }, [deposit.error, manualError]);

  const stake = useCallback(() => {
    if (!isConnected) return;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setManualError(null);
    deposit.write(amount);
  }, [isConnected, amount, deposit]);

  const reset = useCallback(() => {
    setAmount("");
    setManualError(null);
    deposit.reset();
  }, [deposit]);

  const exchangeRate = reads.exchangeRate
    ? (1 / Number(formatEther(reads.exchangeRate))).toFixed(4)
    : "1.0000";

  const previewShares = reads.previewDepositShares
    ? Number(formatEther(reads.previewDepositShares)).toFixed(4)
    : "0";

  return {
    isConnected,
    state,
    amount,
    setAmount,
    stake,
    reset,
    error,
    aztecBalance,
    stAztecBalance,
    exchangeRate,
    previewShares,
    hash: deposit.hash,
  };
}