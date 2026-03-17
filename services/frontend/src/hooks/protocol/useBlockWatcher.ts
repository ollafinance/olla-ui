import { useBlockNumber } from "wagmi";
import { useEffect, useRef } from "react";

export interface UseBlockWatcherOptions {
  onBlock?: (blockNumber: bigint) => void;
  enabled?: boolean;
}

export function useBlockWatcher(options: UseBlockWatcherOptions = {}) {
  const { onBlock, enabled = true } = options;
  const lastBlockRef = useRef<bigint | null>(null);

  const { data: blockNumber } = useBlockNumber({
    watch: enabled,
  });

  useEffect(() => {
    if (blockNumber && blockNumber !== lastBlockRef.current) {
      lastBlockRef.current = blockNumber;
      onBlock?.(blockNumber);
    }
  }, [blockNumber, onBlock]);

  return { blockNumber };
}
