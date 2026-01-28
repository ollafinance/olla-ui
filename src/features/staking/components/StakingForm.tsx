import { useEffect, useRef } from "react";
import { parseEther } from "viem";
import { Button } from "@/components/ui/Button";
import { StakingInput } from "./StakingInput";

interface StakingFormProps {
  isConnected: boolean;
  balance: string;
  allowance: string;
  amount: string;
  setAmount: (val: string) => void;
  approve: {
    write: (amount: string) => void;
    isPending: boolean;
    isConfirming: boolean;
    isConfirmed: boolean;
    reset: () => void;
  };
  deposit: {
    write: (amount: string) => void;
    isPending: boolean;
    isConfirming: boolean;
  };
}

export function StakingForm({
  isConnected,
  balance,
  allowance,
  amount,
  setAmount,
  approve,
  deposit,
}: StakingFormProps) {
  // Logic to determine button state
  const isInputValid = !!amount && !isNaN(Number(amount)) && Number(amount) > 0;

  const allowanceBn = parseEther(allowance || "0");
  const amountBn = isInputValid ? parseEther(amount) : 0n;

  // Need approval if the entered amount is greater than current allowance
  const needsApproval = amountBn > allowanceBn;

  // Track if we've already auto-triggered the deposit for this approval session
  const hasAutoTriggeredDeposit = useRef(false);

  // Auto-trigger deposit when approval is confirmed
  useEffect(() => {
    if (approve.isConfirmed) {
      if (
        !hasAutoTriggeredDeposit.current &&
        isInputValid &&
        !deposit.isPending &&
        !deposit.isConfirming
      ) {
        deposit.write(amount);
        hasAutoTriggeredDeposit.current = true;
      }
    } else {
      // Reset flag when approval is no longer confirmed (e.g. after reset)
      hasAutoTriggeredDeposit.current = false;
    }
  }, [
    approve.isConfirmed,
    isInputValid,
    amount,
    deposit, // deposit object is stable enough or we ignore linter here? 
    // Actually the previous dependency array had deposit.write, etc.
    // Let's keep it safe.
    deposit.isPending,
    deposit.isConfirming,
  ]);

  const handleMaxClick = () => {
    setAmount(balance);
  };

  const handleMainAction = () => {
    if (!isInputValid) return;

    if (needsApproval) {
      approve.write(amount);
    } else {
      deposit.write(amount);
    }
  };

  const { buttonText, isLoading, isDisabled } = getButtonState({
    isConnected,
    isInputValid,
    needsApproval,
    amount,
    approve,
    deposit,
  });

  // Additional check: disable input if approval is pending, confirming, or confirmed (waiting for deposit)
  const isApproving =
    approve.isPending || approve.isConfirming || approve.isConfirmed;
  const isInputDisabled = !isConnected || isLoading || isApproving;

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
        variant={needsApproval ? "secondary" : "primary"}
      >
        {buttonText}
      </Button>

      {needsApproval && isInputValid && (
        <p className="text-xs text-center text-muted-foreground">
          You must approve the contract before you can stake.
        </p>
      )}
    </div>
  );
}

// Helper to determine button UI state
function getButtonState({
  isConnected,
  isInputValid,
  needsApproval,
  amount,
  approve,
  deposit,
}: {
  isConnected: boolean;
  isInputValid: boolean;
  needsApproval: boolean;
  amount: string;
  approve: { isPending: boolean; isConfirming: boolean };
  deposit: { isPending: boolean; isConfirming: boolean };
}) {
  let buttonText = "Enter Amount";
  let isLoading = false;
  let isDisabled = !isConnected || !isInputValid;

  if (needsApproval) {
    if (approve.isPending) {
      buttonText = "Approving...";
      isLoading = true;
    } else if (approve.isConfirming) {
      buttonText = "Confirming Approval...";
      isLoading = true;
    } else {
      buttonText = `Approve ${amount} AZT`;
    }
  } else {
    // Ready to deposit
    if (deposit.isPending) {
      buttonText = "Depositing...";
      isLoading = true;
    } else if (deposit.isConfirming) {
      buttonText = "Confirming Deposit...";
      isLoading = true;
    } else {
      buttonText = isInputValid ? `Stake ${amount} AZT` : "Enter Amount";
    }
  }

  // Override disabled state during loading
  if (isLoading) isDisabled = true;

  return { buttonText, isLoading, isDisabled };
}
