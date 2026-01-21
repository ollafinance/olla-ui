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
    address: CONTRACTS.ASSET.address,
    abi: CONTRACTS.ASSET.abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACTS.ASSET.address,
    abi: CONTRACTS.ASSET.abi,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.OLLA_CORE.address] : undefined,
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

  // Actions
  const mintTokens = () => {
    if (!address) return;
    mint(
      {
        address: CONTRACTS.ASSET.address,
        abi: CONTRACTS.ASSET.abi,
        functionName: "mint",
        args: [address, parseEther("100")],
      },
      { onSuccess: () => refetchBalance() },
    );
  };

  const approveSpender = () => {
    approve(
      {
        address: CONTRACTS.ASSET.address,
        abi: CONTRACTS.ASSET.abi,
        functionName: "approve",
        args: [CONTRACTS.OLLA_CORE.address, parseEther("0.1")],
      },
      { onSuccess: () => refetchAllowance() },
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
