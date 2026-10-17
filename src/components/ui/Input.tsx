import React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, type, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 text-[var(--text-muted)] pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full rounded-[6px] px-3.5 py-2 text-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border transition-colors duration-150 placeholder:text-[var(--text-muted)] disabled:opacity-50 disabled:bg-[var(--bg-surface-hover)] disabled:cursor-not-allowed",
            error
              ? "border-[var(--state-error)] focus-visible:outline-[var(--state-error)]"
              : "border-[var(--border-color)] hover:border-[var(--brand-accent)] focus-visible:outline-[var(--brand-accent)]",
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-[var(--text-muted)] pointer-events-none flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
