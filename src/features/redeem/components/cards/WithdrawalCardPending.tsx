import { useEffect } from "react";
import ollaLoading from "@/assets/icons/olla-loading.svg";

interface WithdrawalCardPendingProps {
  onTransition: () => void;
}

export function WithdrawalCardPending({
  onTransition,
}: WithdrawalCardPendingProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onTransition();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onTransition]);

  return (
    <div className="bg-card rounded-card p-8 w-full h-full min-h-[551px] flex flex-col">
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

      <div className="mt-[31px] h-px w-full max-w-[487px] bg-secondary-accent" />

      <div className="flex-1" />
    </div>
  );
}

