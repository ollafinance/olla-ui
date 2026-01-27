import { ConnectButton } from "@rainbow-me/rainbowkit";
import ollaLogo from "@/assets/logo/olla-logo-black.svg";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  return (
    <header className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-zinc-800 pb-4">
      <img src={ollaLogo} alt="Olla" className="h-8 dark:invert" />
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <ConnectButton />
      </div>
    </header>
  );
}
