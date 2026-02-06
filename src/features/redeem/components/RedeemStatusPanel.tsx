import { type ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface RedeemStatusPanelProps {
  stAztecBalance: string;
  balance: string;
  hasActiveRequests: boolean;
  cta?: ReactNode;
}

export function RedeemStatusPanel({
  stAztecBalance,
  balance,
  hasActiveRequests,
  cta,
}: RedeemStatusPanelProps) {
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
        {hasActiveRequests && (
          <div className="pt-4 border-t border-border/10 space-y-2">
            <div className="text-sm text-muted-foreground">
              You have active withdrawal requests.
            </div>
            {cta}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
