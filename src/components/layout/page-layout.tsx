import { type ReactNode } from "react";

interface PageLayoutProps {
  leftCard: ReactNode;
  topCards: ReactNode;
  bottomCard: ReactNode;
}

export function PageLayout({ leftCard, topCards, bottomCard }: PageLayoutProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-[12px] justify-center items-center lg:items-end w-full px-4 lg:px-0 mx-auto">
      <div className="w-full lg:w-[551px] lg:h-[551px]">{leftCard}</div>
      <div className="flex flex-col gap-4 lg:gap-[12px] w-full lg:w-[344px] lg:h-[551px]">
        <div className="flex-1 min-h-0 flex flex-col gap-4 lg:gap-[12px]">
          {topCards}
        </div>
        <div className="shrink-0">{bottomCard}</div>
      </div>
    </div>
  );
}