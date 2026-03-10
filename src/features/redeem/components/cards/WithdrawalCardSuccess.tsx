import { Button } from "@/components/ui/Button";
import ollaLoading from "@/assets/icons/olla-loading.svg";
import arrowRightIcon from "@/assets/icons/arrow-right.svg";

interface WithdrawalCardSuccessProps {
  amount: string;
  isInstantMode: boolean;
  hash: `0x${string}` | undefined;
  onWithdrawMore: () => void;
}

export function WithdrawalCardSuccess({
  amount,
  isInstantMode,
  hash,
  onWithdrawMore,
}: WithdrawalCardSuccessProps) {
  const explorerUrl = hash
    ? `https://explorer.example.com/tx/${hash}` // TODO: Use correct explorer URL
    : undefined;

  const title = isInstantMode ? "Instant Withdrawal" : "Withdraw Request";
  const subtitle = isInstantMode ? "Completed!" : "Created!";
  const message = isInstantMode
    ? "Your Aztec tokens are now available in your wallet."
    : "You can see the status on the right claim section.";

  return (
    <div className="bg-card rounded-card flex h-full min-h-[551px] w-full flex-col p-8">
      <div className="text-[60px] leading-none font-medium tracking-[-1.35px] whitespace-nowrap text-black">
        <p className="mb-0">{title}</p>
        <p>{subtitle}</p>
      </div>

      <div className="mt-[22px] flex gap-4 text-black">
        <div className="flex flex-col">
          <span className="text-muted-foreground text-sm">Amount</span>
          <span className="text-lg font-medium">{amount} stAztec</span>
        </div>
      </div>

      <p className="text-muted-foreground mt-4 text-sm">{message}</p>

      <div className="mt-[10px]">
        <img src={ollaLoading} alt="Success" className="h-[72px] w-[160px]" />
      </div>

      <div className="bg-secondary-accent mt-[8px] h-px w-full max-w-[487px]" />

      <div className="flex-1" />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="cyan"
          size="xl"
          onClick={onWithdrawMore}
          className="bg-secondary rounded-full px-5 py-3 text-base leading-[1.16] font-medium tracking-[-0.32px] text-black"
        >
          Another Request
          <img src={arrowRightIcon} alt="" className="ml-2.5 inline-block h-3 w-3" />
        </Button>
        {explorerUrl && (
          <Button
            variant="cyan"
            size="xl"
            onClick={() => window.open(explorerUrl, "_blank")}
            className="bg-card-secondary rounded-full px-5 py-3 text-base leading-[1.16] font-medium tracking-[-0.32px] text-black"
          >
            View on Explorer
          </Button>
        )}
      </div>
    </div>
  );
}
