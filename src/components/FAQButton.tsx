import { ActionButton } from "@/components/ui/ActionButton";

interface FAQButtonProps {
  onClick: () => void;
}

export function FAQButton({ onClick }: FAQButtonProps) {
  return (
    <ActionButton
      onClick={onClick}
      aria-label="Open FAQ"
      size="lg"
    >
      <span className="text-white text-lg font-medium leading-none">?</span>
    </ActionButton>
  );
}
