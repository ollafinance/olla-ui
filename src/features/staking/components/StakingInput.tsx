import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface StakingInputProps {
  amount: string;
  onAmountChange: (val: string) => void;
  onMaxClick: () => void;
  disabled?: boolean;
}

export function StakingInput({ amount, onAmountChange, onMaxClick, disabled }: StakingInputProps) {
  return (
    <div className="relative">
      <Input
        type="number"
        placeholder="0.0"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        disabled={disabled}
        className="pr-16" // Space for MAX button
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMaxClick}
          disabled={disabled}
          className="text-primary hover:text-primary/80 h-8 text-xs font-semibold"
        >
          MAX
        </Button>
      </div>
    </div>
  );
}
