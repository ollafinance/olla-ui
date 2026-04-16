import { getAmountSizeClass } from "@/lib/utils";

interface ReceiveCardProps {
  shares: string;
  exchangeRate: string;
}

export function ReceiveCard({ shares, exchangeRate }: ReceiveCardProps) {
  const sharesSizeClass = getAmountSizeClass(shares, "compact");

  return (
    <div className="bg-card rounded-card flex min-h-[175px] w-full flex-1 flex-col items-start justify-between p-6 lg:min-h-0 lg:flex-1">
      <p className="text-text-display text-lg leading-[1.16] font-medium">You Receive</p>

      <div className="flex-1" />

      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-end justify-between gap-2">
          <span
            className={`text-text-display min-w-0 flex-1 truncate ${sharesSizeClass} leading-none font-medium tracking-[-0.57px] transition-[font-size] duration-150`}
          >
            {shares}
          </span>
          <span className="text-text-display shrink-0 text-base leading-[1.8]">stAztec</span>
        </div>

        <div className="bg-primary-line h-px w-full" />

        <div className="flex w-full items-start justify-between text-xs tracking-[0.36px]">
          <span className="text-gray leading-[1.4]">Exchange Rate</span>
          <span className="text-gray leading-[1.4] font-medium">
            1 Aztec = {exchangeRate} stAztec
          </span>
        </div>
      </div>
    </div>
  );
}
