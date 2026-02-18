import { Button } from "@/components/ui/Button";
import ollaLoading from "@/assets/icons/olla-loading.svg";
import arrowRightIcon from "@/assets/icons/arrow-right.svg";

interface StakingCardSuccessProps {
  amount: string;
  shares: string;
  onStakeMore: () => void;
  onViewExplorer: () => void;
}

export function StakingCardSuccess({
  amount,
  shares,
  onStakeMore,
  onViewExplorer,
}: StakingCardSuccessProps) {
  return (
    <div className="bg-card rounded-card p-8 w-full lg:size-card-primary min-h-[551px] lg:min-h-0 flex flex-col">
      <div className="text-[67px] leading-none tracking-[-1.35px] text-black font-medium whitespace-nowrap">
        <p className="mb-0">Transaction</p>
        <p>Successful!</p>
      </div>

      <div className="mt-[22px] flex gap-4 text-black">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Staked</span>
          <span className="text-lg font-medium">{amount} Aztec</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Received</span>
          <span className="text-lg font-medium">{shares} stAztec</span>
        </div>
      </div>

      <div className="mt-[22px]">
        <img
          src={ollaLoading}
          alt="Success"
          className="h-[59px] w-[128px]"
        />
      </div>

      <div className="mt-[31px] h-px w-full max-w-[487px] bg-primary-line" />

      <div className="flex-1" />

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="pink"
          size="xl"
          onClick={onStakeMore}
          className="bg-primary px-5 py-3 text-base text-black leading-[1.16] tracking-[-0.32px] font-medium rounded-full"
        >
          Stake More
          <img src={arrowRightIcon} alt="" className="h-3 w-3 ml-2.5 inline-block" />
        </Button>
        <Button
          variant="pink"
          size="xl"
          onClick={onViewExplorer}
          className="bg-card-secondary px-5 py-3 text-base text-black leading-[1.16] tracking-[-0.32px] font-medium rounded-full"
        >
          View on Explorer
        </Button>
      </div>
    </div>
  );
}