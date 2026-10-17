import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "accent";
  hoverElevate?: boolean;
}

export function Card({ className, variant = "default", hoverElevate, children, ...props }: CardProps) {
  const variantStyles = {
    default: "bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[var(--shadow-card)]",
    elevated: "bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-elevated)]",
    accent: "bg-[var(--bg-surface)] border-2 border-[var(--brand-accent)] shadow-[var(--shadow-card)]",
  };

  return (
    <div
      className={cn(
        "rounded-[8px] transition-colors duration-150 overflow-hidden",
        variantStyles[variant],
        hoverElevate && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)] transition-all duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pb-3 flex flex-col gap-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-[var(--text-primary)] leading-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-[var(--text-secondary)] leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6 pt-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-6 pt-0 flex items-center justify-between border-t border-[var(--border-subtle)] mt-2 pt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
