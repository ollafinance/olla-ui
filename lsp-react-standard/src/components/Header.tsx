import { ConnectKitButton } from "connectkit";

export function Header() {
  return (
    <header className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Olla Dashboard</h1>
      <ConnectKitButton />
    </header>
  );
}
