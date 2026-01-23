import { useReadContract, useConnection } from "wagmi";
import { formatEther } from "viem";
import { CONTRACTS } from "../constants/contracts";

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

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: CONTRACTS.StAztec.address,
    abi: CONTRACTS.StAztec.abi,
    functionName: "totalSupply",
  });

  return {
    balance: balance ? formatEther(balance as bigint) : "0",
    totalSupply: totalSupply ? formatEther(totalSupply as bigint) : "0",
    refetchBalance,
    refetchTotalSupply,
  };
}
