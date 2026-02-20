import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACTS } from "@/constants/contracts";
import { useBlockWatcher } from "./useBlockWatcher";

export function useAztecToken() {
  const { address } = useConnection();

  // READS
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.Asset.address,
    abi: CONTRACTS.Asset.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.Asset.address,
    abi: CONTRACTS.Asset.abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.OllaCore.address] : undefined,
    query: { enabled: !!address },
  });

  // Refetch on new blocks
  useBlockWatcher({
    onBlock: () => {
      if (address) {
        refetchBalance();
        refetchAllowance();
      }
    },
    enabled: !!address,
  });

  // WRITES
  const {
    mutate: approve,
    data: approveHash,
    isPending: isApprovePending,
    reset: resetApprove,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // Actions - refetch handled via onSuccess callbacks
  const approveSpender = (amount: string) => {
    if (!address) return;
    approve(
      {
        address: CONTRACTS.Asset.address,
        abi: CONTRACTS.Asset.abi,
        functionName: "approve",
        args: [CONTRACTS.OllaCore.address, parseEther(amount)],
      },
      { onSuccess: () => refetchAllowance() }
    );
  };

  return {
    balance: balance ? formatEther(balance as bigint) : "0",
    allowance: allowance ? formatEther(allowance as bigint) : "0",
    approve: {
      write: approveSpender,
      isPending: isApprovePending,
      isConfirming: isApproveConfirming,
      isConfirmed: isApproveConfirmed,
      hash: approveHash,
      reset: resetApprove,
    },
    refetchBalance,
    refetchAllowance,
  };
}
