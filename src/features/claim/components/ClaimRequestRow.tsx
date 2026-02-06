import { useWithdrawalRequest } from "@/hooks/protocol/useWithdrawalQueue";
import { useOllaCore } from "@/hooks/protocol/useOllaCore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatEther } from "viem";

interface ClaimRequestRowProps {
  requestId: bigint;
}

export function ClaimRequestRow({ requestId }: ClaimRequestRowProps) {
  const { request } = useWithdrawalRequest(requestId);
  const { claimRequest } = useOllaCore();

  if (!request) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </Card>
    );
  }

  // Handle potential array or object return from Wagmi (safe access)
  // Although ABI is const, runtime behavior depends on config.
  // Given standard config, it's likely an object with keys matching ABI component names.
  const { assetsExpected, shares, rate, finalized, claimed } = request as any;

  const isClaimable = finalized && !claimed;
  const status = claimed ? "Claimed" : finalized ? "Ready to Claim" : "Pending";

  return (
    <Card className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Request #{requestId.toString()}
        </span>
        <div className="text-xl font-medium">
          {formatEther(assetsExpected || 0n)}{" "}
          <span className="text-sm text-gray-500">AZTEC</span>
        </div>
        <div className="text-xs text-gray-400">
          {formatEther(shares || 0n)} stAztec
        </div>
        <div className="text-xs text-gray-400">
          Locked Rate: {formatEther(rate ?? 0n)} AZT per stAztec
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === "Claimed"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : status === "Ready to Claim"
                ? "bg-background text-primary dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          }`}
        >
          {status}
        </div>

        {isClaimable && (
          <Button
            className="bg-secondary text-black-400 font-bold"
            onClick={() => claimRequest.write(requestId)}
            disabled={claimRequest.isPending || claimRequest.isConfirming}
          >
            {claimRequest.isPending || claimRequest.isConfirming
              ? "Claiming..."
              : "Claim"}
          </Button>
        )}
      </div>
    </Card>
  );
}
