import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
  useReadContract,
  useSignTypedData,
  useChainId,
} from "wagmi";
import { parseEther, parseSignature } from "viem";
import { CONTRACTS } from "@/constants/contracts";
import { useState } from "react";

interface UseOllaCoreOptions {
  onDepositSuccess?: () => void;
  onRedeemSuccess?: () => void;
  amountToConvert?: string;
}

export function useOllaCore(options: UseOllaCoreOptions = {}) {
  const { address } = useConnection();
  const chainId = useChainId();
  const [isSigning, setIsSigning] = useState(false);

  // Read: Asset Name (for Permit)
  const { data: assetName } = useReadContract({
    address: CONTRACTS.Asset.address,
    abi: CONTRACTS.Asset.abi,
    functionName: "name",
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
    if (!address || !assetName || nonce === undefined) return;

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
          name: assetName as string,
          version: "1",
          chainId,
          verifyingContract: CONTRACTS.Asset.address,
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

  // Read: stAztec Name (for Permit)
  const { data: stAztecName } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "name",
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
    if (!address || !stAztecName || stAztecNonce === undefined) return;

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
          name: stAztecName as string,
          version: "1",
          chainId,
          verifyingContract: CONTRACTS.StAztec.address,
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

  // Read: Active Request ID
  const { data: activeRequestId } = useReadContract({
    address: CONTRACTS.OllaCore.address,
    abi: CONTRACTS.OllaCore.abi,
    functionName: "activeRequestId",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read: Active Withdrawal Request Details
  const { data: activeWithdrawalRequest } = useReadContract({
    address: CONTRACTS.OllaCore.address,
    abi: CONTRACTS.OllaCore.abi,
    functionName: "getActiveWithdrawalRequest",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
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
    exchangeRate: exchangeRate as bigint | undefined,
    potentialShares: potentialShares as bigint | undefined,
    potentialAssets: potentialAssets as bigint | undefined,
    activeRequestId: activeRequestId as bigint | undefined,
    activeWithdrawalRequest: activeWithdrawalRequest as
      | {
          recipient: `0x${string}`;
          finalized: boolean;
          claimed: boolean;
          shares: bigint;
          assetsExpected: bigint;
          rate: bigint;
        }
      | undefined,
  };
}
