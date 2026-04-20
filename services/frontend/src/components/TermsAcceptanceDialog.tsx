import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

interface TermsAcceptanceDialogProps {
  onClose: () => void;
  onAccept: () => void;
}

export function TermsAcceptanceDialog({ onClose, onAccept }: TermsAcceptanceDialogProps) {
  const [checked, setChecked] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handleContinue = () => {
    if (!checked) return;
    onAccept();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-dialog-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
    >
      <div
        ref={modalRef}
        className="bg-card text-card-foreground w-full max-w-md rounded-2xl p-6 shadow-xl md:p-8"
      >
        <h2
          id="terms-dialog-title"
          className="text-card-foreground text-lg font-semibold md:text-xl"
        >
          Accept Terms & Privacy Notice
        </h2>
        <p className="text-card-foreground/75 mt-3 text-sm leading-relaxed">
          Before connecting your wallet, please confirm you have read and agree to the following.
        </p>

        <label className="mt-6 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="border-card-foreground/40 text-card-foreground focus:ring-card-foreground/30 mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border bg-transparent accent-[#ffb0f1] focus:ring-2 focus:outline-none"
          />
          <span className="text-card-foreground/90 text-sm leading-relaxed">
            I have read and agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noreferrer"
              className="text-card-foreground font-medium underline underline-offset-2"
            >
              Terms of Use
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-card-foreground font-medium underline underline-offset-2"
            >
              Privacy Notice
            </a>
            .
          </span>
        </label>

        <div className="mt-8 flex items-center justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleContinue}
            disabled={!checked}
          >
            Connect wallet
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
