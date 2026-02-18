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
    <div className="bg-card-secondary rounded-card p-6 w-full min-h-[175px] lg:h-card-third flex flex-col items-start justify-between">
      <p className="text-lg text-card-secondary-foreground font-medium leading-[1.16]">
        Estimated stAztec Return
      </p>

      <div className="flex-1" />

      <div className="flex gap-3 w-full">
        {RETURN_PERIODS.map((period) => (
          <div key={period.label} className="flex flex-col gap-2 flex-1">
            <span className="text-[21.3px] leading-none tracking-[-0.43px] text-black font-medium text-center">
              {calculateReturn(shares, period.multiplier)}
            </span>
            <div className="h-px w-full bg-primary-line" />
            <span className="text-xs text-card-secondary-foreground leading-[1.8] text-center">
              {period.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}