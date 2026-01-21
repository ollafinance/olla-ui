import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS } from "../constants/contracts";

export function useOllaCore() {
  const { address } = useAccount();

  const { 
    writeContract: deposit, 
    data: depositHash, 
    isPending: isDepositPending,
    error: depositError
  } = useWriteContract();

  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } = 
    useWaitForTransactionReceipt({ hash: depositHash });

  const depositAsset = () => {
    if (!address) return;
    deposit({
      address: CONTRACTS.OLLA_CORE.address,
      abi: CONTRACTS.OLLA_CORE.abi,
      functionName: "deposit",
      args: [parseEther("0.1"), address],
    });
  };

  return {
    deposit: {
      write: depositAsset,
      isPending: isDepositPending,
      isConfirming: isDepositConfirming,
      isConfirmed: isDepositConfirmed,
      hash: depositHash,
      error: depositError
    }
  };
}
