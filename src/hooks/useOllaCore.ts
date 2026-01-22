import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS } from "../constants/contracts";

export function useOllaCore() {
  const { address } = useConnection();

  const {
    mutate,
    data: depositHash,
    isPending: isDepositPending,
    error: depositError,
  } = useWriteContract();

  const { isLoading: isDepositConfirming, isSuccess: isDepositConfirmed } =
    useWaitForTransactionReceipt({ hash: depositHash });

  const depositAsset = () => {
    if (!address) return;
    mutate({
      address: CONTRACTS.OllaCore.address,
      abi: CONTRACTS.OllaCore.abi,
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
      error: depositError,
    },
  };
}
