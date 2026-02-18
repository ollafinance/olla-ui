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
    <div className="bg-destructive-muted rounded-card p-8 w-full h-full min-h-[551px] flex flex-col gap-2">
      <div className="text-[67px] leading-none tracking-[-1.35px] text-destructive-dark font-medium whitespace-nowrap">
        <p className="mb-0">Transaction</p>
        <p>Failed</p>
      </div>

      <div className="mt-[36px] h-px w-full max-w-[487px] bg-destructive-accent" />

      <p className="mt-[50px] text-destructive-dark text-2xl font-medium leading-[1.5] tracking-[-0.26px]">
        {errorMessage}
      </p>
      <div className="flex-1" />

      <Button
        onClick={onReturn}
        className="bg-destructive-accent w-auto px-5 py-3 text-base text-black leading-[1.16] tracking-[-0.32px] font-medium rounded-full"
      >
        Return
        <img
          src={arrowRightIcon}
          alt=""
          className="h-[13px] w-[11px] ml-2.5 inline-block"
        />
      </Button>
    </div>
  );
}