import React from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label, className, ...props }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  };

  return (
    <div
      role="status"
      className={cn("flex flex-col items-center justify-center gap-2.5 text-[var(--brand-primary)]", className)}
      {...props}
    >
      <Loader2 className={cn("animate-spin", sizeStyles[size])} />
      {label && <span className="text-xs text-[var(--text-secondary)] font-medium tracking-wide">{label}</span>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export function Skeleton({ variant = "rectangular", className, ...props }: SkeletonProps) {
  const variantStyles = {
    text: "rounded-[4px]",
    circular: "rounded-full",
    rectangular: "rounded-[6px]",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--border-subtle)]/70",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
