export interface ButtonStateParams {
  isConnected: boolean;
  isInputValid: boolean;
  needsApproval: boolean;
  amount: string;
  approve: { isPending: boolean; isConfirming: boolean };
  deposit: { isPending: boolean; isConfirming: boolean };
}

export function getButtonState({
  isConnected,
  isInputValid,
  needsApproval,
  amount,
  approve,
  deposit,
}: ButtonStateParams) {
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
