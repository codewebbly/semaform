import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            "block w-full rounded-[6px] border px-3 py-2 text-sm h-9",
            "bg-white text-[#1A1A18] placeholder:text-[#9B9A96]",
            "transition-colors",
            "focus:outline-none focus:ring-2 focus:border-[#1A6BFF]",
            error
              ? "border-[#DC2626] focus:ring-[#DC2626]/20 focus:border-[#DC2626]"
              : "border-[#E5E4E0] focus:ring-[#1A6BFF]/20",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-[#DC2626]">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
