import ollaLoading from "@/assets/icons/olla-loading.svg";

interface WithdrawalCardPendingProps {
  state: "signing" | "pending" | "confirming";
}

export function WithdrawalCardPending({ state }: WithdrawalCardPendingProps) {
  const title = {
    signing: "Signing...",
    pending: "Transaction",
    confirming: "Confirming",
  }[state];

  const subtitle = {
    signing: "Please sign in your wallet",
    pending: "Submitted...",
    confirming: "Awaiting confirmation...",
  }[state];

  return (
    <div className="bg-card rounded-card flex h-full min-h-[551px] w-full flex-col p-8">
      <div className="text-[67px] leading-none font-medium tracking-[-1.35px] whitespace-nowrap text-black">
        <p className="mb-0">{title}</p>
        <p>{subtitle}</p>
      </div>

      <div className="mt-[22px]">
        <img src={ollaLoading} alt="Loading" className="h-[59px] w-[128px] animate-pulse" />
      </div>

      <div className="bg-secondary-accent mt-[31px] h-px w-full max-w-[487px]" />

      <div className="flex-1" />
    </div>
  );
}
