import { type StakingState } from "../../hooks/useStakingState";
import { StakingCardIdle } from "./StakingCardIdle";
import { StakingCardPending } from "./StakingCardPending";
import { StakingCardSuccess } from "./StakingCardSuccess";
import { TransactionErrorCard } from "@/components/cards";

interface StakingCardProps {
  state: StakingState;
  amount: string;
  simulatedShares: string;
  onAmountChange: (val: string) => void;
  onStake: () => void;
  onStakeWithError: () => void;
  onTransitionToSuccess: () => void;
  onTransitionToError: (msg: string) => void;
  onReset: () => void;
  error: string | null;
}

export function StakingCard({
  state,
  amount,
  simulatedShares,
  onAmountChange,
  onStake,
  onStakeWithError,
  onTransitionToSuccess,
  onTransitionToError,
  onReset,
  error,
}: StakingCardProps) {
  const handleTransition = () => {
    if (Math.random() > 0.3) {
      onTransitionToSuccess();
    } else {
      onTransitionToError("Transaction rejected by user");
    }
  };

  switch (state) {
    case "idle":
      return (
        <StakingCardIdle
          amount={amount}
          onAmountChange={onAmountChange}
          onStake={onStake}
          onStakeWithError={onStakeWithError}
        />
      );
    case "pending":
      return <StakingCardPending onTransition={handleTransition} />;
    case "success":
      return (
        <StakingCardSuccess
          amount={amount}
          shares={simulatedShares}
          onStakeMore={onReset}
          onViewExplorer={() => console.log("View on Explorer clicked")}
        />
      );
    case "error":
      return <TransactionErrorCard errorMessage={error || undefined} onReturn={onReset} />;
    default:
      return null;
  }
}
