import { useState, useMemo, useCallback } from "react";
import { useConnection } from "wagmi";
import { formatEther, parseEther } from "viem";
import { useRequestRedeem } from "@/hooks/protocol/useRequestRedeem";
import { useInstantRedeem } from "@/hooks/protocol/useInstantRedeem";
import { useOllaCoreReads } from "@/hooks/protocol/useOllaCoreReads";
import { useStAztec } from "@/hooks/protocol/useStAztec";

export type RedeemState = "idle" | "signing" | "pending" | "confirming" | "success" | "error";

interface UseRedeemStateReturn {
  // Connection
  isConnected: boolean;

  // State Machine
  state: RedeemState;

  // Amount & Mode
  amount: string;
  setAmount: (val: string) => void;
  isInstantMode: boolean;
  setIsInstantMode: (val: boolean) => void;

  // Actions
  withdraw: () => void;
  reset: () => void;

  // Error
  error: string | null;

  // Balances & Rates
  stAztecBalance: string;
  exchangeRate: string;

  // Preview Values
  previewAssets: string;
  minAssetsOut: string;
  instantWithdrawFee: string;
  instantWithdrawFeePercent: string;

  // Liquidity Check
  canInstantRedeem: boolean;

  // Transaction
  hash: `0x${string}` | undefined;
}

export function useRedeemState(): UseRedeemStateReturn {
  const { address, isConnected } = useConnection();
  const [amount, setAmount] = useState("");
  const [isInstantMode, setIsInstantMode] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Protocol hooks
  const requestRedeem = useRequestRedeem({
    onConfirmed: () => {
      // Refetch queries handled by wagmi cache invalidation
    },
  });

  const instantRedeem = useInstantRedeem({
    onConfirmed: () => {},
  });

  // Reads
  const reads = useOllaCoreReads({
    amountToConvert: amount,
    address: address,
  });

  const { balance: stAztecBalance } = useStAztec();

  // Determine active hook based on mode
  const activeHook = isInstantMode ? instantRedeem : requestRedeem;

  // State machine
  const state = useMemo<RedeemState>(() => {
    if (manualError || activeHook.error) return "error";
    if (activeHook.isConfirmed) return "success";
    if (activeHook.isConfirming) return "confirming";
    if (activeHook.isPending) return "pending";
    if (activeHook.isSigning) return "signing";
    return "idle";
  }, [activeHook, manualError]);

  // Error handling
  const error = useMemo(() => {
    if (manualError) return manualError;
    if (activeHook.error) {
      const err = activeHook.error as Error & { shortMessage?: string };
      return err.shortMessage || err.message || "Transaction failed";
    }
    return null;
  }, [activeHook.error, manualError]);

  // Exchange rate (1 share = X assets)
  const exchangeRate = reads.exchangeRate
    ? Number(formatEther(reads.exchangeRate)).toFixed(4)
    : "1.0000";

  // Preview assets (what you get for your shares)
  const previewAssets = reads.previewRedeemAssets
    ? Number(formatEther(reads.previewRedeemAssets)).toFixed(4)
    : "0";

  // Instant redemption fee calculation
  const instantRedemptionFeeBP = reads.instantRedemptionFeeBP ?? 50n; // Default 0.5%
  const feePercent = Number(instantRedemptionFeeBP) / 100; // BP to percentage

  const instantWithdrawFee = useMemo(() => {
    if (!amount || !isInstantMode) return "0";
    return ((Number(amount) * feePercent) / 100).toFixed(4);
  }, [amount, isInstantMode, feePercent]);

  const instantWithdrawFeePercent = `${feePercent.toFixed(2)}%`;

  // Min assets out (with slippage)
  const minAssetsOut = useMemo(() => {
    if (!reads.previewRedeemAssets) return "0";
    const preview = reads.previewRedeemAssets;
    const slippageApplied = (preview * 9900n) / 10000n; // 1% slippage
    return Number(formatEther(slippageApplied)).toFixed(4);
  }, [reads.previewRedeemAssets]);

  // Liquidity check for instant redemption
  const canInstantRedeem = useMemo(() => {
    if (!isInstantMode || !amount || !reads.availableForInstantRedemption) return true;
    const requestedShares = parseEther(amount);
    return reads.availableForInstantRedemption >= requestedShares;
  }, [isInstantMode, amount, reads.availableForInstantRedemption]);

  // Withdraw action
  const withdraw = useCallback(() => {
    if (!isConnected) return;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    setManualError(null);

    if (isInstantMode && !canInstantRedeem) {
      setManualError("Insufficient liquidity for instant redemption");
      return;
    }

    activeHook.write(amount);
  }, [isConnected, amount, isInstantMode, canInstantRedeem, activeHook]);

  // Reset
  const reset = useCallback(() => {
    setAmount("");
    setManualError(null);
    requestRedeem.reset();
    instantRedeem.reset();
  }, [requestRedeem, instantRedeem]);

  return {
    isConnected,
    state,
    amount,
    setAmount,
    isInstantMode,
    setIsInstantMode,
    withdraw,
    reset,
    error,
    stAztecBalance,
    exchangeRate,
    previewAssets,
    minAssetsOut,
    instantWithdrawFee,
    instantWithdrawFeePercent,
    canInstantRedeem,
    hash: activeHook.hash,
  };
}
