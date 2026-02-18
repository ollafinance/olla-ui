import { type ReactNode } from "react";
import { Header } from "./Header";
import { NavBar } from "./nav-bar";
import { Footer } from "./Footer";

interface LayoutShellProps {
  children: ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl mb-6 mt-4">
        <Header />
      </div>
      <div className="w-full max-w-fit mb-6 mt-4">
        <NavBar />
      </div>
      <div className="w-full max-w-4xl flex-1 justify-center items-center">
        <main>{children}</main>
      </div>
      <Footer />
    </div>
  );
}
