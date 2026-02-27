import { type ReactNode } from "react";
import { Header } from "./Header";
import { NavBar } from "./nav-bar";
import { Footer } from "./Footer";
import { Background } from "./Background";
import { ActionButtons } from "./ActionButtons";

interface LayoutShellProps {
  children: ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col items-center transition-colors duration-300">
      <Background />
      <div className="flex w-full flex-1 flex-col items-center p-4">
        <div className="z-10 mt-4 mb-6 w-full max-w-4xl">
          <Header />
        </div>

        {/* Desktop: NavBar centered, ActionButtons fixed on right */}
        {/* Mobile: NavBar and ActionButtons in a row */}
        <div className="z-10 mt-4 mb-6 w-full max-w-4xl">
          <div className="flex flex-row items-center justify-center gap-4 md:flex-row">
            <NavBar />
            {/* Mobile only - ActionButtons inline with NavBar */}
            <div className="md:hidden">
              <ActionButtons />
            </div>
          </div>
        </div>

        {/* Desktop only - ActionButtons fixed position rendered here */}
        <div className="hidden md:block">
          <ActionButtons />
        </div>

        <div className="z-10 w-full max-w-4xl flex-1 items-center justify-center">
          <main>{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
