import { RETURN_PERIODS, STAKING_CONSTANTS } from "../../constants";

interface ReturnsCardProps {
  shares?: string;
}

function calculateReturn(shares: string, days: number): string {
  const value = parseFloat(shares);
  const apy = parseFloat(STAKING_CONSTANTS.APY) / 100;
  const dailyRate = apy / 365;
  const returnValue = value * (1 + dailyRate * days);
  return returnValue.toFixed(2);
}

export function ReturnsCard({ shares = "95.00" }: ReturnsCardProps) {
  return (
    <div className="bg-card-secondary rounded-card flex min-h-[175px] w-full flex-1 flex-col items-start justify-between p-6 lg:min-h-0 lg:flex-1">
      <p className="text-card-secondary-foreground text-lg leading-[1.16] font-medium">
        Estimated Aztec Return
      </p>

      <div className="flex-1" />

      <div className="flex w-full gap-3">
        {RETURN_PERIODS.map((period) => (
          <div key={period.label} className="flex flex-1 flex-col gap-2">
            <span className="text-center text-[21.3px] leading-none font-medium tracking-[-0.43px] text-black">
              {calculateReturn(shares, period.multiplier)}
            </span>
            <div className="bg-primary-line h-px w-full" />
            <span className="text-card-secondary-foreground text-center text-xs leading-[1.8]">
              {period.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
