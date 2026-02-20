import ollaLoading from "@/assets/icons/olla-loading.svg";

interface StakingCardPendingProps {
  state: "signing" | "pending" | "confirming";
  hash?: `0x${string}`;
}

export function StakingCardPending({ state }: StakingCardPendingProps) {
  const titles: Record<"signing" | "pending" | "confirming", [string, string]> = {
    signing: ["Sign", "Transaction..."],
    pending: ["Transaction", "Submitted..."],
    confirming: ["Transaction", "Confirming..."],
  };

  const [line1, line2] = titles[state];

  return (
    <div className="bg-card rounded-card flex h-full min-h-[551px] w-full flex-col p-8">
      <div className="text-[67px] leading-none font-medium tracking-[-1.35px] whitespace-nowrap text-black">
        <p className="mb-0">{line1}</p>
        <p>{line2}</p>
      </div>

      <div className="mt-[22px]">
        <img src={ollaLoading} alt="Loading" className="h-[59px] w-[128px] animate-pulse" />
      </div>

      <div className="bg-primary-line mt-[31px] h-px w-full max-w-[487px]" />

      <div className="flex-1" />
    </div>
  );
}
