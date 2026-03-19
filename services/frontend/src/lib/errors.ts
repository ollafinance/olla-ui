import {
  BaseError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
  decodeErrorResult,
  formatEther,
} from "viem";
import type { Abi, Hex } from "viem";
import { CONTRACTS } from "@/constants/contracts";

/** Safe formatEther that handles non-bigint gracefully */
function fmtEth(value: unknown): string {
  if (typeof value === "bigint") {
    return formatEther(value);
  }
  return String(value ?? "?");
}

type ErrorArgs = readonly unknown[];

/**
 * Map of Solidity custom error names to user-facing message functions.
 * Args match the error's ABI inputs in order.
 */
const ERROR_MESSAGES: Record<string, (args?: ErrorArgs) => string> = {
  // Vault errors
  OllaVault__DepositCapExceeded: (args) =>
    `Deposit cap exceeded (tried ${fmtEth(args?.[0])}, total ${fmtEth(args?.[1])})`,
  OllaVault__InsufficientLiquidity: (args) =>
    `Not enough liquidity for instant redemption (requested ${fmtEth(args?.[0])}, available ${fmtEth(args?.[1])})`,
  OllaVault__SlippageExceeded: (args) =>
    `Transaction failed due to price movement (received ${fmtEth(args?.[0])}, minimum ${fmtEth(args?.[1])})`,
  OllaVault__InvalidAmount: () => "Invalid amount",
  OllaVault__InsufficientBuffer: () => "Insufficient funds available",
  OllaVault__InsufficientBufferedAssets: () => "Insufficient funds available",
  OllaVault__NotFinalized: () => "Withdrawal request not yet finalized",
  OllaVault__PermitFailed: (args) => {
    // The first arg is the inner revert bytes — try to decode the nested error
    const innerBytes = args?.[0];
    if (typeof innerBytes === "string" && innerBytes.startsWith("0x") && innerBytes.length >= 10) {
      const innerDecoded = tryDecodeFromAllAbis(innerBytes as Hex);
      if (innerDecoded) {
        const innerMsg = ERROR_MESSAGES[innerDecoded.errorName]?.(innerDecoded.args);
        if (innerMsg) return `Token approval failed: ${innerMsg}`;
      }
    }
    return "Token approval failed";
  },
  OllaVault__SafetyModulePaused: () => "Protocol is currently paused",
  OllaVault__Unauthorized: () => "Not authorized",
  OllaVault__RequestNotFound: () => "Withdrawal request not found",
  OllaVault__InvalidParameter: () => "Invalid parameter",

  // Core errors (cross-contract reverts)
  OllaCore__DepositCapExceeded: (args) =>
    `Deposit cap exceeded (tried ${fmtEth(args?.[0])}, total ${fmtEth(args?.[1])})`,
  OllaCore__InvalidAmount: () => "Invalid amount",
  OllaCore__SafetyModulePaused: () => "Protocol is currently paused",

  // ERC20 / ERC2612 errors
  ERC20InsufficientBalance: (args) =>
    `Insufficient balance (have ${fmtEth(args?.[1])}, need ${fmtEth(args?.[2])})`,
  ERC20InsufficientAllowance: () => "Insufficient token allowance",
  ERC2612ExpiredSignature: () => "Signature expired, please try again",

  // OpenZeppelin errors
  EnforcedPause: () => "Protocol is currently paused",
  StAztec__Unauthorized: () => "Not authorized",
};

/** All ABIs to attempt decoding against for cross-contract reverts */
const ALL_ABIS: Abi[] = [
  CONTRACTS.OllaVault.abi as unknown as Abi,
  CONTRACTS.OllaCore.abi as unknown as Abi,
  CONTRACTS.StAztec.abi as unknown as Abi,
  CONTRACTS.Asset.abi as unknown as Abi,
];

/**
 * Attempt to decode raw revert data against all known ABIs.
 * Useful for cross-contract reverts where viem couldn't match the error.
 */
function tryDecodeFromAllAbis(data: Hex): { errorName: string; args?: ErrorArgs } | null {
  for (const abi of ALL_ABIS) {
    try {
      const decoded = decodeErrorResult({ abi, data });
      return { errorName: decoded.errorName, args: decoded.args as ErrorArgs };
    } catch {
      // This ABI doesn't contain the error selector, try next
    }
  }
  return null;
}

/**
 * Look up an error name (and optional args) in the ERROR_MESSAGES map.
 * Returns the user-facing string, or the raw errorName if no handler exists.
 */
function formatDecodedError(errorName: string, args?: ErrorArgs): string {
  const handler = ERROR_MESSAGES[errorName];
  if (handler) return handler(args);
  return errorName;
}

/**
 * Some RPC nodes return revert data as a string inside the error message
 * instead of structured data. E.g.:
 *   "custom error 0x97887f53: 0000...0000"
 * This extracts the selector + data and reconstructs the full calldata hex.
 */
const CUSTOM_ERROR_RE = /custom error (0x[0-9a-fA-F]{8}):\s*([0-9a-fA-F]+)/;

function tryDecodeFromMessage(error: BaseError): string | null {
  // Search the full error message chain for hex revert data
  const msg = error.shortMessage || error.message || "";
  const match = CUSTOM_ERROR_RE.exec(msg);
  if (!match) return null;

  const fullHex = `${match[1]}${match[2]}` as Hex;
  const decoded = tryDecodeFromAllAbis(fullHex);
  if (!decoded) return null;
  return formatDecodedError(decoded.errorName, decoded.args);
}

/**
 * Extract a user-friendly error message from a contract interaction error.
 *
 * Walks viem's error chain to find custom Solidity errors and maps them
 * to readable messages. Falls back gracefully for unknown errors.
 */
export function getContractErrorMessage(error: Error): string {
  if (!(error instanceof BaseError)) {
    return error.message || "Transaction failed";
  }

  // Check for wallet rejection first
  const userRejection = error.walk((e) => e instanceof UserRejectedRequestError);
  if (userRejection) {
    return "Transaction was rejected in your wallet.";
  }

  // Check for contract revert errors
  const revertError = error.walk(
    (e) => e instanceof ContractFunctionRevertedError
  ) as ContractFunctionRevertedError | null;

  if (revertError) {
    const { data } = revertError;

    // Try named error from decoded data
    if (data?.errorName) {
      return formatDecodedError(data.errorName, data.args as ErrorArgs);
    }

    // Check for string revert reason
    if (revertError.reason) {
      return revertError.reason;
    }

    // Try raw hex decoding against all ABIs (cross-contract reverts)
    const raw =
      (revertError.data as { raw?: Hex } | undefined)?.raw ??
      (revertError as unknown as { raw?: Hex }).raw;
    if (raw) {
      const decoded = tryDecodeFromAllAbis(raw);
      if (decoded) {
        return formatDecodedError(decoded.errorName, decoded.args);
      }
    }
  }

  // Try extracting hex revert data from the error message string.
  // Some RPC nodes embed "custom error 0x<selector>: <data>" in the message
  // instead of returning structured data that viem can decode.
  const fromMessage = tryDecodeFromMessage(error);
  if (fromMessage) return fromMessage;

  // Fall back to viem's shortMessage or raw message
  return (error as BaseError).shortMessage || error.message || "Transaction failed";
}
