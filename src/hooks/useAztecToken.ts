import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import { parseEther, formatEther } from "viem";
import { CONTRACTS } from "../constants/contracts";

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

  // WRITES
  const {
    mutate: mint,
    data: mintHash,
    isPending: isMintPending,
  } = useWriteContract();

  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } =
    useWaitForTransactionReceipt({ hash: mintHash });

  const {
    mutate: approve,
    data: approveHash,
    isPending: isApprovePending,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // Actions - refetch handled via onSuccess callbacks
  const mintTokens = () => {
    if (!address) return;
    mint(
      {
        address: CONTRACTS.Asset.address,
        abi: CONTRACTS.Asset.abi,
        functionName: "mint",
        args: [address, parseEther("100")],
      },
      { onSuccess: () => refetchBalance() }
    );
  };

  const approveSpender = () => {
    if (!address) return;
    approve(
      {
        address: CONTRACTS.Asset.address,
        abi: CONTRACTS.Asset.abi,
        functionName: "approve",
        args: [CONTRACTS.OllaCore.address, parseEther("0.1")],
      },
      { onSuccess: () => refetchAllowance() }
    );
  };

  return {
    balance: balance ? formatEther(balance as bigint) : "0",
    allowance: allowance ? formatEther(allowance as bigint) : "0",
    mint: {
      write: mintTokens,
      isPending: isMintPending,
      isConfirming: isMintConfirming,
      isConfirmed: isMintConfirmed,
      hash: mintHash,
    },
    approve: {
      write: approveSpender,
      isPending: isApprovePending,
      isConfirming: isApproveConfirming,
      isConfirmed: isApproveConfirmed,
      hash: approveHash,
    },
    refetchBalance,
    refetchAllowance,
  };
}
