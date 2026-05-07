import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/constants/contracts";

export function useWithdrawalRequest(requestId: bigint) {
  const { data: request, refetch } = useReadContract({
    address: CONTRACTS.OllaVault.address,
    abi: CONTRACTS.OllaVault.abi,
    functionName: "getWithdrawalRequest",
    args: [requestId],
    query: {
      enabled: !!requestId || requestId === 0n,
      refetchInterval: 5000,
    },
  });

  return {
    request,
    refetch,
  };
}
