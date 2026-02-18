import { useStakingState } from "./hooks";
import { StakingCard, ReceiveCard, ReturnsCard } from "./components";
import { PortfolioCard } from "@/components/cards";
import { PageLayout } from "@/components/layout/page-layout";

export function StakingFeature() {
  const {
    state,
    amount,
    setAmount,
    stake,
    stakeWithError,
    reset,
    error,
    simulatedShares,
    _internal,
  } = useStakingState({ demoMode: true });

  return (
    <PageLayout
      leftCard={
        <StakingCard
          state={state}
          amount={amount}
          simulatedShares={simulatedShares}
          onAmountChange={setAmount}
          onStake={stake}
          onStakeWithError={stakeWithError}
          onTransitionToSuccess={_internal.transitionToSuccess}
          onTransitionToError={_internal.transitionToError}
          onReset={reset}
          error={error}
        />
      }
      topCards={
        <>
          <ReceiveCard shares={simulatedShares} />
          <ReturnsCard shares={simulatedShares} />
        </>
      }
      bottomCard={<PortfolioCard className="lg:h-card-third" />}
    />
  );
}