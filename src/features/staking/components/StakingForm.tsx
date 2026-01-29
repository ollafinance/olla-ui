import { Button } from "@/components/ui/Button";
import { StakingInput } from "./StakingInput";
import { getButtonState } from "../utils";

interface StakingFormProps {
  isConnected: boolean;
  balance: string;
  amount: string;
  setAmount: (val: string) => void;
  deposit: {
    write: (amount: string) => void;
    isSigning: boolean;
    isPending: boolean;
    isConfirming: boolean;
  };
}

export function StakingForm({
  isConnected,
  balance,
  amount,
  setAmount,
  deposit,
}: StakingFormProps) {
  // Logic to determine button state
  const isInputValid = !!amount && !isNaN(Number(amount)) && Number(amount) > 0;

  const handleMaxClick = () => {
    setAmount(balance);
  };

  const handleMainAction = () => {
    if (!isInputValid) return;
    deposit.write(amount);
  };

  const { buttonText, isLoading, isDisabled } = getButtonState({
    isConnected,
    isInputValid,
    amount,
    deposit,
  });

  // Additional check: disable input if depositing
  const isInputDisabled = !isConnected || isLoading;

  return (
    <div className="flex flex-col gap-4">
      <StakingInput
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
