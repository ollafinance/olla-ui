import { Button } from "@/components/ui/Button";
import arrowRightIcon from "@/assets/icons/arrow-right.svg";

interface TransactionErrorCardProps {
  errorMessage?: string;
  onReturn: () => void;
}

export function TransactionErrorCard({
  errorMessage = "Transaction failed",
  onReturn,
}: TransactionErrorCardProps) {
  return (
    <div className="bg-destructive-muted rounded-card flex h-full min-h-[551px] w-full flex-col gap-2 p-8">
      <div className="text-destructive-dark text-4xl leading-none font-medium tracking-[-1.35px] whitespace-nowrap sm:text-5xl md:text-[60px] lg:text-[50px]">
        <p className="mb-0">Transaction</p>
        <p>Failed</p>
      </div>

      <div className="bg-destructive-accent mt-[36px] h-px w-full max-w-[487px]" />

      <p className="text-destructive-dark mt-[50px] text-2xl leading-[1.5] font-medium tracking-[-0.26px]">
        {errorMessage}
      </p>
      <div className="flex-1" />

      <Button
        onClick={onReturn}
        className="bg-destructive-accent w-30 rounded-full px-5 py-3 text-base leading-[1.16] font-medium tracking-[-0.32px] text-black"
      >
        Return
        <img src={arrowRightIcon} alt="" className="ml-2.5 inline-block h-[13px] w-[11px]" />
      </Button>
    </div>
  );
}
