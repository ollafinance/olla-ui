import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom";
  className?: string;
}

export function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  return (
    <div className={cn("group relative inline-flex", className)}>
      {children}
      <div
        className={cn(
          "invisible absolute z-50 max-w-xs min-w-64 rounded-lg bg-black px-3 py-2 text-sm leading-relaxed font-medium text-white opacity-0 transition-opacity duration-200 group-hover:visible group-hover:opacity-100",
          position === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2",
          position === "bottom" && "top-full left-1/2 mt-2 -translate-x-1/2"
        )}
      >
        {content}
        <div
          className={cn(
            "absolute left-1/2 translate-x-[-50%] border-[5px] border-transparent",
            position === "top" && "top-full border-t-black",
            position === "bottom" && "bottom-full border-b-black"
          )}
        />
      </div>
    </div>
  );
}
