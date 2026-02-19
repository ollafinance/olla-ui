import { type ReactNode } from "react";
import { Header } from "./Header";
import { NavBar } from "./nav-bar";
import { Footer } from "./Footer";

interface LayoutShellProps {
  children: ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col items-center transition-colors duration-300">
      <div className="flex w-full flex-1 flex-col items-center p-4">
        <div className="mt-4 mb-6 w-full max-w-4xl">
          <Header />
        </div>
        <div className="mt-4 mb-6 w-full max-w-fit">
          <NavBar />
        </div>
        <div className="w-full max-w-4xl flex-1 items-center justify-center">
          <main>{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
