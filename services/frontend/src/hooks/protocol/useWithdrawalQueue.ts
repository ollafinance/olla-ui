import { useReadContract } from "wagmi";
import { CONTRACTS } from "@olla-ui/types";

export function useWithdrawalRequest(requestId: bigint) {
  const { data: request, refetch } = useReadContract({
    address: CONTRACTS.WithdrawalQueue.address,
    abi: CONTRACTS.WithdrawalQueue.abi,
    functionName: "getRequest",
    args: [requestId],
    query: {
      enabled: !!requestId || requestId === 0n, // requestId can be 0, but usually indices start at 1. Wait, let's assume valid ID.
      refetchInterval: 5000,
    },
  });

  return {
    request,
    refetch,
  };
}
