/**
 * @file PageHeader.tsx
 * @description Standardized, high-elegance header banner for all interior public pages.
 * Displays:
 * - Breadcrumbs
 * - Main English title & Arabic calligraphy subtitle
 * - Page scope description
 * - Subtle geometric accent divider
 */

import React from "react";
import { Breadcrumbs, BreadcrumbItem, HeritageDivider, Badge } from "@/components/ui";

export interface PageHeaderProps {
  title: string;
  titleAr?: string;
  description?: string;
  badge?: string;
  breadcrumbs: BreadcrumbItem[];
}

export function PageHeader({
  title,
  titleAr,
  description,
  badge,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="relative py-6 sm:py-8 lg:py-10 border-b border-[var(--border-color)] bg-[var(--bg-surface-elevated)]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-3 sm:mb-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Title & Badge */}
        <div className="space-y-2">
          {badge && <Badge variant="accent" size="sm">{badge}</Badge>}
          
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1.5 sm:gap-2">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
              {title}
            </h1>
            {titleAr && (
              <span className="font-arabic text-lg sm:text-xl md:text-2xl text-[var(--brand-accent-text)] font-semibold leading-relaxed" dir="rtl">
                {titleAr}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs sm:text-sm md:text-base text-[var(--text-secondary)] max-w-3xl leading-relaxed pt-0.5 sm:pt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
