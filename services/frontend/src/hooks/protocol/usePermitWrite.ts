import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnection,
  useReadContract,
  useSignTypedData,
  useConfig,
  usePublicClient,
} from "wagmi";
import { parseSignature } from "viem";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { useCallback, useState } from "react";
import { CONTRACTS } from "@/constants/contracts";
import { PROTOCOL_CONSTANTS } from "@/constants/protocol";
import {
  extractDomainParams,
  buildPermitMessage,
  PERMIT_TYPES,
  type Eip712DomainTuple,
} from "@/lib/permit";
import { useTransactionWithTimeout } from "./useTransactionWithTimeout";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Minimum contract descriptor needed for permit / approve operations. */
interface TokenContractConfig {
  address: `0x${string}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abi: any;
}

interface PermitSignResult {
  v: number;
  r: `0x${string}`;
  s: `0x${string}`;
  deadline: bigint;
}

/** Parameters available when building vault function arguments. */
export interface BuildArgsParams {
  value: bigint;
  owner: `0x${string}`;
  permit?: PermitSignResult;
  /** Only present when a preview function name was provided. */
  previewResult?: bigint;
}

export interface UsePermitWriteConfig {
  /** The ERC-20 token contract whose `eip712Domain` / `nonces` will be read. */
  tokenContract: TokenContractConfig;
  /**
   * Vault function to call **with** the EIP-712 permit signature.
   * e.g. `"depositWithPermit"` | `"instantRedeemWithPermit"` | `"requestRedeemWithPermit"`
   */
  vaultFunctionWithPermit: string;
  /**
   * Vault function to call via the approve-then-write fallback path.
   * e.g. `"deposit"` | `"instantRedeem"` | `"requestRedeem"`
   */
  vaultFunctionFallback: string;
  /**
   * Builds the args array for the *WithPermit vault call.
   * Receives value, owner address, and the parsed permit signature + deadline.
   */
  buildArgsWithPermit: (params: BuildArgsParams) => unknown[];
  /**
   * Builds the args array for the plain (fallback) vault call.
   */
  buildArgsFallback: (params: BuildArgsParams) => unknown[];
  /**
   * Optional vault function to call before signing in order to obtain a preview
   * value (e.g. `"previewDeposit"`, `"previewInstantRedeem"`).
   * The result is forwarded as `params.previewResult` in `buildArgs*`.
   */
  previewFunctionName?: string;
}

export interface UsePermitWriteOptions {
  onSuccess?: () => void;
  onConfirmed?: () => void;
  refetchAfterConfirm?: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Generic hook that encapsulates the EIP-712 permit-sign → vault-call flow
 * shared by `useDeposit`, `useInstantRedeem`, and `useRequestRedeem`.
 *
 * On wallets/contracts that do **not** support permits it falls back to
 * `approve` + plain vault call automatically.
 */
export function usePermitWrite(
  config: UsePermitWriteConfig,
  options: UsePermitWriteOptions = {}
) {
  const { address } = useConnection();
  const wagmiConfig = useConfig();
  const publicClient = usePublicClient();
  const [isSigning, setIsSigning] = useState(false);

  // ── EIP-712 domain + nonce ─────────────────────────────────────────────────
  const { data: tokenDomain } = useReadContract({
    address: config.tokenContract.address,
    abi: config.tokenContract.abi,
    functionName: "eip712Domain",
  });

  const { data: tokenNonce, refetch: refetchNonce } = useReadContract({
    address: config.tokenContract.address,
    abi: config.tokenContract.abi,
    functionName: "nonces",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { mutateAsync: signTypedData } = useSignTypedData();

  // ── Write contract ─────────────────────────────────────────────────────────
  const {
    mutate: vaultMutate,
    data: txHash,
    isPending,
    error: writeError,
    reset: resetWriteContract,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const { timeoutError, startTimeout, reset: resetTimeout } = useTransactionWithTimeout({
    hash: txHash,
    isConfirmed,
    onConfirmed: options.onConfirmed,
    refetchAfterConfirm: () => {
      refetchNonce();
      options.refetchAfterConfirm?.();
    },
  });

  // ── Main write function ────────────────────────────────────────────────────
  const write = useCallback(
    async (amount: string) => {
      if (!address || !publicClient) return;

      try {
        setIsSigning(true);

        const { parseEther } = await import("viem");
        const value = parseEther(amount);

        // Optional preview call (e.g. previewDeposit / previewInstantRedeem)
        let previewResult: bigint | undefined;
        if (config.previewFunctionName) {
          const result = await readContract(wagmiConfig, {
            address: CONTRACTS.OllaVault.address,
            abi: CONTRACTS.OllaVault.abi,
            functionName: config.previewFunctionName,
            args: [value],
          });
          if (result === undefined || result === null)
            throw new Error(`Could not fetch ${config.previewFunctionName}`);
          previewResult = result as bigint;
        }

        const canUsePermit = !!tokenDomain && tokenNonce !== undefined;

        if (canUsePermit) {
          const domain = extractDomainParams(tokenDomain as Eip712DomainTuple);
          const block = await publicClient.getBlock();
          const deadline = block.timestamp + BigInt(PROTOCOL_CONSTANTS.DEADLINE_SECONDS);

          const { data: currentNonce } = await refetchNonce();
          if (currentNonce === undefined || currentNonce === null)
            throw new Error("Could not fetch nonce");

          const signature = await signTypedData({
            domain: {
              name: domain.name,
              version: domain.version,
              chainId: Number(domain.chainId),
              verifyingContract: domain.verifyingContract,
            },
            types: { Permit: PERMIT_TYPES },
            primaryType: "Permit",
            message: buildPermitMessage(
              address,
              CONTRACTS.OllaVault.address,
              value,
              currentNonce as bigint,
              deadline
            ),
          });

          const { v, r, s } = parseSignature(signature);
          const permit: PermitSignResult = { v: Number(v), r, s, deadline };

          vaultMutate(
            {
              address: CONTRACTS.OllaVault.address,
              abi: CONTRACTS.OllaVault.abi,
              functionName: config.vaultFunctionWithPermit,
              args: config.buildArgsWithPermit({ value, owner: address, permit, previewResult }),
            },
            {
              onSuccess: () => {
                setIsSigning(false);
                startTimeout();
                options.onSuccess?.();
              },
              onError: () => setIsSigning(false),
            }
          );
          return;
        }

        // Fallback: approve then plain vault call
        const currentAllowance = (await readContract(wagmiConfig, {
          address: config.tokenContract.address,
          abi: config.tokenContract.abi,
          functionName: "allowance",
          args: [address, CONTRACTS.OllaVault.address],
        })) as bigint;

        if (currentAllowance < value) {
          const approveHash = await writeContract(wagmiConfig, {
            address: config.tokenContract.address,
            abi: config.tokenContract.abi,
            functionName: "approve",
            args: [CONTRACTS.OllaVault.address, value],
          });
          await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });
        }

        vaultMutate(
          {
            address: CONTRACTS.OllaVault.address,
            abi: CONTRACTS.OllaVault.abi,
            functionName: config.vaultFunctionFallback,
            args: config.buildArgsFallback({ value, owner: address, previewResult }),
          },
          {
            onSuccess: () => {
              setIsSigning(false);
              startTimeout();
              options.onSuccess?.();
            },
            onError: () => setIsSigning(false),
          }
        );
      } catch {
        setIsSigning(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [address, publicClient, wagmiConfig, tokenDomain, tokenNonce, config]
  );

  const reset = useCallback(() => {
    setIsSigning(false);
    resetTimeout();
    resetWriteContract();
  }, [resetTimeout, resetWriteContract]);

  return {
    write,
    isSigning,
    isPending,
    isConfirming,
    isConfirmed,
    hash: txHash,
    error: timeoutError ?? receiptError ?? writeError,
    reset,
  };
}
