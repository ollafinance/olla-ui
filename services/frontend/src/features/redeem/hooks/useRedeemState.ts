import { useState, useMemo, useCallback } from "react";
import { useConnection } from "wagmi";
import { formatEther, parseEther } from "viem";
import { useRequestRedeem } from "@/hooks/protocol/useRequestRedeem";
import { useInstantRedeem } from "@/hooks/protocol/useInstantRedeem";
import { useOllaCoreReads } from "@/hooks/protocol/useOllaCoreReads";
import { useStAztec } from "@/hooks/protocol/useStAztec";
import { useClaimRequest } from "@/hooks/protocol/useClaimRequest";
import { useClaims, type ClaimItemData } from "./useClaims";
import { getContractErrorMessage } from "@/lib/errors";
import { useRewardsEarned } from "@/hooks/indexer";

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
  rewardsEarned: string;

  // Preview Values
  grossAssets: string; // Converted assets without any fees
  previewAssets: string; // What user actually receives (after fee in instant mode)
  minAssetsOut: string;
  instantWithdrawFee: string;
  instantWithdrawFeePercent: string;

  // Liquidity Check
  canInstantRedeem: boolean;

  // Transaction
  hash: `0x${string}` | undefined;

  // Claims
  claims: ClaimItemData[];
  isLoadingClaims: boolean;
  hasInitiallyLoadedClaims: boolean;
  claimsError: Error | null;
  hasMoreClaims: boolean;
  loadMoreClaims: () => void;
  refetchClaims: () => void;
  totalClaims: number;

  // Claim Action
  claim: (requestId: bigint) => void;
  claimingRequestId: number | null;
  isClaiming: boolean;
  isClaimConfirming: boolean;
  isClaimConfirmed: boolean;
  claimError: string | null;
  claimHash: `0x${string}` | undefined;
}

export function useRedeemState(): UseRedeemStateReturn {
  const { address, isConnected } = useConnection();
  const [amount, setAmount] = useState("");
  const [isInstantMode, setIsInstantMode] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Claims data - initialize BEFORE withdrawal hooks so we can refetch after
  const {
    claims,
    isLoading: isLoadingClaims,
    hasInitiallyLoaded: hasInitiallyLoadedClaims,
    error: claimsError,
    hasMore: hasMoreClaims,
    loadMore: loadMoreClaims,
    refetch: refetchClaims,
    totalClaims,
  } = useClaims();

  // Protocol hooks for withdrawal
  const requestRedeem = useRequestRedeem({
    onConfirmed: () => {
      // Immediately refetch claims to show the new withdrawal request
      refetchClaims();
    },
  });

  const instantRedeem = useInstantRedeem({
    onConfirmed: () => {
      // Immediately refetch claims to show the instant redemption
      refetchClaims();
    },
  });

  // Reads
  const reads = useOllaCoreReads({
    amountToConvert: amount,
    address: address,
  });

  const { balance: stAztecBalance } = useStAztec();

  const { rewardsEarned } = useRewardsEarned();

  // Determine active hook based on mode
  const activeHook = isInstantMode ? instantRedeem : requestRedeem;

  // Claim action
  const [claimingRequestId, setClaimingRequestId] = useState<number | null>(null);

  const claimHook = useClaimRequest({
    onSuccess: () => {
      // Will trigger onConfirmed when transaction is mined
    },
    onConfirmed: () => {
      // Refetch claims to update the list
      refetchClaims();
      setClaimingRequestId(null);
    },
  });

  const claim = useCallback(
    (requestId: bigint) => {
      setClaimingRequestId(Number(requestId));
      claimHook.write(requestId);
    },
    [claimHook]
  );

  // Claim transaction states
  const isClaiming = claimHook.isPending || claimHook.isConfirming;
  const isClaimConfirming = claimHook.isConfirming;
  const isClaimConfirmed = claimHook.isConfirmed;
  const claimHash = claimHook.hash;

  // Claim error
  const claimError = useMemo(() => {
    if (claimHook.error) {
      return getContractErrorMessage(claimHook.error);
    }
    return null;
  }, [claimHook.error]);

  // State machine for withdrawal
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
      return getContractErrorMessage(activeHook.error);
    }
    return null;
  }, [activeHook.error, manualError]);

  // Exchange rate (1 share = X assets)
  const exchangeRate = reads.exchangeRate
    ? Number(formatEther(reads.exchangeRate)).toFixed(2)
    : "1.00";

  // Gross assets (converted without any fees)
  const grossAssets = reads.potentialAssets
    ? Number(formatEther(reads.potentialAssets)).toFixed(2)
    : "0";

  // Preview assets (what user actually receives)
  // For instant mode: after instant fee (previewRedeem)
  // For regular mode: full amount (convertToAssets)
  const previewAssets = isInstantMode
    ? reads.previewRedeemAssets
      ? Number(formatEther(reads.previewRedeemAssets)).toFixed(2)
      : "0"
    : grossAssets;

  // Instant redemption fee calculation (actual difference between gross and net)
  const instantWithdrawFee = useMemo(() => {
    if (!isInstantMode || !reads.potentialAssets || !reads.previewRedeemAssets) return "0";
    const fee = reads.potentialAssets - reads.previewRedeemAssets;
    return Number(formatEther(fee)).toFixed(2);
  }, [isInstantMode, reads.potentialAssets, reads.previewRedeemAssets]);

  // Fee percentage for display
  const instantRedemptionFeeBP = reads.instantRedemptionFeeBP ?? 50n; // Default 0.5%
  const feePercent = Number(instantRedemptionFeeBP) / 100; // BP to percentage
  const instantWithdrawFeePercent = `${feePercent.toFixed(2)}%`;

  // Min assets out (with slippage)
  const minAssetsOut = useMemo(() => {
    if (!reads.previewRedeemAssets) return "0";
    const preview = reads.previewRedeemAssets;
    const slippageApplied = (preview * 9900n) / 10000n; // 1% slippage
    return Number(formatEther(slippageApplied)).toFixed(2);
  }, [reads.previewRedeemAssets]);

  // Liquidity check for instant redemption
  const canInstantRedeem = useMemo(() => {
    if (!isInstantMode || !amount || !reads.availableForInstantRedemption) return true;
    let requestedShares: bigint;
    try {
      requestedShares = parseEther(amount);
    } catch {
      return true;
    }
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
    setClaimingRequestId(null);
    requestRedeem.reset();
    instantRedeem.reset();
    claimHook.reset();
  }, [requestRedeem, instantRedeem, claimHook]);

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
    rewardsEarned,
    grossAssets,
    previewAssets,
    minAssetsOut,
    instantWithdrawFee,
    instantWithdrawFeePercent,
    canInstantRedeem,
    hash: activeHook.hash,
    // Claims
    claims,
    isLoadingClaims,
    hasInitiallyLoadedClaims,
    claimsError,
    hasMoreClaims,
    loadMoreClaims,
    refetchClaims,
    totalClaims,
    // Claim Action
    claim,
    claimingRequestId,
    isClaiming,
    isClaimConfirming,
    isClaimConfirmed,
    claimError,
    claimHash,
  };
}
