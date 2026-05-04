import { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={cn("block text-[13px] font-medium text-[#1A1A18] mb-1.5", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="text-[#DC2626] ml-0.5" aria-hidden="true">*</span>
      )}
    </label>
  );
}
