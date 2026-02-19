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

export interface UseInstantRedeemOptions {
  onSuccess?: () => void;
}

export function useInstantRedeem(options: UseInstantRedeemOptions = {}) {
  const { address } = useConnection();
  const config = useConfig();
  const [isSigning, setIsSigning] = useState(false);

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
  } = useWriteContract();

  const { isLoading: isInstantRedeemConfirming, isSuccess: isInstantRedeemConfirmed } =
    useWaitForTransactionReceipt({ hash: instantRedeemHash });

  const instantRedeem = async (amount: string) => {
    if (!address || !stAztecDomain || stAztecNonce === undefined) return;

    const domain = extractDomainParams(stAztecDomain as Eip712DomainTuple);

    try {
      setIsSigning(true);

      const { data: currentNonce } = await refetchStAztecNonce();
      if (currentNonce === undefined || currentNonce === null)
        throw new Error("Could not fetch nonce");

      const value = parseEther(amount);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + PROTOCOL_CONSTANTS.DEADLINE_SECONDS);

      const expectedAssets = await readContract(config, {
        address: CONTRACTS.OllaCore.address,
        abi: CONTRACTS.OllaCore.abi,
        functionName: "previewRedeem",
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
          CONTRACTS.OllaCore.address,
          value,
          currentNonce as bigint,
          deadline
        ),
      });

      const { v, r, s } = parseSignature(signature);

      instantRedeemMutate(
        {
          address: CONTRACTS.OllaCore.address,
          abi: CONTRACTS.OllaCore.abi,
          functionName: "redeemWithPermit",
          args: [value, address, minAssetsOut, deadline, Number(v), r, s],
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
    write: instantRedeem,
    isSigning,
    isPending: isInstantRedeemPending,
    isConfirming: isInstantRedeemConfirming,
    isConfirmed: isInstantRedeemConfirmed,
    hash: instantRedeemHash,
    error: instantRedeemError,
  };
}
