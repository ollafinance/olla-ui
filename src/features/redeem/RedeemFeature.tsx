import { useRedeemState } from "./hooks";
import { WithdrawalCard, ClaimsCard } from "./components";
import { PortfolioCard } from "@/components/cards";
import { PageLayout } from "@/components/layout/page-layout";

export function RedeemFeature() {
  const {
    state,
    amount,
    setAmount,
    withdraw,
    withdrawWithError,
    reset,
    error,
    claims,
    claimItem,
    _internal,
  } = useRedeemState({ demoMode: true });

  return (
    <PageLayout
      leftCard={
        <WithdrawalCard
          state={state}
          amount={amount}
          onAmountChange={setAmount}
          onWithdraw={withdraw}
          onWithdrawWithError={withdrawWithError}
          onTransitionToSuccess={_internal.transitionToSuccess}
          onTransitionToError={_internal.transitionToError}
          onReset={reset}
          error={error}
        />
      }
      topCards={<ClaimsCard claims={claims} onClaim={claimItem} />}
      bottomCard={<PortfolioCard className="lg:h-card-portfolio-redeem" />}
    />
  );
}
