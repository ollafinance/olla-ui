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
    usdValue || (parseFloat(shares) * STAKING_CONSTANTS.AZTEC_PRICE_USD).toFixed(2);

  const primaryValue = isUsdMode ? calculatedUsdValue : shares;
  const primaryLabel = isUsdMode ? "USD" : "stAztec";
  const primaryPrefix = isUsdMode ? "$ " : "";

  const secondaryValue = isUsdMode ? shares : calculatedUsdValue;
  const secondaryLabel = isUsdMode ? "stAztec" : "";
  const secondaryPrefix = isUsdMode ? "" : "$ ";

  return (
    <div className="bg-card-secondary rounded-card flex min-h-[175px] w-full flex-1 flex-col items-start justify-between p-6 lg:min-h-0 lg:flex-1">
      <p className="text-card-secondary-foreground text-lg leading-[1.16] font-medium">
        You Receive
      </p>

      <div className="flex-1" />

      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-end justify-between">
          <span className="text-[37.6px] leading-none font-medium tracking-[-0.75px] text-black">
            {primaryPrefix}
            {primaryValue}
          </span>
          <span className="text-base leading-[1.8] text-black">{primaryLabel}</span>
        </div>

        <div className="bg-primary-line h-px w-full" />

        <div className="flex w-full items-center justify-between">
          <span className="text-card-secondary-foreground text-base leading-[1.16] font-medium">
            {secondaryPrefix}
            {secondaryValue} {secondaryLabel}
          </span>
          <CurrencySwapButton />
        </div>
      </div>
    </div>
  );
}
