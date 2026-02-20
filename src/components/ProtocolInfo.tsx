import { cn } from "@/lib/utils";

interface ProtocolInfoProps {
  exchangeRate: string;
  transactionFee?: string;
  apy?: string;
  className?: string;
}

export function ProtocolInfo({
  exchangeRate,
  transactionFee = "0.0001",
  apy = "5.2%",
  className,
}: ProtocolInfoProps) {
  return (
    <div
      className={cn(
        "text-muted flex items-center gap-7 text-xs leading-[1.4] tracking-[0.36px]",
        className
      )}
    >
      <div className="flex flex-col">
        <span className="font-normal">Exchange Rate</span>
        <span className="font-medium tracking-[0.48px]">1 Aztec = {exchangeRate} stAztec</span>
      </div>
      <div className="flex flex-col">
        <span className="font-normal">Transaction Fee</span>
        <span className="font-medium tracking-[0.48px]">~{transactionFee} ETH</span>
      </div>
      <div className="flex flex-col">
        <span className="font-normal">APY</span>
        <span className="font-medium tracking-[0.48px]">{apy}</span>
      </div>
    </div>
  );
}
