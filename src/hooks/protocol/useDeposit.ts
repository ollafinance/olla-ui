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
import { useState } from "react";

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
  } = useWriteContract();

  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } =
    useWaitForTransactionReceipt({ hash: depositHash });

  const deposit = async (amount: string) => {
    if (!address || !assetDomain || nonce === undefined) return;

    const domain = extractDomainParams(assetDomain as Eip712DomainTuple);

    try {
      setIsSigning(true);

      const { data: currentNonce } = await refetchNonce();
      if (currentNonce === undefined || currentNonce === null)
        throw new Error("Could not fetch nonce");

      const value = parseEther(amount);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + PROTOCOL_CONSTANTS.DEADLINE_SECONDS);

      const expectedShares = await readContract(config, {
        address: CONTRACTS.OllaCore.address,
        abi: CONTRACTS.OllaCore.abi,
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
          CONTRACTS.OllaCore.address,
          value,
          currentNonce as bigint,
          deadline
        ),
      });

      const { v, r, s } = parseSignature(signature);

      depositMutate(
        {
          address: CONTRACTS.OllaCore.address,
          abi: CONTRACTS.OllaCore.abi,
          functionName: "depositWithPermit",
          args: [value, address, minSharesOut, deadline, Number(v), r, s],
        },
        {
          onSuccess: () => {
            setIsSigning(false);
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

  return {
    write: deposit,
    isSigning,
    isPending: isDepositPending,
    isConfirming: isDepositConfirming,
    isConfirmed: isDepositConfirmed,
    hash: depositHash,
    error: depositError,
  };
}
