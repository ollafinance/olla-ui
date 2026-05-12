import { useStakingState } from "./hooks";
import { StakingCard, ReceiveCard, ReturnsCard } from "./components";
import { PortfolioCard } from "@/components/cards";
import { PageLayout } from "@/components/layout/page-layout";
import { useProtocolApy } from "@/hooks/protocol";
import { useCurrency } from "@/hooks/useCurrency";

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
    rewardsEarned,
    hash,
  } = useStakingState();
  const { apy } = useProtocolApy();
  const { stAztecToAztec } = useCurrency({ exchangeRate: parseFloat(exchangeRate) || null });
  const portfolioAztec = stAztecToAztec(stAztecBalance);

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
        />
      }
      topCards={
        <>
          <ReceiveCard shares={previewShares} exchangeRate={exchangeRate} />
          <ReturnsCard amount={amount} apy={apy} exchangeRate={exchangeRate} />
        </>
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
