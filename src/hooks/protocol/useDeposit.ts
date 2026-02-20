import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
  useReadContract,
  useSignTypedData,
  useConfig,
} from "wagmi";
import { parseEther, parseSignature } from "viem";
import { readContract } from "wagmi/actions";
import { CONTRACTS } from "@/constants/contracts";
import { PROTOCOL_CONSTANTS, applySlippage } from "@/constants/protocol";
import {
  extractDomainParams,
  buildPermitMessage,
  PERMIT_TYPES,
  type Eip712DomainTuple,
} from "@/lib/permit";
import { useState, useEffect } from "react";

export interface UseDepositOptions {
  onSuccess?: () => void;
}

export function useDeposit(options: UseDepositOptions = {}) {
  const { address } = useConnection();
  const config = useConfig();
  const [isSigning, setIsSigning] = useState(false);

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

  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } =
    useWaitForTransactionReceipt({ hash: depositHash });

  console.log("[useDeposit] Hook render:", {
    address,
    isSigning,
    hasAssetDomain: !!assetDomain,
    hasNonce: nonce !== undefined,
    depositHash,
    isDepositPending,
    isDepositConfirming,
    isDepositConfirmed,
    depositError: depositError?.message,
  });

  useEffect(() => {
    if (depositHash) {
      console.log("[useDeposit] Hash changed:", depositHash);
    }
  }, [depositHash]);

  useEffect(() => {
    console.log("[useDeposit] Confirmation state changed:", {
      isDepositConfirming,
      isDepositConfirmed,
    });
  }, [isDepositConfirming, isDepositConfirmed]);

  const deposit = async (amount: string) => {
    console.log("[useDeposit] deposit() called with amount:", amount);

    if (!address || !assetDomain || nonce === undefined) {
      console.log("[useDeposit] Early return - missing data:", {
        hasAddress: !!address,
        hasAssetDomain: !!assetDomain,
        hasNonce: nonce !== undefined,
      });
      return;
    }

    const domain = extractDomainParams(assetDomain as Eip712DomainTuple);
    console.log("[useDeposit] EIP-712 domain:", domain);

    try {
      setIsSigning(true);
      console.log("[useDeposit] Signing started...");

      const { data: currentNonce } = await refetchNonce();
      console.log("[useDeposit] Refetched nonce:", currentNonce);
      if (currentNonce === undefined || currentNonce === null)
        throw new Error("Could not fetch nonce");

      const value = parseEther(amount);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + PROTOCOL_CONSTANTS.DEADLINE_SECONDS);
      console.log("[useDeposit] Parsed value:", value.toString(), "deadline:", deadline.toString());

      const expectedShares = await readContract(config, {
        address: CONTRACTS.OllaCore.address,
        abi: CONTRACTS.OllaCore.abi,
        functionName: "previewDeposit",
        args: [value],
      });
      console.log("[useDeposit] Expected shares:", expectedShares?.toString());
      if (expectedShares === undefined || expectedShares === null)
        throw new Error("Could not fetch preview deposit");
      const minSharesOut = applySlippage(
        expectedShares as bigint,
        PROTOCOL_CONSTANTS.SLIPPAGE_TOLERANCE_BP
      );
      console.log("[useDeposit] Min shares out (with slippage):", minSharesOut.toString());

      const permitMessage = buildPermitMessage(
        address,
        CONTRACTS.OllaCore.address,
        value,
        currentNonce as bigint,
        deadline
      );
      console.log("[useDeposit] Permit message:", permitMessage);

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
        message: permitMessage,
      });
      console.log("[useDeposit] Signature obtained:", signature);

      const { v, r, s } = parseSignature(signature);
      console.log("[useDeposit] Signature parsed:", { v, r, s });

      const txArgs = [value, address, minSharesOut, deadline, Number(v), r, s];
      console.log("[useDeposit] Calling depositMutate with args:", txArgs);

      depositMutate(
        {
          address: CONTRACTS.OllaCore.address,
          abi: CONTRACTS.OllaCore.abi,
          functionName: "depositWithPermit",
          args: txArgs as [bigint, `0x${string}`, bigint, bigint, number, `0x${string}`, `0x${string}`],
        },
        {
          onSuccess: (hash) => {
            console.log("[useDeposit] depositMutate onSuccess - hash:", hash);
            setIsSigning(false);
            options.onSuccess?.();
          },
          onError: (error) => {
            console.error("[useDeposit] depositMutate onError:", error);
            setIsSigning(false);
          },
        }
      );
    } catch (error) {
      console.error("[useDeposit] Permit signing failed:", error);
      setIsSigning(false);
    }
  };

  const reset = () => {
    console.log("[useDeposit] reset() called");
    setIsSigning(false);
    resetWriteContract();
  };

  return {
    write: deposit,
    isSigning,
    isPending: isDepositPending,
    isConfirming: isDepositConfirming,
    isConfirmed: isDepositConfirmed,
    hash: depositHash,
    error: depositError,
    reset,
  };
}
