import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "primary" | "accent" | "success" | "warning" | "destructive" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    neutral: "bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] border border-[var(--border-color)]",
    primary: "bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] font-medium",
    accent: "bg-[var(--brand-accent)] text-white font-medium shadow-xs",
    success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/20",
    destructive: "bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-500/20",
    outline: "border border-[var(--border-color)] text-[var(--text-secondary)]",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 rounded-[4px] gap-1",
    md: "text-xs px-2.5 py-1 rounded-[5px] gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium tracking-tight select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
