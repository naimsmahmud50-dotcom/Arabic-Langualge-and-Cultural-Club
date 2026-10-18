/**
 * @file src/components/admin/AdminFilterBar.tsx
 * @description Standardized search and status filtering toolbar for administrative CMS modules.
 * 
 * DEVELOPER USAGE NOTE:
 * - Used across administrative index pages (e.g. Inquiries, Membership Applications, Events, News).
 * - Coordinates status filter tabs, instant search text input with clear button, and optional category select.
 * - Displays active item count summary.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React from "react";
import { Search, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui";

export interface StatusTabOption {
  id: string;
  label: string;
  count?: number;
  badgeVariant?: "primary" | "secondary" | "accent" | "neutral" | "outline";
}

export interface DropdownFilterOption {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  currentValue: string;
  onChange: (value: string) => void;
}

export interface AdminFilterBarProps {
  statusTabs?: StatusTabOption[];
  activeStatusTab?: string;
  onStatusTabChange?: (statusId: string) => void;
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  dropdownFilters?: DropdownFilterOption[];
  resultCount?: number;
  totalCount?: number;
  className?: string;
}

export function AdminFilterBar({
  statusTabs,
  activeStatusTab,
  onStatusTabChange,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search by keyword, title, or reference...",
  dropdownFilters,
  resultCount,
  totalCount,
  className = "",
}: AdminFilterBarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Row: Status Tabs & Results Count */}
      {statusTabs && statusTabs.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-2">
          {/* Status Tabs Navigation */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Status Filters">
            {statusTabs.map((tab) => {
              const isActive = activeStatusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onStatusTabChange?.(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-[5px] text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Result Count Indicator */}
          {resultCount !== undefined && (
            <div className="text-xs text-[var(--text-secondary)]">
              Showing <span className="font-semibold text-[var(--text-primary)]">{resultCount}</span>
              {totalCount !== undefined && totalCount !== resultCount && (
                <span> of {totalCount} total</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Search Box & Dropdown Select Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-9 py-2 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] focus:border-transparent transition-all"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-[4px] hover:bg-[var(--bg-surface-hover)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Dropdown Filters */}
        {dropdownFilters && dropdownFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {dropdownFilters.map((filter) => (
              <div key={filter.id} className="relative flex items-center">
                <select
                  value={filter.currentValue}
                  onChange={(e) => filter.onChange(e.target.value)}
                  aria-label={filter.label}
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] transition-all cursor-pointer"
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
