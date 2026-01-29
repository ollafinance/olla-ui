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
  onRedeemSuccess?: () => void;
  amountToConvert?: string;
}

export function useOllaCore(options: UseOllaCoreOptions = {}) {
  const { address } = useConnection();

  // Write: Deposit
  const {
    mutate: depositMutate,
    data: depositHash,
    isPending: isDepositPending,
    error: depositError,
  } = useWriteContract();

  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } =
    useWaitForTransactionReceipt({ hash: depositHash });

  const deposit = (amount: string) => {
    if (!address) return;
    depositMutate(
      {
        address: CONTRACTS.OllaCore.address,
        abi: CONTRACTS.OllaCore.abi,
        functionName: "deposit",
        args: [parseEther(amount), address],
      },
      { onSuccess: options.onDepositSuccess }
    );
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

  const requestRedeem = (amount: string) => {
    if (!address) return;
    redeemMutate(
      {
        address: CONTRACTS.OllaCore.address,
        abi: CONTRACTS.OllaCore.abi,
        functionName: "requestRedeem",
        args: [parseEther(amount), address],
      },
      { onSuccess: options.onRedeemSuccess }
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
      isPending: isDepositPending,
      isConfirming: isDepositConfirming,
      isConfirmed: isDepositConfirmed,
      hash: depositHash,
      error: depositError,
    },
    requestRedeem: {
      write: requestRedeem,
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
