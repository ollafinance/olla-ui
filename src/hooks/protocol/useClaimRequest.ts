import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";

export interface UseClaimRequestOptions {
  onSuccess?: () => void;
}

export function useClaimRequest(options: UseClaimRequestOptions = {}) {
  const {
    mutate: claimMutate,
    data: claimHash,
    isPending: isClaimPending,
    error: claimError,
  } = useWriteContract();

  const { isLoading: isClaimConfirming, isSuccess: isClaimConfirmed } =
    useWaitForTransactionReceipt({ hash: claimHash });

  const claimRequestById = (requestId: bigint) => {
    claimMutate(
      {
        address: CONTRACTS.OllaCore.address,
        abi: CONTRACTS.OllaCore.abi,
        functionName: "claimRequestById",
        args: [requestId],
      },
      {
        onSuccess: () => {
          options.onSuccess?.();
        },
      }
    );
  };

  return {
    write: claimRequestById,
    isPending: isClaimPending,
    isConfirming: isClaimConfirming,
    isConfirmed: isClaimConfirmed,
    hash: claimHash,
    error: claimError,
  };
}
