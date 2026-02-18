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
    <div className="bg-card rounded-card p-8 w-full lg:size-card-primary min-h-[551px] lg:min-h-0 flex flex-col">
      <div className="text-[67px] leading-none tracking-[-1.35px] text-black font-medium whitespace-nowrap">
        <p className="mb-0">Transaction</p>
        <p>Submitted...</p>
      </div>

      <div className="mt-[22px]">
        <img
          src={ollaLoading}
          alt="Loading"
          className="h-[59px] w-[128px] animate-pulse"
        />
      </div>

      <div className="mt-[31px] h-px w-full max-w-[487px] bg-primary-line" />

      <div className="flex-1" />
    </div>
  );
}

