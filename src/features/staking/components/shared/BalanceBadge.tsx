interface BalanceBadgeProps {
  currency: "Aztec" | "stAztec";
  balance?: string;
  isConnected?: boolean;
}

export function BalanceBadge({ balance, isConnected, currency }: BalanceBadgeProps) {
  const displayBalance = isConnected && balance ? balance : "----";

  return (
    <div className="bg-badge-bg flex items-center justify-center gap-3 rounded-[46px] px-[17px] py-1">
      <span className="text-badge-text text-xs leading-[1.16] font-semibold">Balance</span>
      <div className="bg-card h-[26px] w-px" />
      <div className="flex items-center justify-center py-2">
        <span className="text-badge-text text-center text-xs leading-[1.16] font-medium">
          {Number(displayBalance).toFixed(2)} {currency}
        </span>
      </div>
    </div>
  );
}
