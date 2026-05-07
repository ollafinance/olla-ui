import { useEffect } from "react";
import type { DisclaimerComponent } from "@rainbow-me/rainbowkit";
import { useTermsAcceptance } from "@/hooks/useTermsAcceptance";
import {
  clearTermsGateBlocked,
  useTermsGateBlocked,
} from "@/hooks/useTermsGateBlocked";

const ALLOW_ATTR = "data-olla-terms-allow";
const BLOCKED_EVENT = "olla:terms-gate-blocked";

// While the modal is open and terms are not accepted, swallow clicks on the
// wallet option buttons in the capture phase so RainbowKit/wagmi never see
// them. This is the only gate that survives every connector-instantiation
// path (RB Kit static, EIP-6963/mipd-discovered, on-the-fly factory) since
// it operates at the DOM level before any wallet code runs.
function useWalletClickGuard(accepted: boolean) {
  useEffect(() => {
    if (accepted) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const walletButton = target.closest(
        '[data-testid^="rk-wallet-option-"]',
      );
      if (!walletButton) return;
      if (target.closest(`[${ALLOW_ATTR}]`)) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.dispatchEvent(new Event(BLOCKED_EVENT));
    };

    document.addEventListener("click", handler, true);
    document.addEventListener("pointerdown", handler, true);
    document.addEventListener("mousedown", handler, true);
    return () => {
      document.removeEventListener("click", handler, true);
      document.removeEventListener("pointerdown", handler, true);
      document.removeEventListener("mousedown", handler, true);
    };
  }, [accepted]);
}

export const TermsDisclaimer: DisclaimerComponent = ({ Text }) => {
  const { accepted, accept, reset } = useTermsAcceptance();
  const blocked = useTermsGateBlocked();

  useWalletClickGuard(accepted);

  useEffect(() => {
    if (accepted) clearTermsGateBlocked();
  }, [accepted]);

  const highlight = blocked && !accepted;
  const allowAttr = { [ALLOW_ATTR]: "true" };

  return (
    <Text>
      <div
        {...allowAttr}
        style={{
          padding: highlight ? "8px 10px" : 0,
          borderRadius: 8,
          border: highlight ? "1px solid #d14343" : "1px solid transparent",
          background: highlight ? "rgba(209, 67, 67, 0.08)" : "transparent",
          transition: "background 150ms, border-color 150ms, padding 150ms",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => (e.target.checked ? accept() : reset())}
            style={{
              marginTop: 3,
              width: 14,
              height: 14,
              accentColor: "#ffb0f1",
              cursor: "pointer",
              flexShrink: 0,
            }}
          />
          <span>
            I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline", fontWeight: 500 }}
            >
              Terms of Use
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "underline", fontWeight: 500 }}
            >
              Privacy Notice
            </a>
            .
          </span>
        </label>
        {highlight && (
          <div style={{ marginTop: 6, color: "#d14343", fontWeight: 500 }}>
            Please tick the box above to connect a wallet.
          </div>
        )}
      </div>
    </Text>
  );
};
