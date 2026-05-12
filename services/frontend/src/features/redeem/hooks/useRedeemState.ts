import { useState, useMemo, useCallback } from "react";
import { useConnection } from "wagmi";
import { formatEther } from "viem";
import { useRequestRedeem } from "@/hooks/protocol/useRequestRedeem";
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

  // Amount
  amount: string;
  setAmount: (val: string) => void;

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
  previewAssets: string; // What user actually receives

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

  // Protocol hook for withdrawal
  const requestRedeem = useRequestRedeem({
    onConfirmed: () => {
      // Immediately refetch claims to show the new withdrawal request
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
    if (manualError || requestRedeem.error) return "error";
    if (requestRedeem.isConfirmed) return "success";
    if (requestRedeem.isConfirming) return "confirming";
    if (requestRedeem.isPending) return "pending";
    if (requestRedeem.isSigning) return "signing";
    return "idle";
  }, [requestRedeem, manualError]);

  // Error handling
  const error = useMemo(() => {
    if (manualError) return manualError;
    if (requestRedeem.error) {
      return getContractErrorMessage(requestRedeem.error);
    }
    return null;
  }, [requestRedeem.error, manualError]);

  // Exchange rate (1 share = X assets)
  const exchangeRate = reads.exchangeRate
    ? Number(formatEther(reads.exchangeRate)).toFixed(2)
    : "1.00";

  // Gross assets (converted without any fees)
  const grossAssets = reads.potentialAssets
    ? Number(formatEther(reads.potentialAssets)).toFixed(2)
    : "0";

  // Preview assets (what user actually receives) — same as gross since
  // there is no instant-redemption fee path anymore.
  const previewAssets = grossAssets;

  // Withdraw action
  const withdraw = useCallback(() => {
    if (!isConnected) return;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    setManualError(null);
    requestRedeem.write(amount);
  }, [isConnected, amount, requestRedeem]);

  // Reset
  const reset = useCallback(() => {
    setAmount("");
    setManualError(null);
    setClaimingRequestId(null);
    requestRedeem.reset();
    claimHook.reset();
  }, [requestRedeem, claimHook]);

  return {
    isConnected,
    state,
    amount,
    setAmount,
    withdraw,
    reset,
    error,
    stAztecBalance,
    exchangeRate,
    rewardsEarned,
    grossAssets,
    previewAssets,
    hash: requestRedeem.hash,
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
