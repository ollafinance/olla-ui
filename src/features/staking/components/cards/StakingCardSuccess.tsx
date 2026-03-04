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
      <div className="text-text-display text-[67.43px] leading-none font-medium tracking-[-1.35px] whitespace-nowrap">
        <p className="mb-0">Transaction</p>
        <p>Successful!</p>
      </div>

      <div className="mt-[89px]">
        <img src={ollaLoading} alt="Success" className="h-[59px] w-[128px]" />
      </div>

      <div className="bg-primary-line mt-[8px] h-px w-full max-w-[487px]" />

      <div className="text-text-display mt-[44px] flex gap-[28px]">
        <div className="flex items-center gap-[28px]">
          <div>
            <span className="block text-base tracking-[0.48px]">Staked</span>
            <span className="block text-base font-medium">{amount} Aztec</span>
          </div>
          <div>
            <span className="block text-base tracking-[0.48px]">Received</span>
            <span className="block text-base font-medium">{shares} stAztec</span>
          </div>
        </div>
      </div>

      <div className="mt-[44px] flex flex-wrap gap-2">
        <Button
          variant="pink"
          size="xl"
          onClick={onStakeMore}
          className="bg-primary text-primary-accent rounded-full px-5 py-3 text-base leading-[1.16] font-medium tracking-[-0.32px]"
        >
          Stake More
          <img src={arrowRightIcon} alt="" className="ml-2.5 inline-block h-3 w-3" />
        </Button>
        <Button
          variant="pink"
          size="xl"
          onClick={onViewExplorer}
          className="bg-card-secondary text-primary-accent rounded-full px-5 py-3 text-base leading-[1.16] font-medium tracking-[-0.32px]"
        >
          View on Explorer
        </Button>
      </div>
    </div>
  );
}
