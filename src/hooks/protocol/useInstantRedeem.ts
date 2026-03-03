import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
  useReadContract,
  useSignTypedData,
  useConfig,
  usePublicClient,
} from "wagmi";
import { parseEther, parseSignature } from "viem";
import { readContract } from "wagmi/actions";
import { CONTRACTS } from "@/constants/contracts";
import { PROTOCOL_CONSTANTS, applySlippage, CONFIRMATION_TIMEOUT_MS } from "@/constants/protocol";
import {
  extractDomainParams,
  buildPermitMessage,
  PERMIT_TYPES,
  type Eip712DomainTuple,
} from "@/lib/permit";
import { useState, useEffect, useRef, useCallback } from "react";

export interface UseInstantRedeemOptions {
  onSuccess?: () => void;
  onConfirmed?: () => void;
}

export function useInstantRedeem(options: UseInstantRedeemOptions = {}) {
  const { address } = useConnection();
  const config = useConfig();
  const publicClient = usePublicClient();
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
    mutate: instantRedeemMutate,
    data: instantRedeemHash,
    isPending: isInstantRedeemPending,
    error: instantRedeemError,
    reset: resetWriteContract,
  } = useWriteContract();

  const {
    isLoading: isInstantRedeemConfirming,
    isSuccess: isInstantRedeemConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: instantRedeemHash });

  // Clear timeout on success or unmount
  useEffect(() => {
    if (isInstantRedeemConfirmed && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isInstantRedeemConfirmed]);

  // Reset hasCalledConfirmed when a new transaction hash is generated
  useEffect(() => {
    if (instantRedeemHash) {
      hasCalledConfirmed.current = false;
    }
  }, [instantRedeemHash]);

  // Handle confirmation - refetch nonce and call callback
  useEffect(() => {
    if (isInstantRedeemConfirmed && !hasCalledConfirmed.current) {
      hasCalledConfirmed.current = true;

      // Refetch nonce for next transaction
      refetchStAztecNonce();

      // Call user callback
      options.onConfirmed?.();
    }
  }, [isInstantRedeemConfirmed, refetchStAztecNonce, options]);

  const instantRedeem = async (amount: string) => {
    if (!address || !stAztecDomain || stAztecNonce === undefined) return;

    const domain = extractDomainParams(stAztecDomain as Eip712DomainTuple);

    try {
      setIsSigning(true);
      setTimeoutError(null);

      const { data: currentNonce } = await refetchStAztecNonce();
      if (currentNonce === undefined || currentNonce === null)
        throw new Error("Could not fetch nonce");

      const value = parseEther(amount);
      const block = await publicClient!.getBlock();
      const deadline = block.timestamp + BigInt(PROTOCOL_CONSTANTS.DEADLINE_SECONDS);

      // Get expected assets and apply slippage
      const expectedAssets = await readContract(config, {
        address: CONTRACTS.OllaVault.address,
        abi: CONTRACTS.OllaVault.abi,
        functionName: "previewInstantRedeem",
        args: [value],
      });
      if (expectedAssets === undefined || expectedAssets === null)
        throw new Error("Could not fetch preview redeem");

      const minAssetsOut = applySlippage(
        expectedAssets as bigint,
        PROTOCOL_CONSTANTS.SLIPPAGE_TOLERANCE_BP
      );

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
          CONTRACTS.OllaVault.address,
          value,
          currentNonce as bigint,
          deadline
        ),
      });

      const { v, r, s } = parseSignature(signature);

      instantRedeemMutate(
        {
          address: CONTRACTS.OllaVault.address,
          abi: CONTRACTS.OllaVault.abi,
          functionName: "instantRedeemWithPermit",
          args: [value, address, minAssetsOut, deadline, Number(v), r, s],
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
  const combinedError = timeoutError || receiptError || instantRedeemError;

  return {
    write: instantRedeem,
    isSigning,
    isPending: isInstantRedeemPending,
    isConfirming: isInstantRedeemConfirming,
    isConfirmed: isInstantRedeemConfirmed,
    hash: instantRedeemHash,
    error: combinedError,
    reset,
  };
}
