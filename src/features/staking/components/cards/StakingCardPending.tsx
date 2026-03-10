import { OllaLoadingAnimation } from "@/components/ui/OllaLoadingAnimation";

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

      <div className="mt-[70px] self-start">
        <OllaLoadingAnimation loop={true} />
      </div>

      <div className="bg-primary-line mt-[8px] h-[2px] w-full max-w-[487px]" />

      <div className="flex-1" />
    </div>
  );
}
