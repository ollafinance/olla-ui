import { formatEther } from "viem";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface RedeemOverviewProps {
  exchangeRate?: bigint;
  potentialAssets?: bigint;
}

export function RedeemOverview({
  exchangeRate,
  potentialAssets,
}: RedeemOverviewProps) {
  return (
    <Card className="bg-muted border-border/50">
      <CardHeader className="pb-2 border-border/10">
        <CardTitle className="text-m font-semibold text-primary uppercase tracking-wide">
          Redemption Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-m text-muted-foreground flex justify-between">
          <span>Exchange Rate:</span>
          <span className="font-mono text-foreground">
            1 stAZT ≈ {exchangeRate ? formatEther(exchangeRate) : "..."} AZT
          </span>
        </div>

        {potentialAssets && potentialAssets > 0n && (
          <div className="text-m text-muted-foreground flex justify-between">
            <span>You Receive:</span>
            <span className="font-mono text-foreground">
              {formatEther(potentialAssets)} AZT
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
