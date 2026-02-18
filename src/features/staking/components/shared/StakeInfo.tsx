import { STAKING_CONSTANTS } from "../../constants";
import { cn } from "@/lib/utils";

interface StakeInfoProps {
  exchangeRate?: string;
  transactionFee?: string;
  apy?: string;
  className?: string;
}

export function StakeInfo({
  exchangeRate = `1 Aztec = ${STAKING_CONSTANTS.EXCHANGE_RATE} stAztec`,
  transactionFee = `~${STAKING_CONSTANTS.TRANSACTION_FEE} Aztec`,
  apy = STAKING_CONSTANTS.APY,
  className,
}: StakeInfoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-7 text-xs leading-[1.4] text-muted tracking-[0.36px]",
        className,
      )}
    >
      <div className="flex flex-col">
        <span className="font-normal">Exchange Rate</span>
        <span className="tracking-[0.48px] font-medium">{exchangeRate}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-normal">Transaction Fee</span>
        <span className="tracking-[0.48px] font-medium">{transactionFee}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-normal">APY</span>
        <span className="tracking-[0.48px] font-medium">{apy}</span>
      </div>
    </div>
  );
}

