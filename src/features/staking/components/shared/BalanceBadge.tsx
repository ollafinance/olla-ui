import { MOCK_BALANCES } from "../../constants";

interface BalanceBadgeProps {
  balance?: string;
  tokenSymbol?: string;
}

export function BalanceBadge({
  balance = MOCK_BALANCES.AZTEC_BALANCE,
  tokenSymbol = "Aztec",
}: BalanceBadgeProps) {
  return (
    <div className="flex items-center justify-center gap-2 bg-black/10 rounded-full pl-[17px] pr-1 py-1">
      <span className="text-xs text-black leading-[1.16] font-medium">
        Balance
      </span>
      <div className="bg-card flex items-center justify-center px-[15px] py-2 rounded-[45px]">
        <span className="text-xs text-black leading-[1.16] font-medium text-center">
          {balance} {tokenSymbol}
        </span>
      </div>
    </div>
  );
}

