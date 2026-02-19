import { useEffect } from "react";
import ollaLoading from "@/assets/icons/olla-loading.svg";

interface StakingCardPendingProps {
  onTransition: () => void;
}

export function StakingCardPending({ onTransition }: StakingCardPendingProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTransition();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onTransition]);

  return (
    <div className="bg-card rounded-card flex h-full min-h-[551px] w-full flex-col p-8">
      <div className="text-[67px] leading-none font-medium tracking-[-1.35px] whitespace-nowrap text-black">
        <p className="mb-0">Transaction</p>
        <p>Submitted...</p>
      </div>

      <div className="mt-[22px]">
        <img src={ollaLoading} alt="Loading" className="h-[59px] w-[128px] animate-pulse" />
      </div>

      <div className="bg-primary-line mt-[31px] h-px w-full max-w-[487px]" />

      <div className="flex-1" />
    </div>
  );
}
