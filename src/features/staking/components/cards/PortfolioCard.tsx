import { MOCK_BALANCES } from "../../constants";

interface PortfolioCardProps {
  totalStaked?: string;
  rewardsEarned?: string;
}

export function PortfolioCard({
  totalStaked = MOCK_BALANCES.STAKED_BALANCE,
  rewardsEarned = MOCK_BALANCES.REWARDS_EARNED,
}: PortfolioCardProps) {
  return (
    <div className="bg-card-tertiary rounded-card p-6 w-full min-h-[175px] lg:h-card-third flex flex-col items-start justify-end">
      <p className="text-lg text-card-tertiary-foreground font-medium leading-[1.16]">
        Portfolio
      </p>

      <div className="flex-1" />

      <div className="flex justify-between w-full gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-card-tertiary-foreground leading-[1.16]">Total Staked Balance</span>
          <div className="h-px w-[123px] bg-secondary-accent" />
          <span className="text-[21.3px] text-black font-medium leading-[1.16]">{totalStaked}</span>
          <span className="text-[9px] text-card-tertiary-foreground tracking-[0.18px] leading-[1.16]">stAZTEC</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs text-card-tertiary-foreground leading-[1.16]">Total Rewards Earned</span>
          <div className="h-px w-[123px] bg-secondary-accent" />
          <span className="text-[21.3px] text-black font-medium leading-[1.16]">{rewardsEarned}</span>
          <span className="text-[9px] text-card-tertiary-foreground tracking-[0.18px] leading-[1.16]">stAZTEC</span>
        </div>
      </div>
    </div>
  );
}