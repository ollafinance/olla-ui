import { OllaLoadingAnimation } from "@/components/ui/OllaLoadingAnimation";

interface WithdrawalCardPendingProps {
  state: "signing" | "pending" | "confirming";
}

export function WithdrawalCardPending({ state }: WithdrawalCardPendingProps) {
  const content = {
    signing: (
      <>
        <p className="mb-0">Sign</p>
        <p>Transaction...</p>
      </>
    ),
    pending: (
      <>
        <p className="mb-0">Transaction</p>
        <p>Submitted...</p>
      </>
    ),
    confirming: (
      <>
        <p className="mb-0">Transaction</p>
        <p>Confirming...</p>
      </>
    ),
  }[state];

  return (
    <div className="bg-card rounded-card flex h-full min-h-[551px] w-full flex-col p-8">
      <div className="text-text-display text-[67.43px] leading-none font-medium tracking-[-1.35px] whitespace-nowrap">
        {content}
      </div>

      <div className="mt-[10px] self-start">
        <OllaLoadingAnimation loop={true} />
      </div>

      <div className="bg-primary-line mt-[8px] h-[2px] w-full max-w-[487px]" />

      <div className="flex-1" />
    </div>
  );
}
