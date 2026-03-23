import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { useCallback } from "react";
import { CONTRACTS } from "@/constants/contracts";
import { useBlockWatcher } from "./useBlockWatcher";
import { useTransactionWithTimeout } from "./useTransactionWithTimeout";

export function useAztecToken() {
  const { address } = useConnection();

  // READS
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.Asset.address,
    abi: CONTRACTS.Asset.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.Asset.address,
    abi: CONTRACTS.Asset.abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.OllaVault.address] : undefined,
    query: { enabled: !!address },
  });

  // Refetch on new blocks
  useBlockWatcher({
    onBlock: () => {
      if (address) {
        refetchBalance();
        refetchAllowance();
      }
    },
    enabled: !!address,
  });

  // WRITES
  const {
    mutate: approve,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
    reset: resetWriteContract,
  } = useWriteContract();

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: approveHash });

  const { timeoutError, startTimeout, reset: resetTimeout } = useTransactionWithTimeout({
    hash: approveHash,
    isConfirmed: isApproveConfirmed,
    refetchAfterConfirm: refetchAllowance,
  });

  const approveSpender = (amount: string) => {
    if (!address) return;
    approve(
      {
        address: CONTRACTS.Asset.address,
        abi: CONTRACTS.Asset.abi,
        functionName: "approve",
        args: [CONTRACTS.OllaVault.address, parseEther(amount)],
      },
      { onSuccess: startTimeout }
    );
  };

  const reset = useCallback(() => {
    resetTimeout();
    resetWriteContract();
  }, [resetTimeout, resetWriteContract]);

  return {
    balance: balance ? formatEther(balance as bigint) : "0",
    allowance: allowance ? formatEther(allowance as bigint) : "0",
    approve: {
      write: approveSpender,
      isPending: isApprovePending,
      isConfirming: isApproveConfirming,
      isConfirmed: isApproveConfirmed,
      hash: approveHash,
      error: timeoutError ?? receiptError ?? approveError,
      reset,
    },
    refetchBalance,
    refetchAllowance,
  };
}
