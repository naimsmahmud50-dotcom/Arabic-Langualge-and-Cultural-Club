/**
 * @file src/app/(public)/events/page.tsx
 * @route /events
 * @description Master Academic Calendar & 12-Month Annual Plan.
 * 
 * ARCHITECTURE & ROLE:
 * - Public hub for the Arabic Language & Cultural Club's 12-month annual plan and calendar.
 * - Queries:
 *   1. `getAnnualPlanYears()`: Available academic sessions (e.g. 2024–2025, 2023–2024).
 *   2. `getPublicAnnualPlans()`: Month-by-month published activity schedule with verified logistics.
 *   3. `getPublicEvents()`: Active major events, symposiums, and tournaments.
 * - Meets Requirement REQ-PUB-08 (12-Month Annual Plan & Calendar View) and REQ-PUB-09.
 * 
 * DESIGN CONSTRAINTS & TOKENS:
 * - Brand Primary: #173D32 (Forest Green)
 * - Brand Accent: #B18A4A (Antique Brass)
 * - Dark Surface: #17211D (Midnight Evergreen)
 * - Light Surface: #F5F0E5 (Warm Ivory)
 * - Anti-Emoji: Strictly zero cheesy AI emojis. Clean Lucide SVG icons only.
 * - Zero-Fabrication: All unverified logistics are clearly rendered as "[Date to be finalized]"
 *   or "[Venue to be announced]". Cancelled/postponed activities feature clear warnings.
 */

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { getPublicEvents, getPublicAnnualPlans, getAnnualPlanYears } from "@/lib/db/queries";
import { AnnualPlanCalendarClient } from "./AnnualPlanCalendarClient";
import { Calendar, MapPin, Clock, ArrowRight, Sparkles, BookOpen } from "lucide-react";

export const revalidate = 60;

interface EventsPageProps {
  searchParams: Promise<{ year?: string; category?: string; view?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { year } = await searchParams;

  // Fetch available academic sessions, published annual plans, and active major events in parallel
  const [availableYears, annualPlanActivities, eventsResult] = await Promise.all([
    getAnnualPlanYears().catch(() => ["2024–2025"]),
    getPublicAnnualPlans().catch(() => []),
    getPublicEvents({ limit: 4 }).catch(() => ({ data: [] })),
  ]);

  const activeSessionYear = year || availableYears[0] || "2024–2025";
  const featuredEvents = eventsResult.data || [];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Annual Plan & Calendar", href: "/events" },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Institutional Hero Header */}
      <PageHeader
        title="Annual Plan & Master Calendar"
        titleAr="الخطة السنوية والتقويم الأكاديمي المعتمد"
        description="Explore our ratified 12-month academic curriculum: classical Arabic workshops, oratorical tournaments, research symposia, and cultural salons organized by academic year."
        badge="12-Month Academic Curriculum"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 2. Interactive Annual Plan & Calendar Client Layer */}
        <section aria-labelledby="annual-plan-heading">
          <AnnualPlanCalendarClient
            initialActivities={annualPlanActivities as any}
            availableYears={availableYears.length > 0 ? availableYears : ["2024–2025"]}
            activeYear={activeSessionYear}
          />
        </section>

        {/* 3. Featured Major Events Spotlight (Links to Registration Dossiers) */}
        {featuredEvents.length > 0 && (
          <section className="pt-10 border-t border-[var(--border-color)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[var(--brand-accent)]" />
                  <span className="text-xs uppercase tracking-widest font-mono font-semibold text-[var(--brand-accent)]">
                    Featured Major Gatherings
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  Major Events with Public Registration
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Register directly for university-wide oratorical tournaments and masterclasses.
                </p>
              </div>

              <Link href="/events?view=list">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  View Full Itinerary
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredEvents.map((evt) => (
                <Card key={evt.id} hoverElevate className="border-[var(--border-color)] flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="accent" size="sm" className="capitalize">
                        {evt.category || "Club Event"}
                      </Badge>
                      <span className="text-[11px] font-mono uppercase text-[var(--text-muted)]">
                        {evt.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                        {evt.titleEn}
                      </h4>
                      {evt.titleAr && (
                        <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                          {evt.titleAr}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {evt.summaryEn || "Complete itinerary, speakers, and venue details available on the registration dossier."}
                    </p>

                    <div className="pt-3 border-t border-[var(--border-subtle)] space-y-1.5 text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-2 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        <span>{new Date(evt.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      {evt.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <div className="p-6 pt-0">
                    <Link href={`/events/${evt.slug}`} className="w-full block">
                      <Button variant="primary" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        <span>Inspect Dossier & Register</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 4. Archival & Academic Council Notice */}
        <section className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[6px] p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase font-mono font-bold text-[var(--brand-accent)]">
            <BookOpen className="w-4 h-4 text-[var(--brand-accent)]" />
            <span>Academic Council Calendar Protocol</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            The Arabic Language & Cultural Club ratifies its annual curriculum during the inaugural session of each academic term. In accordance with Article 4 of the institutional bylaws, activities marked as <em>Planned</em> remain subject to logistical confirmation by the Academic Council. All adjustments, postponements, or cancellations are permanently timestamped and documented in our public archives to preserve historical transparency.
          </p>
        </section>
      </div>
    </div>
  );
}
