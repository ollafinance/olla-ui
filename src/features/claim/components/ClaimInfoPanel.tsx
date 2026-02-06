import { formatEther } from "viem";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface ClaimInfoPanelProps {
  totalRequests: number;
  claimableCount: number;
  pendingCount: number;
  claimedCount: number;
  totalClaimableAssets: bigint;
}

export function ClaimInfoPanel({
  totalRequests,
  claimableCount,
  pendingCount,
  claimedCount,
  totalClaimableAssets,
}: ClaimInfoPanelProps) {
  return (
    <Card className="bg-muted border-border/50">
      <CardHeader className="pb-2 border-border/10">
        <CardTitle className="text-m font-semibold text-primary uppercase tracking-wide">
          Your Info
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InfoStat label="Total" value={totalRequests.toString()} />
            <InfoStat label="Claimable" value={claimableCount.toString()} />
            <InfoStat label="Pending" value={pendingCount.toString()} />
          </div>

          <div className="text-sm text-muted-foreground flex justify-between">
            <span>Claimable Assets:</span>
            <span className="font-mono text-foreground">
              {formatEther(totalClaimableAssets)} AZT
            </span>
          </div>

          {claimedCount > 0 && (
            <div className="text-xs text-muted-foreground">
              {claimedCount} request
              {claimedCount === 1 ? "" : "s"} already claimed.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface InfoStatProps {
  label: string;
  value: string;
}

function InfoStat({ label, value }: InfoStatProps) {
  return (
    <div className="rounded-lg bg-background/60 border border-border/60 p-3 text-center">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}
