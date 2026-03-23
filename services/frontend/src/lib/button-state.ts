export interface TransactionState {
  isSigning: boolean;
  isPending: boolean;
  isConfirming: boolean;
}

export interface ButtonStateParams {
  isConnected: boolean;
  isInputValid: boolean;
  amount: string;
  /** Display token symbol shown in the idle action label (e.g. "AZT", "stAZT"). */
  tokenSymbol: string;
  /** Verb shown in the idle action label (e.g. "Stake", "Request Redeem"). */
  actionLabel: string;
  /** Verb shown while confirming (e.g. "Deposit", "Request", "Redeem"). */
  confirmingLabel: string;
  transaction: TransactionState;
}

export interface ButtonStateResult {
  buttonText: string;
  isLoading: boolean;
  isDisabled: boolean;
}

/**
 * Derives button label + loading/disabled flags from a transaction state.
 * Replaces the duplicated `getButtonState` / `getRedeemButtonState` helpers
 * that previously lived in `features/staking/utils.ts` and
 * `features/redeem/utils.ts`.
 */
export function getButtonState({
  isConnected,
  isInputValid,
  amount,
  tokenSymbol,
  actionLabel,
  confirmingLabel,
  transaction,
}: ButtonStateParams): ButtonStateResult {
  let buttonText = "Enter Amount";
  let isLoading = false;
  let isDisabled = !isConnected || !isInputValid;

  if (transaction.isSigning) {
    buttonText = "Signing Permit...";
    isLoading = true;
  } else if (transaction.isPending) {
    buttonText = "Sending Transaction...";
    isLoading = true;
  } else if (transaction.isConfirming) {
    buttonText = `Confirming ${confirmingLabel}...`;
    isLoading = true;
  } else {
    buttonText = isInputValid ? `${actionLabel} ${amount} ${tokenSymbol}` : "Enter Amount";
  }

  if (isLoading) isDisabled = true;

  return { buttonText, isLoading, isDisabled };
}
