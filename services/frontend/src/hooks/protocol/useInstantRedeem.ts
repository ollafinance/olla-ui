import { usePermitWrite } from "./usePermitWrite";
import { CONTRACTS } from "@/constants/contracts";
import { applySlippage, PROTOCOL_CONSTANTS } from "@/constants/protocol";
import type { BuildArgsParams } from "./usePermitWrite";

export interface UseInstantRedeemOptions {
  onSuccess?: () => void;
  onConfirmed?: () => void;
}

/**
 * Instantly redeems stAZT from the vault using EIP-712 permit when available,
 * falling back to approve + instantRedeem.
 */
export function useInstantRedeem(options: UseInstantRedeemOptions = {}) {
  return usePermitWrite(
    {
      tokenContract: CONTRACTS.StAztec,
      vaultFunctionWithPermit: "instantRedeemWithPermit",
      vaultFunctionFallback: "instantRedeem",
      previewFunctionName: "previewInstantRedeem",

      buildArgsWithPermit: ({ value, owner, permit, previewResult }: BuildArgsParams) => {
        const minAssetsOut = applySlippage(
          previewResult as bigint,
          PROTOCOL_CONSTANTS.SLIPPAGE_TOLERANCE_BP
        );
        return [value, owner, minAssetsOut, permit!.deadline, permit!.v, permit!.r, permit!.s];
      },

      buildArgsFallback: ({ value, owner, previewResult }: BuildArgsParams) => {
        const minAssetsOut = applySlippage(
          previewResult as bigint,
          PROTOCOL_CONSTANTS.SLIPPAGE_TOLERANCE_BP
        );
        return [value, owner, minAssetsOut];
      },
    },
    options
  );
}
