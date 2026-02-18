import { useStakingState } from "./hooks";
import { StakingCard, ReceiveCard, ReturnsCard, PortfolioCard } from "./components";

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
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-card justify-center items-center lg:items-end w-full px-4 lg:px-0 mx-auto">
      <div className="w-full max-w-[551px] lg:w-card-primary lg:max-w-none">
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
      </div>

      <div className="flex flex-col gap-4 lg:gap-card w-full max-w-[551px] lg:w-card-secondary lg:max-w-none lg:h-card-primary">
        <ReceiveCard shares={simulatedShares} />
        <ReturnsCard shares={simulatedShares} />
        <PortfolioCard />
      </div>
    </div>
  );
}