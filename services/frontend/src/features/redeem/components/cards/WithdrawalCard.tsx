import type { RedeemState } from "../../hooks/useRedeemState";
import { WithdrawalCardIdle } from "./WithdrawalCardIdle";
import {
  TransactionPendingCard,
  TransactionSuccessCard,
  TransactionErrorCard,
} from "@/components/cards";

interface WithdrawalCardProps {
  state: RedeemState;
  amount: string;
  onAmountChange: (val: string) => void;
  onWithdraw: () => void;
  onReset: () => void;
  error: string | null;
  isConnected: boolean;
  balance: string;
  exchangeRate: string;
  grossAssets: string;
  previewAssets: string;
  hash: `0x${string}` | undefined;
}

export function WithdrawalCard({
  state,
  amount,
  onAmountChange,
  onWithdraw,
  onReset,
  error,
  isConnected,
  balance,
  exchangeRate,
  grossAssets,
  previewAssets,
  hash,
}: WithdrawalCardProps) {
  switch (state) {
    case "idle":
      return (
        <WithdrawalCardIdle
          amount={amount}
          onAmountChange={onAmountChange}
          onWithdraw={onWithdraw}
          isConnected={isConnected}
          balance={balance}
          exchangeRate={exchangeRate}
          grossAssets={grossAssets}
          previewAssets={previewAssets}
        />
      );
    case "signing":
    case "pending":
    case "confirming":
      return <TransactionPendingCard state={state} variant="withdrawal" />;
    case "success":
      return (
        <TransactionSuccessCard
          variant="withdrawal"
          amount={amount}
          hash={hash}
          onPrimaryAction={onReset}
        />
      );
    case "error":
      return <TransactionErrorCard errorMessage={error || undefined} onReturn={onReset} />;
    default:
      return null;
  }
}
