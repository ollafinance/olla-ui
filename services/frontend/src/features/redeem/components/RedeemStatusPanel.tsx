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
      <CardHeader className="border-border/10 pb-2">
        <CardTitle className="text-m text-primary font-semibold tracking-wide uppercase">
          Your Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balances */}
        <div className="space-y-2">
          <div className="text-m text-muted-foreground flex justify-between">
            <span>stAztec Balance:</span>
            <span className="text-foreground font-mono">{stAztecBalance} stAZT</span>
          </div>
          <div className="text-m text-muted-foreground flex justify-between">
            <span>Asset Balance:</span>
            <span className="text-foreground font-mono">{balance} AZT</span>
          </div>
        </div>

        {/* Active Request Status */}
        {hasActiveRequests && (
          <div className="border-border/10 space-y-2 border-t pt-4">
            <div className="text-muted-foreground text-sm">
              You have active withdrawal requests.
            </div>
            {cta}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
