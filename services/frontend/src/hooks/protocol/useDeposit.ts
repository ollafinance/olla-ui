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
import { CONTRACTS } from "@olla-ui/types";
import { PROTOCOL_CONSTANTS, applySlippage, CONFIRMATION_TIMEOUT_MS } from "@/constants/protocol";
import {
  extractDomainParams,
  buildPermitMessage,
  PERMIT_TYPES,
  type Eip712DomainTuple,
} from "@/lib/permit";
import { useState, useEffect, useRef, useCallback } from "react";

export interface UseDepositOptions {
  onSuccess?: () => void;
  onConfirmed?: () => void;
}

export function useDeposit(options: UseDepositOptions = {}) {
  const { address } = useConnection();
  const config = useConfig();
  const publicClient = usePublicClient();
  const [isSigning, setIsSigning] = useState(false);
  const [timeoutError, setTimeoutError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCalledConfirmed = useRef(false);

  const { data: assetDomain } = useReadContract({
    address: CONTRACTS.Asset.address,
    abi: CONTRACTS.Asset.abi,
    functionName: "eip712Domain",
  });

  const { data: nonce, refetch: refetchNonce } = useReadContract({
    address: CONTRACTS.Asset.address,
    abi: CONTRACTS.Asset.abi,
    functionName: "nonces",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { mutateAsync } = useSignTypedData();

  const {
    mutate: depositMutate,
    data: depositHash,
    isPending: isDepositPending,
    error: depositError,
    reset: resetWriteContract,
  } = useWriteContract();

  const {
    isLoading: isDepositConfirming,
    isSuccess: isDepositConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: depositHash });

  // Clear timeout on success or unmount
  useEffect(() => {
    if (isDepositConfirmed && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isDepositConfirmed]);

  // Reset hasCalledConfirmed when a new transaction hash is generated
  useEffect(() => {
    if (depositHash) {
      hasCalledConfirmed.current = false;
    }
  }, [depositHash]);

  // Handle confirmation - refetch nonce and call callback
  useEffect(() => {
    if (isDepositConfirmed && !hasCalledConfirmed.current) {
      hasCalledConfirmed.current = true;

      // Refetch nonce for next transaction
      refetchNonce();

      // Call user callback
      options.onConfirmed?.();
    }
  }, [isDepositConfirmed, refetchNonce, options]);

  const deposit = async (amount: string) => {
    if (!address || !assetDomain || nonce === undefined) {
      return;
    }

    const domain = extractDomainParams(assetDomain as Eip712DomainTuple);

    try {
      setIsSigning(true);
      setTimeoutError(null);

      const { data: currentNonce } = await refetchNonce();
      if (currentNonce === undefined || currentNonce === null)
        throw new Error("Could not fetch nonce");

      const value = parseEther(amount);
      const block = await publicClient!.getBlock();
      const deadline = block.timestamp + BigInt(PROTOCOL_CONSTANTS.DEADLINE_SECONDS);

      const expectedShares = await readContract(config, {
        address: CONTRACTS.OllaVault.address,
        abi: CONTRACTS.OllaVault.abi,
        functionName: "previewDeposit",
        args: [value],
      });
      if (expectedShares === undefined || expectedShares === null)
        throw new Error("Could not fetch preview deposit");
      const minSharesOut = applySlippage(
        expectedShares as bigint,
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

      const args = [value, address, minSharesOut, deadline, Number(v), r, s];

      depositMutate(
        {
          address: CONTRACTS.OllaVault.address,
          abi: CONTRACTS.OllaVault.abi,
          functionName: "depositWithPermit",
          args: args as [
            bigint,
            `0x${string}`,
            bigint,
            bigint,
            number,
            `0x${string}`,
            `0x${string}`,
          ],
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
          onError: () => {
            setIsSigning(false);
          },
        }
      );
    } catch {
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
  const combinedError = timeoutError || receiptError || depositError;

  return {
    write: deposit,
    isSigning,
    isPending: isDepositPending,
    isConfirming: isDepositConfirming,
    isConfirmed: isDepositConfirmed,
    hash: depositHash,
    error: combinedError,
    reset,
  };
}
