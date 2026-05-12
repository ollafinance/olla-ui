import {
  useReadContract,
  useConnection,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { useCallback } from "react";
import { CONTRACTS } from "@/constants/contracts";
import { useBlockWatcher } from "./useBlockWatcher";
import { useTransactionWithTimeout } from "./useTransactionWithTimeout";

export function useStAztec() {
  const { address } = useConnection();

  // READS
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.OllaVault.address] : undefined,
    query: { enabled: !!address },
  });

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "totalSupply",
  });

  // Refetch on new blocks
  useBlockWatcher({
    onBlock: () => {
      if (address) {
        refetchBalance();
        refetchAllowance();
        refetchTotalSupply();
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
        address: CONTRACTS.StAztec.address,
        abi: CONTRACTS.StAztec.abi,
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
    totalSupply: totalSupply ? formatEther(totalSupply as bigint) : "0",
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
    refetchTotalSupply,
    refetchAllowance,
  };
}
