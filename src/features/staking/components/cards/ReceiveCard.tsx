import { STAKING_CONSTANTS } from "../../constants";
import arrowUpDown from "@/assets/icons/arrow-up-down.svg";

interface ReceiveCardProps {
  shares?: string;
  usdValue?: string;
}

export function ReceiveCard({ shares = "95.00", usdValue }: ReceiveCardProps) {
  const calculatedUsdValue =
    usdValue ||
    (parseFloat(shares) * STAKING_CONSTANTS.AZTEC_PRICE_USD).toFixed(2);

  return (
    <div className="bg-card-secondary rounded-card p-6 w-full min-h-[175px] lg:h-card-third flex flex-col items-start justify-between">
      <p className="text-lg text-card-secondary-foreground font-medium leading-[1.16]">
        You Receive
      </p>

      <div className="flex-1" />

      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-end justify-between w-full">
          <span className="text-[37.6px] leading-none tracking-[-0.75px] text-black font-medium">
            {shares}
          </span>
          <span className="text-base text-black leading-[1.8]">stAztec</span>
        </div>

        <div className="h-px w-full bg-primary-line" />

        <div className="flex items-center justify-between w-full">
          <span className="text-base text-card-secondary-foreground font-medium leading-[1.16]">
            $ {calculatedUsdValue}
          </span>
          <img src={arrowUpDown} alt="" className="h-[11px] w-[14px]" />
        </div>
      </div>
    </div>
  );
}

