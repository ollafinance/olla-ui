import { useRedeemState } from "./hooks";
import { ClaimsCard, WithdrawalCard } from "./components";
import { PortfolioCard } from "@/components/cards";
import { PageLayout } from "@/components/layout/page-layout";

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
    claimsError,
    hasMoreClaims,
    loadMoreClaims,
    // Claim Action
    claim,
    claimingRequestId,
    claimHash,
  } = useRedeemState();

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
          totalStaked={stAztecBalance}
          className="lg:h-card-third"
        />
      }
    />
  );
}
