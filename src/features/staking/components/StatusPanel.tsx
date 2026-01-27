import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface StatusPanelProps {
  stAztecBalance: string;
  balance: string;
  allowance: string;
}

export function StatusPanel({
  stAztecBalance,
  balance,
  allowance,
}: StatusPanelProps) {
  return (
    <Card className="bg-muted border-border/50">
      <CardHeader className="pb-2 border-border/10">
        <CardTitle className="text-m font-semibold text-primary uppercase tracking-wide">
          Your Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-m text-muted-foreground flex justify-between">
          <span>Asset Balance:</span>
          <span className="font-mono text-foreground">{balance} AZT</span>
        </div>
        <div className="text-m text-muted-foreground flex justify-between">
          <span>stAztec Balance:</span>
          <span className="font-mono text-foreground">
            {stAztecBalance} stAZT
          </span>
        </div>
        <div className="text-m text-muted-foreground flex justify-between">
          <span>Allowance:</span>
          <span className="font-mono text-foreground">{allowance} AZT</span>
        </div>
      </CardContent>
    </Card>
  );
}
