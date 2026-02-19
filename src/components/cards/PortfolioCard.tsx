import { cn } from "@/lib/utils";

interface PortfolioCardProps {
  totalStaked?: string;
  rewardsEarned?: string;
  className?: string;
}

export function PortfolioCard({
  totalStaked = "3095.00",
  rewardsEarned = "295.00",
  className,
}: PortfolioCardProps) {
  return (
    <div
      className={cn(
        "bg-card-tertiary rounded-card p-6 w-full min-h-[175px] flex flex-col items-start justify-end",
        className,
      )}
    >
      <p className="text-lg text-card-tertiary-foreground font-medium leading-[1.16]">
        Portfolio
      </p>

      <div className="flex-1" />

      <div className="flex justify-between w-full gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-card-tertiary-foreground leading-[1.16]">
            Total Staked Balance
          </span>
          <div className="h-px w-[123px] bg-secondary-accent" />
          <span className="text-[21.3px] text-black font-medium leading-[1.16]">
            {totalStaked}
          </span>
          <span className="text-xs text-card-tertiary-foreground tracking-[0.18px] leading-[1.16]">
            Aztec
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-card-tertiary-foreground leading-[1.16]">
            Total Rewards Earned
          </span>
          <div className="h-px w-[123px] bg-secondary-accent" />
          <span className="text-[21.3px] text-black font-medium leading-[1.16]">
            {rewardsEarned}
          </span>
          <span className="text-xs text-card-tertiary-foreground tracking-[0.18px] leading-[1.16]">
            Aztec
          </span>
        </div>
      </div>
    </div>
  );
}
