import { Button } from "@/components/ui/Button";
import { RedeemInput } from "./RedeemInput";
import { getRedeemButtonState } from "../utils";

interface RedeemFormProps {
  isConnected: boolean;
  stAztecBalance: string;
  allowance: string;
  amount: string;
  setAmount: (val: string) => void;
  requestRedeem: {
    write: (amount: string) => void;
    isSigning: boolean;
    isPending: boolean;
    isConfirming: boolean;
  };
}

export function RedeemForm({
  isConnected,
  stAztecBalance,
  amount,
  setAmount,
  requestRedeem,
}: RedeemFormProps) {
  // Logic to determine button state
  const isInputValid = !!amount && !isNaN(Number(amount)) && Number(amount) > 0;

  const handleMaxClick = () => {
    setAmount(stAztecBalance);
  };

  const handleMainAction = () => {
    if (!isInputValid) return;
    requestRedeem.write(amount);
  };

  const { buttonText, isLoading, isDisabled } = getRedeemButtonState({
    isConnected,
    isInputValid,
    amount,
    redeem: requestRedeem,
  });

  // Additional check: disable input if depositing
  const isInputDisabled = !isConnected || isLoading;

  return (
    <div className="flex flex-col gap-4">
      <RedeemInput
        amount={amount}
        onAmountChange={setAmount}
        onMaxClick={handleMaxClick}
        disabled={isInputDisabled}
      />

      <Button
        onClick={handleMainAction}
        disabled={isDisabled}
        isLoading={isLoading}
        className="w-full"
        variant="primary"
      >
        {buttonText}
      </Button>
    </div>
  );
}
