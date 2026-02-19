export interface ButtonStateParams {
  isConnected: boolean;
  isInputValid: boolean;
  amount: string;
  deposit: { isSigning: boolean; isPending: boolean; isConfirming: boolean };
}

export function getButtonState({ isConnected, isInputValid, amount, deposit }: ButtonStateParams) {
  let buttonText = "Enter Amount";
  let isLoading = false;
  let isDisabled = !isConnected || !isInputValid;

  // Determine button state based on deposit flow stage
  if (deposit.isSigning) {
    buttonText = "Signing Permit...";
    isLoading = true;
  } else if (deposit.isPending) {
    buttonText = "Sending Transaction...";
    isLoading = true;
  } else if (deposit.isConfirming) {
    buttonText = "Confirming Deposit...";
    isLoading = true;
  } else {
    buttonText = isInputValid ? `Stake ${amount} AZT` : "Enter Amount";
  }

  // Override disabled state during loading
  if (isLoading) isDisabled = true;

  return { buttonText, isLoading, isDisabled };
}
