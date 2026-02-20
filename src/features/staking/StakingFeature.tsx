import { useStakingState } from "./hooks";
import { StakingCard, ReceiveCard, ReturnsCard } from "./components";
import { PortfolioCard } from "@/components/cards";
import { PageLayout } from "@/components/layout/page-layout";

export function StakingFeature() {
  const {
    isConnected,
    state,
    amount,
    setAmount,
    stake,
    reset,
    error,
    aztecBalance,
    stAztecBalance,
    exchangeRate,
    previewShares,
    hash,
    estimatedFee,
    isEstimatingFee,
    gasEstimateError,
  } = useStakingState();

  return (
    <PageLayout
      leftCard={
        <StakingCard
          state={state}
          amount={amount}
          isConnected={isConnected}
          balance={aztecBalance}
          previewShares={previewShares}
          exchangeRate={exchangeRate}
          onAmountChange={setAmount}
          onStake={stake}
          onReset={reset}
          error={error}
          hash={hash}
          estimatedFee={estimatedFee}
          isEstimatingFee={isEstimatingFee}
          gasEstimateError={gasEstimateError}
        />
      }
      topCards={
        <>
          <ReceiveCard shares={previewShares} />
          <ReturnsCard shares={previewShares} />
        </>
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
