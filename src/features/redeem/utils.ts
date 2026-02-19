export interface ButtonStateParams {
  isConnected: boolean;
  isInputValid: boolean;
  amount: string;
  redeem: { isSigning: boolean; isPending: boolean; isConfirming: boolean };
}

export function getRedeemButtonState({
  isConnected,
  isInputValid,
  amount,
  redeem,
}: ButtonStateParams) {
  let buttonText = "Enter Amount";
  let isLoading = false;
  let isDisabled = !isConnected || !isInputValid;

  if (redeem.isSigning) {
    buttonText = "Signing Permit...";
    isLoading = true;
  } else if (redeem.isPending) {
    buttonText = "Sending Transaction...";
    isLoading = true;
  } else if (redeem.isConfirming) {
    buttonText = "Confirming Request...";
    isLoading = true;
  } else {
    buttonText = isInputValid ? `Request Redeem ${amount} stAZT` : "Enter Amount";
  }

  // Override disabled state during loading
  if (isLoading) isDisabled = true;

  return { buttonText, isLoading, isDisabled };
}
