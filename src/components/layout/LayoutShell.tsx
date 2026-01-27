import { type ReactNode } from "react";
import { Header } from "./Header";

interface LayoutShellProps {
  children: ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl">
        <div className="bg-card text-card-foreground rounded-2xl shadow-xl w-full border border-border overflow-hidden min-h-[600px] flex flex-col transition-colors duration-300">
          <div className="p-6 border-b border-border">
            <Header />
          </div>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
