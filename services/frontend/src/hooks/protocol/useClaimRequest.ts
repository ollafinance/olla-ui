import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useCallback } from "react";
import { CONTRACTS } from "@/constants/contracts";
import { useTransactionWithTimeout } from "./useTransactionWithTimeout";

export interface UseClaimRequestOptions {
  onSuccess?: () => void;
  onConfirmed?: () => void;
}

export function useClaimRequest(options: UseClaimRequestOptions = {}) {
  const {
    mutate: claimMutate,
    data: claimHash,
    isPending: isClaimPending,
    error: claimError,
    reset: resetWriteContract,
  } = useWriteContract();

  const {
    isLoading: isClaimConfirming,
    isSuccess: isClaimConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: claimHash });

  const { timeoutError, startTimeout, reset: resetTimeout } = useTransactionWithTimeout({
    hash: claimHash,
    isConfirmed: isClaimConfirmed,
    onConfirmed: options.onConfirmed,
  });

  const claimRequestById = (requestId: bigint) => {
    claimMutate(
      {
        address: CONTRACTS.OllaVault.address,
        abi: CONTRACTS.OllaVault.abi,
        functionName: "claimRequestById",
        args: [requestId],
      },
      {
        onSuccess: () => {
          options.onSuccess?.();
          startTimeout();
        },
      }
    );
  };

  const reset = useCallback(() => {
    resetTimeout();
    resetWriteContract();
  }, [resetTimeout, resetWriteContract]);

  return {
    write: claimRequestById,
    isPending: isClaimPending,
    isConfirming: isClaimConfirming,
    isConfirmed: isClaimConfirmed,
    hash: claimHash,
    error: timeoutError ?? receiptError ?? claimError,
    reset,
  };
}
