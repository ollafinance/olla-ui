import { ConnectButton } from "@rainbow-me/rainbowkit";
import ollaLogo from "@/assets/logo/olla-logo-black.svg";

export function Header() {
  return (
    <header className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
      <img src={ollaLogo} alt="Olla" className="h-8" />
      <ConnectButton />
    </header>
  );
}
