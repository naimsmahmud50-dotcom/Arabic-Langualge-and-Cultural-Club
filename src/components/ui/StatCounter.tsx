/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/ui/StatCounter.tsx
 * Module: Design System Shared UI Primitives
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/ui/StatCounter.tsx
 * @description Collegiate Key Metric / Stat Counter with bilingual labels and antique brass accents.
 */

import React from "react";
import { cn } from "@/lib/utils/cn";

export interface StatCounterProps {
  value: number | string;
  labelEn: string;
  labelAr?: string;
  icon?: React.ComponentType<{ className?: string }>;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function StatCounter({
  value,
  labelEn,
  labelAr,
  icon: Icon,
  prefix,
  suffix,
  className,
}: StatCounterProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-color)] hover-lift transition-all flex flex-col justify-between space-y-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        {Icon && (
          <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        {labelAr && (
          <span className="font-arabic text-xs text-[var(--brand-accent)] font-semibold" dir="rtl">
            {labelAr}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-3xl sm:text-4xl font-bold font-mono text-[var(--text-primary)] tracking-tight">
          {prefix && <span className="text-xl sm:text-2xl text-[var(--brand-accent)] me-1">{prefix}</span>}
          {value}
          {suffix && <span className="text-xl sm:text-2xl text-[var(--brand-accent)] ms-1">{suffix}</span>}
        </div>
        <p className="text-xs sm:text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {labelEn}
        </p>
      </div>
    </div>
  );
}
