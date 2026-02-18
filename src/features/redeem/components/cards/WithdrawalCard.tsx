import type { RedeemState } from "../../hooks/useRedeemState";
import { WithdrawalCardIdle } from "./WithdrawalCardIdle";
import { WithdrawalCardPending } from "./WithdrawalCardPending";
import { WithdrawalCardSuccess } from "./WithdrawalCardSuccess";
import { TransactionErrorCard } from "@/components/cards";

interface WithdrawalCardProps {
  state: RedeemState;
  amount: string;
  onAmountChange: (val: string) => void;
  onWithdraw: () => void;
  onWithdrawWithError: () => void;
  onTransitionToSuccess: () => void;
  onTransitionToError: (msg: string) => void;
  onReset: () => void;
  error: string | null;
}

export function WithdrawalCard({
  state,
  amount,
  onAmountChange,
  onWithdraw,
  onWithdrawWithError,
  onTransitionToSuccess,
  onTransitionToError,
  onReset,
  error,
}: WithdrawalCardProps) {
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
        <WithdrawalCardIdle
          amount={amount}
          onAmountChange={onAmountChange}
          onWithdraw={onWithdraw}
          onWithdrawWithError={onWithdrawWithError}
        />
      );
    case "pending":
      return <WithdrawalCardPending onTransition={handleTransition} />;
    case "success":
      return (
        <WithdrawalCardSuccess
          amount={amount}
          onWithdrawMore={onReset}
          onViewExplorer={() => console.log("View on Explorer clicked")}
        />
      );
    case "error":
      return (
        <TransactionErrorCard
          errorMessage={error || undefined}
          onReturn={onReset}
        />
      );
    default:
      return null;
  }
}
