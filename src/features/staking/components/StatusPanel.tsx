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
    <Card className="bg-blue-50 border-blue-100">
      <CardHeader className="pb-2 border-blue-100">
        <CardTitle className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
          Your Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-gray-700 flex justify-between">
          <span>Asset Balance:</span>
          <span className="font-mono">{balance} AZT</span>
        </div>
        <div className="text-sm text-gray-700 flex justify-between">
          <span>stAztec Balance:</span>
          <span className="font-mono">{stAztecBalance} stAZT</span>
        </div>
        <div className="text-sm text-gray-700 flex justify-between">
          <span>Allowance:</span>
          <span className="font-mono">{allowance} AZT</span>
        </div>
      </CardContent>
    </Card>
  );
}
