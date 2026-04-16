import { useRedeemState } from "./hooks";
import { ClaimsCard, WithdrawalCard } from "./components";
import { PortfolioCard } from "@/components/cards";
import { PageLayout } from "@/components/layout/page-layout";
import { useCurrency } from "@/hooks/useCurrency";

export function RedeemFeature() {
  const {
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
    hash,
    // Claims
    claims,
    isLoadingClaims,
    hasInitiallyLoadedClaims,
    claimsError,
    hasMoreClaims,
    loadMoreClaims,
    // Claim Action
    claim,
    claimingRequestId,
    claimHash,
  } = useRedeemState();

  const { stAztecToAztec } = useCurrency({ exchangeRate: parseFloat(exchangeRate) || null });
  const portfolioAztec = stAztecToAztec(stAztecBalance);

  return (
    <PageLayout
      leftCard={
        <WithdrawalCard
          state={state}
          amount={amount}
          onAmountChange={setAmount}
          onWithdraw={withdraw}
          onReset={reset}
          error={error}
          isConnected={isConnected}
          balance={stAztecBalance}
          exchangeRate={exchangeRate}
          grossAssets={grossAssets}
          previewAssets={previewAssets}
          minAssetsOut={minAssetsOut}
          isInstantMode={isInstantMode}
          onInstantModeChange={setIsInstantMode}
          instantWithdrawFee={instantWithdrawFee}
          instantWithdrawFeePercent={instantWithdrawFeePercent}
          canInstantRedeem={canInstantRedeem}
          hash={hash}
        />
      }
      topCards={
        <ClaimsCard
          claims={claims}
          onClaim={(id) => claim(BigInt(id))}
          isLoading={isLoadingClaims}
          hasInitiallyLoaded={hasInitiallyLoadedClaims}
          error={claimsError?.message || null}
          hasMore={hasMoreClaims}
          onLoadMore={loadMoreClaims}
          claimingRequestId={claimingRequestId}
          claimHash={claimHash}
        />
      }
      bottomCard={
        <PortfolioCard
          isConnected={isConnected}
          totalStaked={portfolioAztec}
          rewardsEarned={rewardsEarned}
          className="lg:h-card-third"
        />
      }
    />
  );
}
