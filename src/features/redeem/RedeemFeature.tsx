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
      topCards={<ClaimsCard claims={[]} onClaim={() => console.log("claiming")} />} // Placeholder - ClaimsCard not in scope
      bottomCard={<PortfolioCard className="lg:h-card-portfolio-redeem" />}
    />
  );
}
