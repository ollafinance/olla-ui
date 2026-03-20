import { usePermitWrite } from "./usePermitWrite";
import { CONTRACTS } from "@/constants/contracts";
import { applySlippage, PROTOCOL_CONSTANTS } from "@/constants/protocol";
import type { BuildArgsParams } from "./usePermitWrite";

export interface UseDepositOptions {
  onSuccess?: () => void;
  onConfirmed?: () => void;
}

/**
 * Deposits AZT into the vault using EIP-712 permit when available,
 * falling back to approve + deposit.
 */
export function useDeposit(options: UseDepositOptions = {}) {
  return usePermitWrite(
    {
      tokenContract: CONTRACTS.Asset,
      vaultFunctionWithPermit: "depositWithPermit",
      vaultFunctionFallback: "deposit",
      previewFunctionName: "previewDeposit",

      buildArgsWithPermit: ({ value, owner, permit, previewResult }: BuildArgsParams) => {
        const minSharesOut = applySlippage(
          previewResult as bigint,
          PROTOCOL_CONSTANTS.SLIPPAGE_TOLERANCE_BP
        );
        return [value, owner, minSharesOut, permit!.deadline, permit!.v, permit!.r, permit!.s];
      },

      buildArgsFallback: ({ value, owner, previewResult }: BuildArgsParams) => {
        const minSharesOut = applySlippage(
          previewResult as bigint,
          PROTOCOL_CONSTANTS.SLIPPAGE_TOLERANCE_BP
        );
        return [value, owner, minSharesOut];
      },
    },
    options
  );
}
