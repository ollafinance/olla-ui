import { type ReactNode } from "react";
import { Header } from "./Header";

interface LayoutShellProps {
  children: ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl mb-6 mt-4">
        <Header />
      </div>
      <div className="w-full max-w-xl ">
        <div className="bg-card text-card-foreground rounded-3xl shadow-xl w-full border border-border overflow-hidden min-h-[500px] flex flex-col transition-colors duration-300">
          <main className="flex-1 p-6 sm:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
