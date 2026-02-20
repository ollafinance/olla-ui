import { useSimulateContract, useEstimateFeesPerGas } from "wagmi";
import { formatEther } from "viem";
import { useMemo } from "react";
import type { Abi } from "viem";

interface UseGasEstimateOptions {
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args: unknown[];
  enabled?: boolean;
}

interface UseGasEstimateReturn {
  estimatedFee: string;
  isLoading: boolean;
  errorMessage: string | null;
}

export function useGasEstimate(options: UseGasEstimateOptions): UseGasEstimateReturn {
  const { address, abi, functionName, args, enabled = true } = options;

  const { data: simulationData, isLoading: isSimulating, error: simulationError } = useSimulateContract({
    address,
    abi,
    functionName,
    args,
    query: { enabled },
  });

  const { data: feeData, isLoading: isFeeLoading, error: feeError } = useEstimateFeesPerGas({
    query: { enabled },
  });

  const estimatedFee = useMemo(() => {
    const gasEstimate = simulationData?.request?.gas;
    if (!gasEstimate || !feeData?.maxFeePerGas) return "";
    const totalFeeWei = gasEstimate * feeData.maxFeePerGas;
    return formatEther(totalFeeWei);
  }, [simulationData, feeData]);

  // Extract error message to avoid BigInt serialization issues
  const errorMessage = useMemo(() => {
    const error = simulationError || feeError;
    if (!error) return null;
    // Extract just the message string to avoid BigInt serialization
    return error.message || "Unable to estimate gas fees";
  }, [simulationError, feeError]);

  return {
    estimatedFee: estimatedFee || "Unable to estimate",
    isLoading: isSimulating || isFeeLoading,
    errorMessage,
  };
}
