interface ReceiveCardProps {
  shares: string;
  exchangeRate: string;
}

export function ReceiveCard({ shares, exchangeRate }: ReceiveCardProps) {
  return (
    <div className="bg-card rounded-card flex min-h-[175px] w-full flex-1 flex-col items-start justify-between p-6 lg:min-h-0 lg:flex-1">
      <p className="text-text-display text-lg leading-[1.16] font-medium">You Receive</p>

      <div className="flex-1" />

      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-end justify-between">
          <span className="text-text-display text-[28.43px] leading-none font-medium tracking-[-0.57px]">
            {shares}
          </span>
          <span className="text-text-display text-base leading-[1.8]">stAztec</span>
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
