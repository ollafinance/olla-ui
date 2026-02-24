import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
  useReadContract,
  useSignTypedData,
} from "wagmi";
import { parseEther, parseSignature } from "viem";
import { CONTRACTS } from "@/constants/contracts";
import { PROTOCOL_CONSTANTS } from "@/constants/protocol";
import {
  extractDomainParams,
  buildPermitMessage,
  PERMIT_TYPES,
  type Eip712DomainTuple,
} from "@/lib/permit";
import { useState, useEffect, useRef, useCallback } from "react";

export interface UseRequestRedeemOptions {
  onSuccess?: () => void;
  onConfirmed?: () => void;
}

const CONFIRMATION_TIMEOUT_MS = 30000; // 30 seconds

export function useRequestRedeem(options: UseRequestRedeemOptions = {}) {
  const { address } = useConnection();
  const [isSigning, setIsSigning] = useState(false);
  const [timeoutError, setTimeoutError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledConfirmed = useRef(false);

  const { data: stAztecDomain } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "eip712Domain",
  });

  const { data: stAztecNonce, refetch: refetchStAztecNonce } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "nonces",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { mutateAsync } = useSignTypedData();

  const {
    mutate: requestRedeemMutate,
    data: requestRedeemHash,
    isPending: isRequestRedeemPending,
    error: requestRedeemError,
    reset: resetWriteContract,
  } = useWriteContract();

  const {
    isLoading: isRequestRedeemConfirming,
    isSuccess: isRequestRedeemConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: requestRedeemHash });

  // Clear timeout on success or unmount
  useEffect(() => {
    if (isRequestRedeemConfirmed && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isRequestRedeemConfirmed]);

  // Handle confirmation - refetch nonce and call callback
  useEffect(() => {
    if (isRequestRedeemConfirmed && !hasCalledConfirmed.current) {
      hasCalledConfirmed.current = true;

      // Refetch nonce for next transaction
      refetchStAztecNonce();

      // Call user callback
      options.onConfirmed?.();
    }
  }, [isRequestRedeemConfirmed, refetchStAztecNonce, options]);

  const requestRedeem = async (amount: string) => {
    if (!address || !stAztecDomain || stAztecNonce === undefined) return;

    const domain = extractDomainParams(stAztecDomain as Eip712DomainTuple);

    try {
      setIsSigning(true);
      setTimeoutError(null);

      const { data: currentNonce } = await refetchStAztecNonce();
      if (currentNonce === undefined || currentNonce === null)
        throw new Error("Could not fetch nonce");

      const value = parseEther(amount);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + PROTOCOL_CONSTANTS.DEADLINE_SECONDS);

      const signature = await mutateAsync({
        domain: {
          name: domain.name,
          version: domain.version,
          chainId: Number(domain.chainId),
          verifyingContract: domain.verifyingContract,
        },
        types: {
          Permit: PERMIT_TYPES,
        },
        primaryType: "Permit",
        message: buildPermitMessage(
          address,
          CONTRACTS.OllaCore.address,
          value,
          currentNonce as bigint,
          deadline
        ),
      });

      const { v, r, s } = parseSignature(signature);

      requestRedeemMutate(
        {
          address: CONTRACTS.OllaCore.address,
          abi: CONTRACTS.OllaCore.abi,
          functionName: "requestRedeemWithPermit",
          args: [value, address, deadline, Number(v), r, s],
        },
        {
          onSuccess: () => {
            setIsSigning(false);
            // Start timeout for confirmation
            timeoutRef.current = setTimeout(() => {
              setTimeoutError(
                new Error(
                  "Transaction confirmation timed out. The transaction may have been reverted or stuck."
                )
              );
            }, CONFIRMATION_TIMEOUT_MS);
            options.onSuccess?.();
          },
          onError: () => setIsSigning(false),
        }
      );
    } catch (error) {
      console.error("Permit signing failed:", error);
      setIsSigning(false);
    }
  };

  const reset = useCallback(() => {
    setIsSigning(false);
    setTimeoutError(null);
    hasCalledConfirmed.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    resetWriteContract();
  }, [resetWriteContract]);

  // Combine errors - prioritize timeout error if confirmation is stuck
  const combinedError = timeoutError || receiptError || requestRedeemError;

  return {
    write: requestRedeem,
    isSigning,
    isPending: isRequestRedeemPending,
    isConfirming: isRequestRedeemConfirming,
    isConfirmed: isRequestRedeemConfirmed,
    hash: requestRedeemHash,
    error: combinedError,
    reset,
  };
}
