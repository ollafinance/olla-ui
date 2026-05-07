import { useReadContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS } from "@/constants/contracts";

export interface UseOllaCoreReadsOptions {
  amountToConvert?: string;
  address?: `0x${string}`;
}

function safeParseEther(value?: string): bigint | undefined {
  if (!value) return undefined;
  try {
    return parseEther(value);
  } catch {
    return undefined;
  }
}

export function useOllaCoreReads(options: UseOllaCoreReadsOptions = {}) {
  const { amountToConvert, address } = options;
  const parsedAmount = safeParseEther(amountToConvert);
  const amountArgs = parsedAmount !== undefined ? [parsedAmount] : undefined;
  const amountEnabled = parsedAmount !== undefined && parsedAmount > 0n;

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
    args: amountArgs,
    query: {
      enabled: amountEnabled,
    },
  });

  const { data: potentialAssets } = useReadContract({
    address: CONTRACTS.OllaCore.address,
    abi: CONTRACTS.OllaCore.abi,
    functionName: "convertToAssets",
    args: amountArgs,
    query: {
      enabled: amountEnabled,
    },
  });

  const { data: previewDepositShares, refetch: refetchPreviewDeposit } = useReadContract({
    address: CONTRACTS.OllaVault.address,
    abi: CONTRACTS.OllaVault.abi,
    functionName: "previewDeposit",
    args: amountArgs,
    query: {
      enabled: amountEnabled,
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

  return {
    exchangeRate: exchangeRate as bigint | undefined,
    potentialShares: potentialShares as bigint | undefined,
    potentialAssets: potentialAssets as bigint | undefined,
    previewDepositShares: previewDepositShares as bigint | undefined,
    activeRequestIds: (activeRequestIds as bigint[]) || [],
    refetchPreviewDeposit,
  };
}
