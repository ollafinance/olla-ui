import { CurrencySwapButton } from "@/components/ui/CurrencySwapButton";
import { useCurrencySwap } from "@/hooks/useCurrencySwap";
import { STAKING_CONSTANTS } from "../../constants";

interface ReceiveCardProps {
  shares?: string;
  usdValue?: string;
}

export function ReceiveCard({ shares = "95.00", usdValue }: ReceiveCardProps) {
  const { isUsdMode } = useCurrencySwap();

  const calculatedUsdValue =
    usdValue ||
    (parseFloat(shares) * STAKING_CONSTANTS.AZTEC_PRICE_USD).toFixed(2);

  const primaryValue = isUsdMode ? calculatedUsdValue : shares;
  const primaryLabel = isUsdMode ? "USD" : "stAztec";
  const primaryPrefix = isUsdMode ? "$ " : "";

  const secondaryValue = isUsdMode ? shares : calculatedUsdValue;
  const secondaryLabel = isUsdMode ? "stAztec" : "";
  const secondaryPrefix = isUsdMode ? "" : "$ ";

  return (
    <div className="bg-card-secondary rounded-card p-6 w-full min-h-[175px] flex-1 lg:flex-1 lg:min-h-0 flex flex-col items-start justify-between">
      <p className="text-lg text-card-secondary-foreground font-medium leading-[1.16]">
        You Receive
      </p>

      <div className="flex-1" />

      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-end justify-between w-full">
          <span className="text-[37.6px] leading-none tracking-[-0.75px] text-black font-medium">
            {primaryPrefix}{primaryValue}
          </span>
          <span className="text-base text-black leading-[1.8]">{primaryLabel}</span>
        </div>

        <div className="h-px w-full bg-primary-line" />

        <div className="flex items-center justify-between w-full">
          <span className="text-base text-card-secondary-foreground font-medium leading-[1.16]">
            {secondaryPrefix}{secondaryValue} {secondaryLabel}
          </span>
          <CurrencySwapButton />
        </div>
      </div>
    </div>
  );
}