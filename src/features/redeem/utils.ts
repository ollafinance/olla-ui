export interface ButtonStateParams {
  isConnected: boolean;
  isInputValid: boolean;
  needsApproval: boolean;
  amount: string;
  approve: { isPending: boolean; isConfirming: boolean };
  redeem: { isPending: boolean; isConfirming: boolean };
}

export function getRedeemButtonState({
  isConnected,
  isInputValid,
  needsApproval,
  amount,
  approve,
  redeem,
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
      buttonText = `Approve ${amount} stAZT`;
    }
  } else {
    // Ready to redeem
    if (redeem.isPending) {
      buttonText = "Requesting Redeem...";
      isLoading = true;
    } else if (redeem.isConfirming) {
      buttonText = "Confirming Request...";
      isLoading = true;
    } else {
      buttonText = isInputValid
        ? `Request Redeem ${amount} stAZT`
        : "Enter Amount";
    }
  }

  // Override disabled state during loading
  if (isLoading) isDisabled = true;

  return { buttonText, isLoading, isDisabled };
}
