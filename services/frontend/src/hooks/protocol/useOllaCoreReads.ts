import { useReadContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS } from "@/constants/contracts";

export interface UseOllaCoreReadsOptions {
  amountToConvert?: string;
  address?: `0x${string}`;
}

export function useOllaCoreReads(options: UseOllaCoreReadsOptions = {}) {
  const { amountToConvert, address } = options;

  const { data: exchangeRate } = useReadContract({
    address: CONTRACTS.OllaCore.address,
    abi: CONTRACTS.OllaCore.abi,
    functionName: "exchangeRate",
    query: {
      refetchInterval: 5000,
    },
  });

  const { data: potentialShares } = useReadContract({
    address: CONTRACTS.OllaCore.address,
    abi: CONTRACTS.OllaCore.abi,
    functionName: "convertToShares",
    args: amountToConvert ? [parseEther(amountToConvert)] : undefined,
    query: {
      enabled: !!amountToConvert && Number(amountToConvert) > 0,
    },
  });

  const { data: potentialAssets } = useReadContract({
    address: CONTRACTS.OllaCore.address,
    abi: CONTRACTS.OllaCore.abi,
    functionName: "convertToAssets",
    args: amountToConvert ? [parseEther(amountToConvert)] : undefined,
    query: {
      enabled: !!amountToConvert && Number(amountToConvert) > 0,
    },
  });

  const { data: previewDepositShares, refetch: refetchPreviewDeposit } = useReadContract({
    address: CONTRACTS.OllaVault.address,
    abi: CONTRACTS.OllaVault.abi,
    functionName: "previewDeposit",
    args: amountToConvert ? [parseEther(amountToConvert)] : undefined,
    query: {
      enabled: !!amountToConvert && Number(amountToConvert) > 0,
    },
  });

  const { data: previewRedeemAssets, refetch: refetchPreviewRedeem } = useReadContract({
    address: CONTRACTS.OllaVault.address,
    abi: CONTRACTS.OllaVault.abi,
    functionName: "previewInstantRedeem",
    args: amountToConvert ? [parseEther(amountToConvert)] : undefined,
    query: {
      enabled: !!amountToConvert && Number(amountToConvert) > 0,
    },
  });

  const { data: activeRequestIds } = useReadContract({
    address: CONTRACTS.OllaVault.address,
    abi: CONTRACTS.OllaVault.abi,
    functionName: "activeRequestIds",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000,
    },
  });

  const { data: availableForInstantRedemption } = useReadContract({
    address: CONTRACTS.OllaVault.address,
    abi: CONTRACTS.OllaVault.abi,
    functionName: "availableForInstantRedemption",
    query: {
      refetchInterval: 5000,
    },
  });

  const { data: instantRedemptionFeeBP } = useReadContract({
    address: CONTRACTS.OllaVault.address,
    abi: CONTRACTS.OllaVault.abi,
    functionName: "instantRedemptionFeeBP",
    query: {
      refetchInterval: 30000, // Fee changes less frequently
    },
  });

  return {
    exchangeRate: exchangeRate as bigint | undefined,
    potentialShares: potentialShares as bigint | undefined,
    potentialAssets: potentialAssets as bigint | undefined,
    previewDepositShares: previewDepositShares as bigint | undefined,
    previewRedeemAssets: previewRedeemAssets as bigint | undefined,
    activeRequestIds: (activeRequestIds as bigint[]) || [],
    availableForInstantRedemption: availableForInstantRedemption as bigint | undefined,
    instantRedemptionFeeBP: instantRedemptionFeeBP as bigint | undefined,
    refetchPreviewDeposit,
    refetchPreviewRedeem,
  };
}
