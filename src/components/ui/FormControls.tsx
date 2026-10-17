import React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full rounded-[6px] px-3.5 py-2.5 text-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border transition-colors duration-150 placeholder:text-[var(--text-muted)] disabled:opacity-50 disabled:bg-[var(--bg-surface-hover)] disabled:cursor-not-allowed min-h-[100px] resize-y",
          error
            ? "border-[var(--state-error)] focus-visible:outline-[var(--state-error)]"
            : "border-[var(--border-color)] hover:border-[var(--brand-accent)] focus-visible:outline-[var(--brand-accent)]",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, disabled, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full rounded-[6px] px-3.5 py-2 text-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border transition-colors duration-150 disabled:opacity-50 disabled:bg-[var(--bg-surface-hover)] disabled:cursor-not-allowed cursor-pointer",
          error
            ? "border-[var(--state-error)] focus-visible:outline-[var(--state-error)]"
            : "border-[var(--border-color)] hover:border-[var(--brand-accent)] focus-visible:outline-[var(--brand-accent)]",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = "Select";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ className, required, children, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-[var(--state-error)] ms-1">*</span>}
    </label>
  );
}
