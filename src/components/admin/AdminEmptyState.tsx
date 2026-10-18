/**
 * @file src/components/admin/AdminEmptyState.tsx
 * @description Standardized, accessible empty state component for administrative modules.
 * 
 * DEVELOPER USAGE NOTE:
 * - Used across all administrative listings (e.g. Inquiries, Applications, Events, Audit Logs)
 *   when a query returns 0 records or when active filters produce an empty set.
 * - Human-crafted UI: strictly zero AI emojis; uses SVG Lucide icons and authentic typography.
 * - Accessible: includes role="status" and clear contrast hierarchy.
 */

"use client";

import React from "react";
import { LucideIcon, FolderSearch } from "lucide-react";
import { Button } from "@/components/ui";

export interface AdminEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function AdminEmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  secondaryActionLabel,
  onSecondaryAction,
  className = "",
}: AdminEmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-10 sm:p-12 text-center rounded-[8px] border border-dashed border-[var(--border-color)] bg-[var(--bg-surface-elevated)]/50 flex flex-col items-center justify-center max-w-xl mx-auto my-6 ${className}`}
    >
      <div className="w-12 h-12 rounded-[8px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>

      <h3 className="text-base font-bold text-[var(--text-primary)]">
        {title}
      </h3>

      <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-sm leading-relaxed">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && (
            actionHref ? (
              <a href={actionHref}>
                <Button size="sm" variant="primary">
                  {actionLabel}
                </Button>
              </a>
            ) : (
              <Button size="sm" variant="primary" onClick={onAction}>
                {actionLabel}
              </Button>
            )
          )}

          {secondaryActionLabel && onSecondaryAction && (
            <Button size="sm" variant="ghost" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
