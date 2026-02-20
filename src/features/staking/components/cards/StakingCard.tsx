import { type StakingState } from "../../hooks/useStakingState";
import { StakingCardIdle } from "./StakingCardIdle";
import { StakingCardPending } from "./StakingCardPending";
import { StakingCardSuccess } from "./StakingCardSuccess";
import { TransactionErrorCard } from "@/components/cards";

interface StakingCardProps {
  state: StakingState;
  amount: string;
  isConnected: boolean;
  balance: string;
  previewShares: string;
  exchangeRate: string;
  onAmountChange: (val: string) => void;
  onStake: () => void;
  onReset: () => void;
  error: string | null;
  hash?: `0x${string}`;
}

export function StakingCard({
  state,
  amount,
  isConnected,
  balance,
  previewShares,
  exchangeRate,
  onAmountChange,
  onStake,
  onReset,
  error,
  hash,
}: StakingCardProps) {
  switch (state) {
    case "idle":
      return (
        <StakingCardIdle
          amount={amount}
          balance={balance}
          isConnected={isConnected}
          exchangeRate={exchangeRate}
          onAmountChange={onAmountChange}
          onStake={onStake}
        />
      );
    case "signing":
    case "pending":
    case "confirming":
      return <StakingCardPending state={state} hash={hash} />;
    case "success":
      return (
        <StakingCardSuccess
          amount={amount}
          shares={previewShares}
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
