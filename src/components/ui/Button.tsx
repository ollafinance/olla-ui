import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import spinnerIcon from "@/assets/icons/spinner.svg";
import arrowRightIcon from "@/assets/icons/arrow-right.svg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "pink" | "cyan" | "muted" | "surface";
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  showArrow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, showArrow = false, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full",
      outline: "border border-border bg-transparent hover:bg-muted/10 text-foreground rounded-full",
      ghost: "bg-transparent hover:bg-muted/20 text-foreground rounded-full",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full",
      pink: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full",
      cyan: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full",
      muted: "bg-muted text-muted-foreground hover:bg-muted/80 rounded-full",
      surface: "bg-surface text-surface-foreground hover:bg-surface/90 rounded-surface",
    };

    const sizes = {
      sm: "h-8 px-4 py-2 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-6 py-3 text-base",
      xl: "h-[51px] px-6 py-[15px] text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span
            className="animate-spin motion-reduce:animate-none -ml-1 mr-1 h-4 w-4 inline-block"
            style={{
              backgroundColor: "currentColor",
              maskImage: `url(${spinnerIcon})`,
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskImage: `url(${spinnerIcon})`,
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
            }}
          />
        )}
        {children}
        {showArrow && !isLoading && (
          <img src={arrowRightIcon} alt="" className="h-[13px] w-[11px]" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
