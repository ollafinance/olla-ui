import {
  useReadContract,
  useConnection,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { CONTRACTS } from "@/constants/contracts";
import { useBlockWatcher } from "./useBlockWatcher";
import { CONFIRMATION_TIMEOUT_MS } from "@/constants/protocol";
import { useState, useEffect, useRef, useCallback } from "react";

export function useStAztec() {
  const { address } = useConnection();
  const [timeoutError, setTimeoutError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCalledConfirmed = useRef(false);

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

  // Clear timeout on success or unmount
  useEffect(() => {
    if (isApproveConfirmed && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isApproveConfirmed]);

  // Reset hasCalledConfirmed when a new transaction hash is generated
  useEffect(() => {
    if (approveHash) {
      hasCalledConfirmed.current = false;
    }
  }, [approveHash]);

  // Handle confirmation
  useEffect(() => {
    if (isApproveConfirmed && !hasCalledConfirmed.current) {
      hasCalledConfirmed.current = true;
      refetchAllowance();
    }
  }, [isApproveConfirmed, refetchAllowance]);

  // Actions
  const approveSpender = (amount: string) => {
    if (!address) return;
    setTimeoutError(null);
    approve(
      {
        address: CONTRACTS.StAztec.address,
        abi: CONTRACTS.StAztec.abi,
        functionName: "approve",
        args: [CONTRACTS.OllaVault.address, parseEther(amount)],
      },
      {
        onSuccess: () => {
          // Start timeout for confirmation
          timeoutRef.current = setTimeout(() => {
            setTimeoutError(
              new Error(
                "Transaction confirmation timed out. The transaction may have been reverted or stuck."
              )
            );
          }, CONFIRMATION_TIMEOUT_MS);
        },
      }
    );
  };

  const reset = useCallback(() => {
    setTimeoutError(null);
    hasCalledConfirmed.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    resetWriteContract();
  }, [resetWriteContract]);

  // Combine errors - prioritize timeout error if confirmation is stuck
  const combinedError = timeoutError || receiptError || approveError;

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
      error: combinedError,
      reset,
    },
    refetchBalance,
    refetchTotalSupply,
    refetchAllowance,
  };
}
