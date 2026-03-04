import { cn } from "@/lib/utils";

interface PortfolioCardProps {
  totalStaked?: string;
  rewardsEarned?: string;
  isConnected?: boolean;
  className?: string;
}

export function PortfolioCard({
  totalStaked,
  rewardsEarned,
  isConnected,
  className,
}: PortfolioCardProps) {
  if (!isConnected) {
    return (
      <div
        className={cn(
          "bg-card-tertiary rounded-card flex min-h-[175px] w-full flex-col items-start justify-center p-6",
          className
        )}
      >
        <p className="text-card-tertiary-foreground text-lg leading-[1.16] font-medium">
          Portfolio
        </p>
        <p className="text-muted-foreground mt-4 text-sm">Connect wallet to see your portfolio</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card-tertiary rounded-card flex min-h-[175px] w-full flex-col items-start justify-end p-6",
        className
      )}
    >
      <p className="text-card-tertiary-foreground text-lg leading-[1.16] font-medium">Portfolio</p>

      <div className="flex-1" />

      <div className="flex w-full justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-card-tertiary-foreground text-xs leading-[1.16]">
            Total Staked Balance
          </span>
          <div className="bg-secondary-accent h-px w-[123px]" />
          <span className="text-[21.3px] leading-[1.16] font-medium text-black">
            {Number(totalStaked).toFixed(2) || "0.00"}
          </span>
          <span className="text-card-tertiary-foreground text-xs leading-[1.16] tracking-[0.18px]">
            Aztec
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-card-tertiary-foreground text-xs leading-[1.16]">
            Total Rewards Earned
          </span>
          <div className="bg-secondary-accent h-px w-[123px]" />
          <span className="text-[21.3px] leading-[1.16] font-medium text-black">
            {rewardsEarned || "0.00"}
          </span>
          <span className="text-card-tertiary-foreground text-xs leading-[1.16] tracking-[0.18px]">
            Aztec
          </span>
        </div>
      </div>
    </div>
  );
}
