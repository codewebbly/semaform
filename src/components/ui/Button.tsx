import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-[6px] font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:pointer-events-none select-none",
          variant === "primary" && [
            "bg-[#1A6BFF] text-white",
            "hover:bg-[#1558D6]",
            "focus-visible:ring-[#1A6BFF]",
          ],
          variant === "secondary" && [
            "bg-white text-[#1A1A18] border border-[#E5E4E0]",
            "hover:bg-[#F8F8F7]",
            "focus-visible:ring-[#E5E4E0]",
          ],
          variant === "danger" && [
            "bg-[#DC2626] text-white",
            "hover:bg-[#B91C1C]",
            "focus-visible:ring-[#DC2626]",
          ],
          variant === "ghost" && [
            "bg-transparent text-[#6B6A66]",
            "hover:bg-[#F1F0ED] hover:text-[#1A1A18]",
            "focus-visible:ring-[#E5E4E0]",
          ],
          size === "sm" && "text-xs px-3 py-1.5 h-7",
          size === "md" && "text-sm px-3.5 py-2 h-8",
          size === "lg" && "text-sm px-4 py-2.5 h-10",
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-2 h-3.5 w-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
