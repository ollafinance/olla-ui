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
    <div className="bg-card rounded-card flex h-full min-h-[551px] w-full flex-col p-8">
      <div className="text-[67px] leading-none font-medium tracking-[-1.35px] whitespace-nowrap text-black">
        <p className="mb-0">Transaction</p>
        <p>Successful!</p>
      </div>

      <div className="mt-[22px] flex gap-4 text-black">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-sm">Staked</span>
          <span className="text-lg font-medium">{amount} Aztec</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-sm">Received</span>
          <span className="text-lg font-medium">{shares} stAztec</span>
        </div>
      </div>

      <div className="mt-[22px]">
        <img src={ollaLoading} alt="Success" className="h-[59px] w-[128px]" />
      </div>

      <div className="bg-primary-line mt-[31px] h-px w-full max-w-[487px]" />

      <div className="flex-1" />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="pink"
          size="xl"
          onClick={onStakeMore}
          className="bg-primary rounded-full px-5 py-3 text-base leading-[1.16] font-medium tracking-[-0.32px] text-black"
        >
          Stake More
          <img src={arrowRightIcon} alt="" className="ml-2.5 inline-block h-3 w-3" />
        </Button>
        <Button
          variant="pink"
          size="xl"
          onClick={onViewExplorer}
          className="bg-card-secondary rounded-full px-5 py-3 text-base leading-[1.16] font-medium tracking-[-0.32px] text-black"
        >
          View on Explorer
        </Button>
      </div>
    </div>
  );
}
