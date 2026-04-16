import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "@tanstack/react-router";
import ollaLogoWhite from "@/assets/logo/olla-logo-white.svg";

export function Header() {
  return (
    <header className="bg-surface rounded-surface border-surface-border/50 flex items-center justify-between border px-9 py-3">
      <div className="flex items-center">
        <Link to="/stake" aria-label="Go to stake">
          <img src={ollaLogoWhite} alt="Olla" className="h-8 w-auto" />
        </Link>
      </div>

      <div className="flex items-center">
        <ConnectButton />
      </div>
    </header>
  );
}
