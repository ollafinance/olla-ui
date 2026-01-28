import { useEffect, useRef } from "react";
import { parseEther } from "viem";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
  const isInputValid = amount && !isNaN(Number(amount)) && Number(amount) > 0;

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
    deposit.write,
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

  // Determine button text and loading state
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

  // Additional check: disable input if approval is pending, confirming, or confirmed (waiting for deposit)
  const isApproving =
    approve.isPending || approve.isConfirming || approve.isConfirmed;
  const isInputDisabled = !isConnected || isLoading || isApproving;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Input
          type="number"
          placeholder="0.0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isInputDisabled}
          className="pr-16" // Space for MAX button
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleMaxClick}
            disabled={isInputDisabled}
            className="h-8 text-xs font-semibold text-primary hover:text-primary/80"
          >
            MAX
          </Button>
        </div>
      </div>

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
