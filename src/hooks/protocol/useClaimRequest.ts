import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";
import { CONFIRMATION_TIMEOUT_MS } from "@/constants/protocol";
import { useState, useEffect, useRef, useCallback } from "react";

export interface UseClaimRequestOptions {
  onSuccess?: () => void;
  onConfirmed?: () => void;
}

export function useClaimRequest(options: UseClaimRequestOptions = {}) {
  const [timeoutError, setTimeoutError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledConfirmed = useRef(false);

  const {
    mutate: claimMutate,
    data: claimHash,
    isPending: isClaimPending,
    error: claimError,
    reset: resetWriteContract,
  } = useWriteContract();

  const { isLoading: isClaimConfirming, isSuccess: isClaimConfirmed, error: receiptError } =
    useWaitForTransactionReceipt({ hash: claimHash });

  // Clear timeout on success or unmount
  useEffect(() => {
    if (isClaimConfirmed && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isClaimConfirmed]);

  // Reset hasCalledConfirmed when a new transaction hash is generated
  useEffect(() => {
    if (claimHash) {
      hasCalledConfirmed.current = false;
    }
  }, [claimHash]);

  // Handle confirmation
  useEffect(() => {
    if (isClaimConfirmed && !hasCalledConfirmed.current) {
      hasCalledConfirmed.current = true;
      options.onConfirmed?.();
    }
  }, [isClaimConfirmed, options]);

  const claimRequestById = (requestId: bigint) => {
    setTimeoutError(null);
    claimMutate(
      {
        address: CONTRACTS.OllaCore.address,
        abi: CONTRACTS.OllaCore.abi,
        functionName: "claimRequestById",
        args: [requestId],
      },
      {
        onSuccess: () => {
          options.onSuccess?.();
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
  const combinedError = timeoutError || receiptError || claimError;

  return {
    write: claimRequestById,
    isPending: isClaimPending,
    isConfirming: isClaimConfirming,
    isConfirmed: isClaimConfirmed,
    hash: claimHash,
    error: combinedError,
    reset,
  };
}
