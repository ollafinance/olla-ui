import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

interface StatusPanelProps {
  stAztecBalance: string;
  balance: string;
}

export function StatusPanel({ stAztecBalance, balance }: StatusPanelProps) {
  return (
    <Card className="bg-muted border-border/50">
      <CardHeader className="border-border/10 pb-2">
        <CardTitle className="text-m text-primary font-semibold tracking-wide uppercase">
          Your Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-m text-muted-foreground flex justify-between">
          <span>Asset Balance:</span>
          <span className="text-foreground font-mono">{balance} AZT</span>
        </div>
        <div className="text-m text-muted-foreground flex justify-between">
          <span>stAztec Balance:</span>
          <span className="text-foreground font-mono">{stAztecBalance} stAZT</span>
        </div>
      </CardContent>
    </Card>
  );
}
