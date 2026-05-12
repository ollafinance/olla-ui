import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ className, children, size = "md", ...props }, ref) => {
    const sizes = {
      sm: "h-9 w-9",
      md: "h-10 w-10",
      lg: "h-11 w-11",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-full bg-[#232323] transition-colors duration-200 hover:bg-[#2a2a2a]",
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ActionButton.displayName = "ActionButton";
