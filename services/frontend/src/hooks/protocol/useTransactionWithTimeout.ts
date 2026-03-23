import { useState, useEffect, useRef, useCallback } from "react";
import { CONFIRMATION_TIMEOUT_MS } from "@/constants/protocol";

const TIMEOUT_MESSAGE =
  "Transaction confirmation timed out. The transaction may have been reverted or stuck.";

interface UseTransactionWithTimeoutOptions {
  /** The on-chain hash produced after a successful write call. */
  hash: `0x${string}` | undefined;
  /** True once the receipt has been confirmed on-chain. */
  isConfirmed: boolean;
  /** Called once per confirmed transaction (guarded against double-calls). */
  onConfirmed?: () => void;
  /** Optional refetch to run after confirmation (e.g. re-read nonce / balance). */
  refetchAfterConfirm?: () => void;
}

interface UseTransactionWithTimeoutReturn {
  /** Set when the confirmation window expires without a receipt. */
  timeoutError: Error | null;
  /**
   * Call this immediately after `mutate` succeeds (i.e. in the `onSuccess`
   * callback) to start the confirmation timeout clock.
   */
  startTimeout: () => void;
  /** Clears all internal state – call this from the parent hook's own reset(). */
  reset: () => void;
}

/**
 * Encapsulates the timeout / once-only confirmation callback pattern that every
 * write hook in the codebase repeats verbatim.
 *
 * Usage:
 * ```ts
 * const { timeoutError, startTimeout, reset } = useTransactionWithTimeout({
 *   hash: writeHash,
 *   isConfirmed: isWriteConfirmed,
 *   onConfirmed: options.onConfirmed,
 *   refetchAfterConfirm: refetchNonce,
 * });
 * ```
 */
export function useTransactionWithTimeout({
  hash,
  isConfirmed,
  onConfirmed,
  refetchAfterConfirm,
}: UseTransactionWithTimeoutOptions): UseTransactionWithTimeoutReturn {
  const [timeoutError, setTimeoutError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCalledConfirmed = useRef(false);

  // Clear the running timeout as soon as the receipt lands, and clean up on unmount.
  useEffect(() => {
    if (isConfirmed && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isConfirmed]);

  // A new hash means a new transaction – allow the confirmed callback to fire again.
  useEffect(() => {
    if (hash) {
      hasCalledConfirmed.current = false;
    }
  }, [hash]);

  // Fire onConfirmed + optional refetch exactly once per confirmed transaction.
  useEffect(() => {
    if (isConfirmed && !hasCalledConfirmed.current) {
      hasCalledConfirmed.current = true;
      refetchAfterConfirm?.();
      onConfirmed?.();
    }
  }, [isConfirmed, onConfirmed, refetchAfterConfirm]);

  const startTimeout = useCallback(() => {
    setTimeoutError(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setTimeoutError(new Error(TIMEOUT_MESSAGE));
    }, CONFIRMATION_TIMEOUT_MS);
  }, []);

  const reset = useCallback(() => {
    setTimeoutError(null);
    hasCalledConfirmed.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { timeoutError, startTimeout, reset };
}
