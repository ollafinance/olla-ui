import { OllaLoadingAnimation } from "@/components/ui/OllaLoadingAnimation";

interface TransactionPendingCardProps {
  state: "signing" | "pending" | "confirming";
  variant: "staking" | "withdrawal";
  hash?: `0x${string}`;
}

export function TransactionPendingCard({ state, variant }: TransactionPendingCardProps) {
  const titles: Record<"signing" | "pending" | "confirming", [string, string]> = {
    signing: ["Sign", "Transaction..."],
    pending: ["Transaction", "Submitted..."],
    confirming: ["Transaction", "Confirming..."],
  };

  const [line1, line2] = titles[state];

  const typographyClasses =
    variant === "staking"
      ? "text-4xl sm:text-5xl md:text-[60px] lg:text-[50px] text-black"
      : "text-4xl sm:text-5xl md:text-[60px] lg:text-[50px] text-text-display";

  return (
    <div className="bg-card rounded-card flex h-full min-h-[551px] w-full flex-col p-8">
      <div
        className={`${typographyClasses} leading-none font-medium tracking-[-1.35px] whitespace-nowrap`}
      >
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
