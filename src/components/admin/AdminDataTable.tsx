/**
 * @file src/components/admin/AdminDataTable.tsx
 * @description Standardized responsive data table wrapper for administrative CMS views.
 * 
 * DEVELOPER USAGE NOTE:
 * - Provides accessible tabular layout with responsive horizontal overflow containment.
 * - Handles loading state, empty state integration via AdminEmptyState, and row hover interactions.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 * - Meets WCAG AA standards with proper <table>, <thead>, <tbody> semantics and responsive layout.
 */

"use client";

import React from "react";
import { AdminEmptyState } from "./AdminEmptyState";
import { LoadingSpinner } from "@/components/ui";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface AdminDataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function AdminDataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There are currently no records matching your selected query or filters.",
  emptyActionLabel,
  onEmptyAction,
  className = "",
  onRowClick,
}: AdminDataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px]">
        <LoadingSpinner size="md" />
        <span className="text-xs text-[var(--text-secondary)]">Loading administrative data...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <AdminEmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className={`overflow-hidden rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] font-semibold">
              {columns.map((col) => {
                const alignClass =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                    ? "text-right"
                    : "text-left";
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3.5 tracking-wider uppercase text-[10px] ${alignClass} ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {data.map((row, idx) => {
              const rowKey = keyExtractor(row, idx);
              const isClickable = Boolean(onRowClick);
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${
                    isClickable
                      ? "cursor-pointer hover:bg-[var(--bg-surface-hover)]"
                      : "hover:bg-[var(--bg-surface-hover)]/40"
                  }`}
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                        ? "text-right"
                        : "text-left";
                    return (
                      <td
                        key={`${rowKey}-${col.key}`}
                        className={`px-4 py-3 text-[var(--text-primary)] align-middle ${alignClass} ${col.className || ""}`}
                      >
                        {col.render ? col.render(row, idx) : (row as any)[col.key]}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
