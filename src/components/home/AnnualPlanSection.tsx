/**
 * @file src/components/home/AnnualPlanSection.tsx
 * @description 12-Month Annual Operational Plan & Milestone Highlights.
 * 
 * ARCHITECTURAL ROLE:
 * - Highlights the approved annual academic roadmap for the club.
 * - Queries `getPublicAnnualPlans()`.
 * - Meets Requirement SPEC-HOM-06 and SPEC-PLN-01.
 * 
 * CONSTRAINTS:
 * - Structured chronological representation (Month 1 through Month 12).
 * - Displays authentic status badges (Completed, Confirmed, Planned).
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { CalendarDays, CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";

interface AnnualPlanItem {
  id: string;
  academicYear: string;
  monthNumber: number;
  activityTitleEn: string;
  activityTitleAr?: string | null;
  category: string;
  status: string;
  notes?: string | null;
}

interface AnnualPlanSectionProps {
  plans: AnnualPlanItem[];
}

export function AnnualPlanSection({ plans }: AnnualPlanSectionProps) {
  const monthNames = [
    "Month 1 (Sep)",
    "Month 2 (Oct)",
    "Month 3 (Nov)",
    "Month 4 (Dec)",
    "Month 5 (Jan)",
    "Month 6 (Feb)",
    "Month 7 (Mar)",
    "Month 8 (Apr)",
    "Month 9 (May)",
    "Month 10 (Jun)",
    "Month 11 (Jul)",
    "Month 12 (Aug)",
  ];

  const statusVariantMap: Record<string, "success" | "neutral" | "warning" | "accent" | "outline"> = {
    completed: "success",
    confirmed: "accent",
    planned: "neutral",
    postponed: "warning",
  };

  return (
    <section className="py-20 bg-[var(--bg-primary)] border-b border-[var(--border-color)]" aria-label="Annual Operational Plan">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="accent" size="sm">Annual Roadmap</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif">
              12-Month Academic & Operational Plan
            </h2>
            <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
              الْخُطَّةُ التَّشْغِيلِيَّةُ السَّنَوِيَّةُ • بَرَامِجُ الْعَامِ الْأَكَادِيمِيِّ الْمُعْتَمَدَةُ
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Every academic year follows a structured pedagogical curriculum balancing grammar circles, oratory competitions, calligraphy masterclasses, and publication releases.
            </p>
          </div>
          <Link href="/events">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Download Full 12-Month Schedule
            </Button>
          </Link>
        </div>

        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.slice(0, 6).map((plan) => {
              const monthLabel = monthNames[plan.monthNumber - 1] || `Month ${plan.monthNumber}`;
              const badgeVariant = statusVariantMap[plan.status] || "neutral";

              return (
                <Card key={plan.id} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)]">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--brand-accent)] font-mono uppercase tracking-wider">
                        {monthLabel}
                      </span>
                      <Badge variant={badgeVariant} size="sm">
                        {plan.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[var(--text-primary)]">
                        {plan.activityTitleEn}
                      </h3>
                      {plan.activityTitleAr && (
                        <p className="font-arabic text-xs text-[var(--brand-accent)] font-medium" dir="rtl">
                          {plan.activityTitleAr}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span className="capitalize font-medium">Domain: {plan.category}</span>
                      <span className="font-mono text-[11px]">{plan.academicYear}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[6px] max-w-md mx-auto">
            <CalendarDays className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Annual Roadmap Ratification in Progress</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              The executive council is ratifying the current academic year's 12-month calendar.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
