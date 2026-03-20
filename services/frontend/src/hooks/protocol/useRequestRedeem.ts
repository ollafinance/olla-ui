import { usePermitWrite } from "./usePermitWrite";
import { CONTRACTS } from "@/constants/contracts";
import type { BuildArgsParams } from "./usePermitWrite";

export interface UseRequestRedeemOptions {
  onSuccess?: () => void;
  onConfirmed?: () => void;
}

/**
 * Requests a redeem from the vault using EIP-712 permit when available,
 * falling back to approve + requestRedeem.
 */
export function useRequestRedeem(options: UseRequestRedeemOptions = {}) {
  return usePermitWrite(
    {
      tokenContract: CONTRACTS.StAztec,
      vaultFunctionWithPermit: "requestRedeemWithPermit",
      vaultFunctionFallback: "requestRedeem",

      buildArgsWithPermit: ({ value, owner, permit }: BuildArgsParams) => [
        value,
        owner,
        permit!.deadline,
        permit!.v,
        permit!.r,
        permit!.s,
      ],

      buildArgsFallback: ({ value, owner }: BuildArgsParams) => [value, owner, owner],
    },
    options
  );
}
