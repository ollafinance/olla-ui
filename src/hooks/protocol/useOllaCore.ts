import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
} from "wagmi";
import { parseEther } from "viem";
import { CONTRACTS } from "@/constants/contracts";

interface UseOllaCoreOptions {
  onDepositSuccess?: () => void;
}

export function useOllaCore(options: UseOllaCoreOptions = {}) {
  const { address } = useConnection();

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

  return {
    deposit: {
      write: deposit,
      isPending: isDepositPending,
      isConfirming: isDepositConfirming,
      isConfirmed: isDepositConfirmed,
      hash: depositHash,
      error: depositError,
    },
  };
}
