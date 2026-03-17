import { type ReactNode } from "react";

interface PageLayoutProps {
  leftCard: ReactNode;
  topCards: ReactNode;
  bottomCard: ReactNode;
}

export function PageLayout({ leftCard, topCards, bottomCard }: PageLayoutProps) {
  return (
    <div className="mx-auto flex w-full flex-col items-center justify-center gap-4 px-4 lg:flex-row lg:items-end lg:gap-[12px] lg:px-0">
      <div className="w-full lg:h-[551px] lg:w-[551px]">{leftCard}</div>
      <div className="flex w-full flex-col gap-4 lg:h-[551px] lg:w-[344px] lg:gap-[12px]">
        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:gap-[12px]">{topCards}</div>
        <div className="shrink-0">{bottomCard}</div>
      </div>
    </div>
  );
}
