import React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, disabled, type, label, helperText, required, id, ...props }, ref) => {
    const inputElement = (
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 text-[var(--text-muted)] pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={id}
          type={type}
          ref={ref}
          disabled={disabled}
          required={required}
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

    if (label || helperText) {
      return (
        <div className="space-y-1.5 w-full">
          {label && (
            <label htmlFor={id} className="block text-xs font-semibold text-[var(--text-primary)]">
              {label} {required && <span className="text-[var(--state-error)] ms-0.5">*</span>}
            </label>
          )}
          {inputElement}
          {helperText && (
            <p className="text-[11px] text-[var(--text-muted)] leading-tight">{helperText}</p>
          )}
        </div>
      );
    }

    return inputElement;
  }
);

Input.displayName = "Input";
