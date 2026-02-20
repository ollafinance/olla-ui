import {
  useReadContract,
  useConnection,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { CONTRACTS } from "@/constants/contracts";
import { useBlockWatcher } from "./useBlockWatcher";

export function useStAztec() {
  const { address } = useConnection();

  // READS
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.OllaCore.address] : undefined,
    query: { enabled: !!address },
  });

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "totalSupply",
  });

  // Refetch on new blocks
  useBlockWatcher({
    onBlock: () => {
      if (address) {
        refetchBalance();
        refetchAllowance();
        refetchTotalSupply();
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

  // Actions
  const approveSpender = (amount: string) => {
    if (!address) return;
    approve(
      {
        address: CONTRACTS.StAztec.address,
        abi: CONTRACTS.StAztec.abi,
        functionName: "approve",
        args: [CONTRACTS.OllaCore.address, parseEther(amount)],
      },
      { onSuccess: () => refetchAllowance() }
    );
  };

  return {
    balance: balance ? formatEther(balance as bigint) : "0",
    totalSupply: totalSupply ? formatEther(totalSupply as bigint) : "0",
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
    refetchTotalSupply,
    refetchAllowance,
  };
}
