import { formatEther } from "viem";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface RedeemStatusPanelProps {
  stAztecBalance: string;
  balance: string;
  activeRequestId?: bigint;
  activeWithdrawalRequest?: {
    recipient: `0x${string}`;
    finalized: boolean;
    claimed: boolean;
    shares: bigint;
    assetsExpected: bigint;
    rate: bigint;
  };
}

export function RedeemStatusPanel({
  stAztecBalance,
  balance,
  activeRequestId,
  activeWithdrawalRequest,
}: RedeemStatusPanelProps) {
  const hasActiveRequest =
    activeRequestId !== undefined &&
    activeRequestId > 0n &&
    activeWithdrawalRequest &&
    !activeWithdrawalRequest.claimed;

  return (
    <Card className="bg-muted border-border/50">
      <CardHeader className="pb-2 border-border/10">
        <CardTitle className="text-m font-semibold text-primary uppercase tracking-wide">
          Your Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balances */}
        <div className="space-y-2">
          <div className="text-m text-muted-foreground flex justify-between">
            <span>stAztec Balance:</span>
            <span className="font-mono text-foreground">
              {stAztecBalance} stAZT
            </span>
          </div>
          <div className="text-m text-muted-foreground flex justify-between">
            <span>Asset Balance:</span>
            <span className="font-mono text-foreground">{balance} AZT</span>
          </div>
        </div>

        {/* Active Request Status */}
        {hasActiveRequest && (
          <div className="pt-4 border-t border-border/10 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">
              Active Withdrawal Request #{activeRequestId.toString()}
            </h4>
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>Amount:</span>
              <span className="font-mono text-foreground">
                {formatEther(activeWithdrawalRequest.shares)} stAZT
              </span>
            </div>
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>Status:</span>
              <span
                className={`font-medium ${
                  activeWithdrawalRequest.finalized
                    ? "text-green-500"
                    : "text-yellow-500"
                }`}
              >
                {activeWithdrawalRequest.finalized ? "Finalized" : "Pending"}
              </span>
            </div>
            {activeWithdrawalRequest.finalized && (
              <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
                Ready to Claim (Claiming not implemented yet)
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
