/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/ui/Timeline.tsx
 * Module: Design System Shared UI Primitives
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/ui/Timeline.tsx
 * @description Accessible, structured archival timeline for historical chronicles and institutional milestones.
 */

import React from "react";
import { cn } from "@/lib/utils/cn";
import { Badge } from "./Badge";
import { Calendar, ChevronRight } from "lucide-react";

export interface TimelineItem {
  id: string;
  year: string | number;
  date?: string;
  titleEn: string;
  titleAr?: string;
  descriptionEn?: string;
  category?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative border-s-2 border-[var(--brand-accent)]/30 ms-4 sm:ms-8 space-y-10 my-6", className)}>
      {items.map((item, idx) => {
        const Icon = item.icon || Calendar;

        return (
          <div key={item.id || idx} className="relative ps-6 sm:ps-8 group">
            {/* Timeline Rosette Marker */}
            <div className="absolute -start-[17px] top-1.5 w-8 h-8 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--brand-accent)] flex items-center justify-center text-[var(--brand-accent)] shadow-xs group-hover:scale-110 transition-transform">
              <Icon className="w-3.5 h-3.5" />
            </div>

            {/* Content Dossier Card */}
            <div className="p-6 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-color)] hover-lift transition-all space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="sm" className="font-mono font-bold">
                    {item.year}
                  </Badge>
                  {item.category && (
                    <Badge variant="neutral" size="sm" className="uppercase text-[10px]">
                      {item.category}
                    </Badge>
                  )}
                </div>

                {item.date && (
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {item.date}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors leading-snug">
                  {item.titleEn}
                </h3>
                {item.titleAr && (
                  <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                    {item.titleAr}
                  </p>
                )}
              </div>

              {item.descriptionEn && (
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.descriptionEn}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
