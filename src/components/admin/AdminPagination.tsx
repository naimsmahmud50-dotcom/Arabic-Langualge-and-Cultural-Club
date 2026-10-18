/**
 * @file src/components/admin/AdminPagination.tsx
 * @description Accessible pagination controls for administrative data tables and review queues.
 * 
 * DEVELOPER USAGE NOTE:
 * - Pass currentPage, totalPages, totalItems, and pageSize.
 * - Fires onPageChange(pageNumber) when the user clicks or presses Enter on a page button.
 * - Automatically computes visible window of pages with ellipses for large collections.
 * - Meets WCAG AA with aria-current="page", aria-label on navigation buttons, and keyboard accessibility.
 */

"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui";

export interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  className = "",
}: AdminPaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= pageSize)) {
    return null;
  }

  // Calculate item range for summary
  const startItem = totalItems !== undefined ? Math.min((currentPage - 1) * pageSize + 1, totalItems) : null;
  const endItem = totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : null;

  // Generate page numbers with sliding window
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Administrative Data Pagination"
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)] text-xs ${className}`}
    >
      {/* Range Summary */}
      <div className="text-[var(--text-secondary)] font-medium">
        {totalItems !== undefined && startItem !== null && endItem !== null ? (
          <span>
            Showing <strong className="text-[var(--text-primary)] font-semibold">{startItem}</strong> to{" "}
            <strong className="text-[var(--text-primary)] font-semibold">{endItem}</strong> of{" "}
            <strong className="text-[var(--text-primary)] font-semibold">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="text-[var(--text-primary)] font-semibold">{currentPage}</strong> of{" "}
            <strong className="text-[var(--text-primary)] font-semibold">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          aria-label="Go to first page"
          className="p-1.5 rounded-[4px] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className="p-1.5 rounded-[4px] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numbered Pages */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-[var(--text-muted)]">
                  ...
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isActive ? "page" : undefined}
                className={`min-w-8 h-8 px-2 rounded-[4px] font-semibold text-xs transition-colors ${
                  isActive
                    ? "bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] shadow-xs"
                    : "border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className="p-1.5 rounded-[4px] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Go to last page"
          className="p-1.5 rounded-[4px] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
}
