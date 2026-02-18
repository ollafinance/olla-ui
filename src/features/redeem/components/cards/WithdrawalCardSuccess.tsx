import { Button } from "@/components/ui/Button";
import ollaLoading from "@/assets/icons/olla-loading.svg";
import arrowRightIcon from "@/assets/icons/arrow-right.svg";

interface WithdrawalCardSuccessProps {
  amount: string;
  onWithdrawMore: () => void;
  onViewExplorer: () => void;
}

export function WithdrawalCardSuccess({
  amount,
  onWithdrawMore,
  onViewExplorer,
}: WithdrawalCardSuccessProps) {
  return (
    <div className="bg-card rounded-card p-8 w-full h-full min-h-[551px] flex flex-col">
      <div className="text-[60px] leading-none tracking-[-1.35px] text-black font-medium whitespace-nowrap">
        <p className="mb-0">Withdraw Request</p>
        <p>Created!</p>
      </div>

      <div className="mt-[22px] flex gap-4 text-black">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="text-lg font-medium">{amount} stAztec</span>
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        You can see the status on the right claim section.
      </p>

      <div className="mt-[22px]">
        <img src={ollaLoading} alt="Success" className="h-[59px] w-[128px]" />
      </div>

      <div className="mt-[31px] h-px w-full max-w-[487px] bg-secondary-accent" />

      <div className="flex-1" />

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="cyan"
          size="xl"
          onClick={onWithdrawMore}
          className="bg-secondary px-5 py-3 text-base text-black leading-[1.16] tracking-[-0.32px] font-medium rounded-full"
        >
          Another Request
          <img
            src={arrowRightIcon}
            alt=""
            className="h-3 w-3 ml-2.5 inline-block"
          />
        </Button>
        <Button
          variant="cyan"
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
