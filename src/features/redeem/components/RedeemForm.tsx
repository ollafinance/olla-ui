import { useEffect, useRef } from "react";
import { parseEther } from "viem";
import { Button } from "@/components/ui/Button";
import { RedeemInput } from "./RedeemInput";
import { getRedeemButtonState } from "../utils";

interface RedeemFormProps {
  isConnected: boolean;
  stAztecBalance: string;
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
  requestRedeem: {
    write: (amount: string) => void;
    isPending: boolean;
    isConfirming: boolean;
  };
}

export function RedeemForm({
  isConnected,
  stAztecBalance,
  allowance,
  amount,
  setAmount,
  approve,
  requestRedeem,
}: RedeemFormProps) {
  // Logic to determine button state
  const isInputValid = !!amount && !isNaN(Number(amount)) && Number(amount) > 0;

  const allowanceBn = parseEther(allowance || "0");
  const amountBn = isInputValid ? parseEther(amount) : 0n;

  // Need approval if the entered amount is greater than current allowance
  const needsApproval = amountBn > allowanceBn;

  // Track if we've already auto-triggered the redeem for this approval session
  const hasAutoTriggeredRedeem = useRef(false);

  // Auto-trigger redeem when approval is confirmed
  useEffect(() => {
    if (approve.isConfirmed) {
      if (
        !hasAutoTriggeredRedeem.current &&
        isInputValid &&
        !requestRedeem.isPending &&
        !requestRedeem.isConfirming
      ) {
        requestRedeem.write(amount);
        hasAutoTriggeredRedeem.current = true;
      }
    } else {
      // Reset flag when approval is no longer confirmed (e.g. after reset)
      hasAutoTriggeredRedeem.current = false;
    }
  }, [
    approve.isConfirmed,
    isInputValid,
    amount,
    requestRedeem.write,
    requestRedeem.isPending,
    requestRedeem.isConfirming,
  ]);

  const handleMaxClick = () => {
    setAmount(stAztecBalance);
  };

  const handleMainAction = () => {
    if (!isInputValid) return;

    if (needsApproval) {
      approve.write(amount);
    } else {
      requestRedeem.write(amount);
    }
  };

  const { buttonText, isLoading, isDisabled } = getRedeemButtonState({
    isConnected,
    isInputValid,
    needsApproval,
    amount,
    approve,
    redeem: requestRedeem,
  });

  // Additional check: disable input if approval is pending, confirming, or confirmed (waiting for redeem)
  const isApproving =
    approve.isPending || approve.isConfirming || approve.isConfirmed;
  const isInputDisabled = !isConnected || isLoading || isApproving;

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
        variant={needsApproval ? "secondary" : "primary"}
      >
        {buttonText}
      </Button>

      {needsApproval && isInputValid && (
        <p className="text-xs text-center text-muted-foreground">
          You must approve the contract before you can redeem.
        </p>
      )}
    </div>
  );
}
