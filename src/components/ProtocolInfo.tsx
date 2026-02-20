import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

interface ProtocolInfoProps {
  exchangeRate: string;
  transactionFee?: string;
  isFeeLoading?: boolean;
  feeError?: string | null;
  apy?: string;
  className?: string;
}

export function ProtocolInfo({
  exchangeRate,
  transactionFee,
  isFeeLoading = false,
  feeError = null,
  apy = "5.2%",
  className,
}: ProtocolInfoProps) {
  const renderFee = () => {
    if (isFeeLoading) {
      return <span className="font-medium tracking-[0.48px]">Calculating...</span>;
    }
    
    if (feeError) {
      return (
        <Tooltip content="Unable to estimate gas fees. This may be due to network congestion or invalid transaction parameters.">
          <span className="font-medium tracking-[0.48px] cursor-help text-red-500">
            Unable to estimate
          </span>
        </Tooltip>
      );
    }
    
    return (
      <span className="font-medium tracking-[0.48px]">
        ~{transactionFee || "0.0001"} ETH
      </span>
    );
  };

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
        {renderFee()}
      </div>
      <div className="flex flex-col">
        <span className="font-normal">APY</span>
        <span className="font-medium tracking-[0.48px]">{apy}</span>
      </div>
    </div>
  );
}
