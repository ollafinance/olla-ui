export interface ButtonStateParams {
  isConnected: boolean;
  isInputValid: boolean;
  amount: string;
  deposit: { isPending: boolean; isConfirming: boolean };
}

export function getButtonState({
  isConnected,
  isInputValid,
  amount,
  deposit,
}: ButtonStateParams) {
  let buttonText = "Enter Amount";
  let isLoading = false;
  let isDisabled = !isConnected || !isInputValid;

  // Ready to deposit
  if (deposit.isPending) {
    buttonText = "Permit & Deposit...";
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
