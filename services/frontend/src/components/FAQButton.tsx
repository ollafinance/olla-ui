import { ActionButton } from "@/components/ui/ActionButton";

interface FAQButtonProps {
  onClick: () => void;
}

export function FAQButton({ onClick }: FAQButtonProps) {
  return (
    <ActionButton onClick={onClick} aria-label="Open FAQ" size="lg">
      <span className="text-lg leading-none font-medium text-white">?</span>
    </ActionButton>
  );
}
