interface StatusPanelProps {
  balance: string;
  allowance: string;
}

export function StatusPanel({ balance, allowance }: StatusPanelProps) {
  return (
    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
      <h2 className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Your Status</h2>
      <div className="text-sm text-gray-700 flex justify-between">
        <span>Asset Balance:</span>
        <span className="font-mono">{balance} AZT</span>
      </div>
      <div className="text-sm text-gray-700 flex justify-between">
        <span>Allowance:</span>
        <span className="font-mono">{allowance} AZT</span>
      </div>
    </div>
  );
}
