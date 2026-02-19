import { cn } from "@/lib/utils";

interface ProtocolInfoProps {
  exchangeRate: string | number;
  transactionFee: string | number;
  apy: string;
  className?: string;
}

export function ProtocolInfo({
  exchangeRate,
  transactionFee,
  apy,
  className,
}: ProtocolInfoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-7 text-xs leading-[1.4] text-muted tracking-[0.36px]",
        className,
      )}
    >
      <div className="flex flex-col">
        <span className="font-normal">Exchange Rate</span>
        <span className="tracking-[0.48px] font-medium">
          1 Aztec = {exchangeRate} stAztec
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-normal">Transaction Fee</span>
        <span className="tracking-[0.48px] font-medium">~{transactionFee} ETH</span>
      </div>
      <div className="flex flex-col">
        <span className="font-normal">APY</span>
        <span className="tracking-[0.48px] font-medium">{apy}</span>
      </div>
    </div>
  );
}