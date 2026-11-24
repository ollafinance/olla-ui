interface BalanceBadgeProps {
  currency: "Aztec" | "stAztec";
  balance?: string;
  isConnected?: boolean;
}

export function BalanceBadge({ balance, isConnected, currency }: BalanceBadgeProps) {
  // Only format a real numeric balance; keep the "----" placeholder as-is so it
  // never renders as "NaN Aztec" when the wallet is not connected.
  const numericBalance = Number(balance);
  const hasValidBalance =
    !!isConnected && balance !== undefined && balance !== "" && !Number.isNaN(numericBalance);
  const displayBalance = hasValidBalance ? numericBalance.toFixed(2) : "----";

  return (
    <div className="bg-badge-bg flex items-center justify-center gap-3 rounded-[46px] px-[17px] py-1">
      <span className="text-badge-text text-xs leading-[1.16] font-semibold">Balance</span>
      <div className="bg-card h-[26px] w-px" />
      <div className="flex items-center justify-center py-2">
        <span className="text-badge-text text-center text-xs leading-[1.16] font-medium">
          {displayBalance} {currency}
        </span>
      </div>
    </div>
  );
}
