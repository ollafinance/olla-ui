import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Link } from "@tanstack/react-router";
import ollaLogo from "@/assets/logo/olla-logo-black.svg";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  return (
    <header className="flex justify-between items-center w-full bg-card rounded-3xl px-6 py-4 shadow-sm border border-border">
      <div className="flex justify-start min-w-[150px]">
        <img
          src={ollaLogo}
          alt="Olla"
          width="82"
          height="32"
          className="h-8 w-auto dark:invert"
        />
      </div>

      <nav className="flex items-center justify-center gap-1 bg-muted/50 dark:bg-muted/30 p-1 rounded-full border border-border/50">
        <Link
          to="/stake"
          className="px-8 py-2 text-sm font-medium rounded-full text-muted-foreground transition-all hover:text-foreground [&.active]:bg-background [&.active]:text-foreground [&.active]:shadow-sm [&.active]:font-semibold [&.active]:text-primary"
        >
          Stake
        </Link>
        <Link
          to="/redeem"
          className="px-8 py-2 text-sm font-medium rounded-full text-muted-foreground transition-all hover:text-foreground [&.active]:bg-background [&.active]:text-foreground [&.active]:shadow-sm [&.active]:font-semibold [&.active]:text-primary"
        >
          Redeem
        </Link>
        <Link
          to="/claim"
          className="px-8 py-2 text-sm font-medium rounded-full text-muted-foreground transition-all hover:text-foreground [&.active]:bg-background [&.active]:text-foreground [&.active]:shadow-sm [&.active]:font-semibold [&.active]:text-primary"
        >
          Claim
        </Link>
      </nav>

      <div className="flex items-center justify-end gap-3 min-w-[150px]">
        <ThemeToggle />
        <ConnectButton />
      </div>
    </header>
  );
}
