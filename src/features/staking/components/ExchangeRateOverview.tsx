import { formatEther } from "viem";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface ExchangeRateOverviewProps {
  exchangeRate?: bigint;
  potentialShares?: bigint;
}

export function ExchangeRateOverview({ exchangeRate, potentialShares }: ExchangeRateOverviewProps) {
  return (
    <Card className="bg-muted border-border/50">
      <CardHeader className="border-border/10 pb-2">
        <CardTitle className="text-m text-primary font-semibold tracking-wide uppercase">
          Exchange Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-m text-muted-foreground flex justify-between">
          <span>Exchange Rate:</span>
          <span className="text-foreground font-mono">
            1 stAZT ≈ {exchangeRate ? formatEther(exchangeRate) : "..."} AZT
          </span>
        </div>

        {potentialShares && potentialShares > 0n && (
          <div className="text-m text-muted-foreground flex justify-between">
            <span>You Receive:</span>
            <span className="text-foreground font-mono">{formatEther(potentialShares)} stAZT</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
