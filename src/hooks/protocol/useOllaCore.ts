import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
  useReadContract,
} from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS } from "@/constants/contracts";

interface UseOllaCoreOptions {
  onDepositSuccess?: () => void;
  amountToConvert?: string;
}

export function useOllaCore(options: UseOllaCoreOptions = {}) {
  const { address } = useConnection();

  // Write: Deposit
  const {
    mutate,
    data: depositHash,
    isPending: isDepositPending,
    error: depositError,
  } = useWriteContract();

  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } =
    useWaitForTransactionReceipt({ hash: depositHash });

  const deposit = (amount: string) => {
    if (!address) return;
    mutate(
      {
        address: CONTRACTS.OllaCore.address,
        abi: CONTRACTS.OllaCore.abi,
        functionName: "deposit",
        args: [parseEther(amount), address],
      },
      { onSuccess: options.onDepositSuccess }
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

  return {
    deposit: {
      write: deposit,
      isPending: isDepositPending,
      isConfirming: isDepositConfirming,
      isConfirmed: isDepositConfirmed,
      hash: depositHash,
      error: depositError,
    },
    exchangeRate: exchangeRate as bigint | undefined,
    potentialShares: potentialShares as bigint | undefined,
  };
}
