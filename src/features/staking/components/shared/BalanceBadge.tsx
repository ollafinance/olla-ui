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
    <div className="flex items-center justify-center gap-2 rounded-full bg-black/10 py-1 pr-1 pl-[17px]">
      <span className="text-xs leading-[1.16] font-medium text-black">Balance</span>
      <div className="bg-card flex items-center justify-center rounded-[45px] px-[15px] py-2">
        <span className="text-center text-xs leading-[1.16] font-medium text-black">
          {balance} {tokenSymbol}
        </span>
      </div>
    </div>
  );
}
