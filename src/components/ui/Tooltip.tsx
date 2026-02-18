import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom";
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  return (
    <div className={cn("relative inline-flex group", className)}>
      {children}
      <div
        className={cn(
          "absolute z-50 px-3 py-2 text-sm leading-relaxed font-medium text-white bg-black rounded-lg min-w-64 max-w-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200",
          position === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
          position === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
        )}
      >
        {content}
        <div
          className={cn(
            "absolute left-1/2 translate-x-[-50%] border-[5px] border-transparent",
            position === "top" && "top-full border-t-black",
            position === "bottom" && "bottom-full border-b-black",
          )}
        />
      </div>
    </div>
  );
}

