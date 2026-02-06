import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
  useReadContract,
  useSignTypedData,
} from "wagmi";
import { parseEther, parseSignature } from "viem";
import { CONTRACTS } from "@/constants/contracts";
import { useState } from "react";

interface UseOllaCoreOptions {
  onDepositSuccess?: () => void;
  onRedeemSuccess?: () => void;
  onClaimSuccess?: () => void;
  amountToConvert?: string;
}

export function useOllaCore(options: UseOllaCoreOptions = {}) {
  const { address } = useConnection();
  const [isSigning, setIsSigning] = useState(false);

  // Read: Asset EIP-712 Domain
  const { data: assetDomain } = useReadContract({
    address: CONTRACTS.Asset.address,
    abi: CONTRACTS.Asset.abi,
    functionName: "eip712Domain",
  });

  // Read: User Nonce (for Permit)
  const { data: nonce, refetch: refetchNonce } = useReadContract({
    address: CONTRACTS.Asset.address,
    abi: CONTRACTS.Asset.abi,
    functionName: "nonces",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Write: Sign Permit
  const { mutateAsync } = useSignTypedData();

  // Write: Deposit
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

    // eip712Domain returns [fields, name, version, chainId, verifyingContract, salt, extensions]
    // We cast to any because TS inference might be loose on the tuple
    const [
      ,
      /* fields */
      name,
      version,
      chainIdFromContract,
      verifyingContract,
      ,
      /* salt */
      ,
      /* extensions */
    ] = assetDomain as any;

    try {
      setIsSigning(true);
      // Ensure we have the latest nonce
      const { data: currentNonce } = await refetchNonce();
      if (currentNonce === undefined || currentNonce === null)
        throw new Error("Could not fetch nonce");

      const value = parseEther(amount);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour

      // 1. Sign Permit
      const signature = await mutateAsync({
        domain: {
          name,
          version,
          chainId: Number(chainIdFromContract),
          verifyingContract,
        },
        types: {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Permit",
        message: {
          owner: address,
          spender: CONTRACTS.OllaCore.address,
          value,
          nonce: currentNonce as bigint,
          deadline,
        },
      });

      const { v, r, s } = parseSignature(signature);

      // 2. Deposit with Permit
      depositMutate(
        {
          address: CONTRACTS.OllaCore.address,
          abi: CONTRACTS.OllaCore.abi,
          functionName: "depositWithPermit",
          args: [
            value,
            address,
            deadline,
            Number(v), // Wagmi/Viem type compatibility
            r,
            s,
          ],
        },
        {
          onSuccess: () => {
            setIsSigning(false);
            options.onDepositSuccess?.();
          },
          onError: () => setIsSigning(false),
        },
      );
    } catch (error) {
      console.error("Permit signing failed:", error);
      setIsSigning(false);
    }
  };

  // Write: Request Redeem
  const {
    mutate: redeemMutate,
    data: redeemHash,
    isPending: isRedeemPending,
    error: redeemError,
  } = useWriteContract();

  const { isLoading: isRedeemConfirming, isSuccess: isRedeemConfirmed } =
    useWaitForTransactionReceipt({ hash: redeemHash });

  // Read: stAztec EIP-712 Domain
  const { data: stAztecDomain } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "eip712Domain",
  });

  // Read: stAztec Nonce (for Permit)
  const { data: stAztecNonce, refetch: refetchStAztecNonce } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "nonces",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const requestRedeem = async (amount: string) => {
    if (!address || !stAztecDomain || stAztecNonce === undefined) return;

    const [
      ,
      /* fields */
      name,
      version,
      chainIdFromContract,
      verifyingContract,
      ,
      /* salt */
      ,
      /* extensions */
    ] = stAztecDomain as any;

    try {
      setIsSigning(true);
      // Ensure we have the latest nonce
      const { data: currentNonce } = await refetchStAztecNonce();
      if (currentNonce === undefined || currentNonce === null)
        throw new Error("Could not fetch nonce");

      const value = parseEther(amount);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour

      // 1. Sign Permit
      const signature = await mutateAsync({
        domain: {
          name,
          version,
          chainId: Number(chainIdFromContract),
          verifyingContract,
        },
        types: {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Permit",
        message: {
          owner: address,
          spender: CONTRACTS.OllaCore.address,
          value,
          nonce: currentNonce as bigint,
          deadline,
        },
      });

      const { v, r, s } = parseSignature(signature);

      // 2. Request Redeem with Permit
      redeemMutate(
        {
          address: CONTRACTS.OllaCore.address,
          abi: CONTRACTS.OllaCore.abi,
          functionName: "requestRedeemWithPermit",
          args: [
            value,
            address,
            deadline,
            Number(v), // Wagmi/Viem type compatibility
            r,
            s,
          ],
        },
        {
          onSuccess: () => {
            setIsSigning(false);
            options.onRedeemSuccess?.();
          },
          onError: () => setIsSigning(false),
        }
      );
    } catch (error) {
      console.error("Permit signing failed:", error);
      setIsSigning(false);
    }
  };

  // Write: Claim Request by ID
  const {
    mutate: claimMutate,
    data: claimHash,
    isPending: isClaimPending,
    error: claimError,
  } = useWriteContract();

  const { isLoading: isClaimConfirming, isSuccess: isClaimConfirmed } =
    useWaitForTransactionReceipt({ hash: claimHash });

  const claimRequestById = (requestId: bigint) => {
    claimMutate(
      {
        address: CONTRACTS.OllaCore.address,
        abi: CONTRACTS.OllaCore.abi,
        functionName: "claimRequestById",
        args: [requestId],
      },
      {
        onSuccess: () => {
          options.onClaimSuccess?.();
        },
      }
    );
  };

  // Read: Exchange Rate (Invalidate every 5 seconds)
  const { data: exchangeRate } = useReadContract({
    address: CONTRACTS.OllaCore.address,
    abi: CONTRACTS.OllaCore.abi,
    functionName: "exchangeRate",
    query: {
      refetchInterval: 5000,
    },
  });

  // Read: Convert to Shares
  const { data: potentialShares } = useReadContract({
    address: CONTRACTS.OllaCore.address,
    abi: CONTRACTS.OllaCore.abi,
    functionName: "convertToShares",
    args: options.amountToConvert
      ? [parseEther(options.amountToConvert)]
      : undefined,
    query: {
      enabled: !!options.amountToConvert && Number(options.amountToConvert) > 0,
    },
  });

  // Read: Convert to Assets (for Redeem)
  const { data: potentialAssets } = useReadContract({
    address: CONTRACTS.OllaCore.address,
    abi: CONTRACTS.OllaCore.abi,
    functionName: "convertToAssets",
    args: options.amountToConvert
      ? [parseEther(options.amountToConvert)]
      : undefined,
    query: {
      enabled: !!options.amountToConvert && Number(options.amountToConvert) > 0,
    },
  });

  // Read: Active Request IDs (List of user's request IDs)
  const { data: activeRequestIds } = useReadContract({
    address: CONTRACTS.OllaCore.address,
    abi: CONTRACTS.OllaCore.abi,
    functionName: "activeRequestIds",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  return {
    deposit: {
      write: deposit,
      isSigning,
      isPending: isDepositPending,
      isConfirming: isDepositConfirming,
      isConfirmed: isDepositConfirmed,
      hash: depositHash,
      error: depositError,
    },
    requestRedeem: {
      write: requestRedeem,
      isSigning,
      isPending: isRedeemPending,
      isConfirming: isRedeemConfirming,
      isConfirmed: isRedeemConfirmed,
      hash: redeemHash,
      error: redeemError,
    },
    claimRequest: {
      write: claimRequestById,
      isPending: isClaimPending,
      isConfirming: isClaimConfirming,
      isConfirmed: isClaimConfirmed,
      hash: claimHash,
      error: claimError,
    },
    exchangeRate: exchangeRate as bigint | undefined,
    potentialShares: potentialShares as bigint | undefined,
    potentialAssets: potentialAssets as bigint | undefined,
    activeRequestIds: (activeRequestIds as bigint[]) || [],
  };
}
