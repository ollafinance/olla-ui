import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import spinnerIcon from "@/assets/icons/spinner.svg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-6 text-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span
            className="animate-spin motion-reduce:animate-none -ml-1 mr-2 h-4 w-4 bg-current inline-block"
            style={{
              maskImage: `url(${spinnerIcon})`,
              maskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskImage: `url(${spinnerIcon})`,
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
            }}
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
