import { ConnectButton } from "@rainbow-me/rainbowkit";
import ollaLogoWhite from "@/assets/logo/olla-logo-white.svg";

export function Header() {
  return (
    <header className="flex justify-between items-center bg-surface rounded-surface px-9 py-3 border border-surface-border/50">
      <div className="flex items-center">
        <img
          src={ollaLogoWhite}
          alt="Olla"
          className="h-8 w-auto"
        />
      </div>

      <div className="flex items-center">
        <ConnectButton />
      </div>
    </header>
  );
}
