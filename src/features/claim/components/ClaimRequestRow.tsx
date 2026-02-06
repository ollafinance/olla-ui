import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatEther } from "viem";

interface ClaimRequestRowProps {
  request: {
    id: bigint;
    assetsExpected: bigint;
    shares: bigint;
    rate: bigint;
    finalized: boolean;
    claimed: boolean;
  };
  claimRequest: {
    write: (requestId: bigint) => void;
    isPending: boolean;
    isConfirming: boolean;
  };
}

export function ClaimRequestRow({ request, claimRequest }: ClaimRequestRowProps) {
  const { id, assetsExpected, shares, rate, finalized, claimed } = request;

  const isClaimable = finalized && !claimed;
  const status = claimed ? "Claimed" : finalized ? "Ready to Claim" : "Pending";

  return (
    <Card className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Request #{id.toString()}
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
            onClick={() => claimRequest.write(id)}
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
