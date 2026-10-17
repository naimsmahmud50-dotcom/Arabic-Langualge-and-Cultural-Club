import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  actionHref,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-[var(--border-color)] rounded-[8px] bg-[var(--bg-surface-elevated)]/50",
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 rounded-full bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--brand-accent)] mb-4">
        {icon || <FolderOpen className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <h4 className="text-base font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
      {!action && actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="outline" size="sm">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
