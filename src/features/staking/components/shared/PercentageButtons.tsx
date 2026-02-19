import { cn } from "@/lib/utils";
import { PERCENTAGE_OPTIONS } from "../../constants";

interface PercentageButtonsProps {
  selectedPercentage?: number;
  onSelect: (percentage: number) => void;
  disabled?: boolean;
  className?: string;
}

export function PercentageButtons({
  selectedPercentage,
  onSelect,
  disabled = false,
  className,
}: PercentageButtonsProps) {
  return (
    <div className={cn("gap-5px flex items-center", className)}>
      {PERCENTAGE_OPTIONS.map((option) => {
        const isSelected = selectedPercentage === option.value;
        return (
          <button
            key={option.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option.value)}
            className={cn(
              "flex items-center justify-center rounded-full px-3 py-3 text-xs leading-[1.16] font-medium transition-colors duration-200",
              isSelected
                ? "bg-primary text-primary-accent"
                : "bg-primary-muted text-primary-accent hover:bg-primary/30",
              disabled && "pointer-events-none opacity-50"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
