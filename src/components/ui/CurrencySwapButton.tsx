import { useCurrencySwap } from "@/hooks/useCurrencySwap";
import arrowUpDownIcon from "@/assets/icons/arrow-up-down.svg";
import { cn } from "@/lib/utils";

interface CurrencySwapButtonProps {
  className?: string;
}

export function CurrencySwapButton({ className }: CurrencySwapButtonProps) {
  const { toggle } = useCurrencySwap();

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn("cursor-pointer transition-opacity hover:opacity-70", className)}
    >
      <img src={arrowUpDownIcon} alt="Swap currency" className="h-[11px] w-[14px]" />
    </button>
  );
}
