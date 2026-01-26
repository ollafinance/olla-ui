import { type ReactNode } from "react";
import { Header } from "./Header";

interface LayoutShellProps {
  children: ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl w-full border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <Header />
          </div>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
