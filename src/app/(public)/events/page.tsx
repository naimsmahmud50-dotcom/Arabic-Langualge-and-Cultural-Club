/**
 * @file src/app/(public)/events/page.tsx
 * @route /events
 * @description Annual 12-Month Academic Calendar & Event Roster.
 * 
 * ARCHITECTURE & ROLE:
 * - Public schedule of seminars, Arabic debate competitions, calligraphy workshops,
 *   and cultural evenings.
 * - Queries `getPublicEvents({ category, status })`.
 * - Meets Requirement SPEC-EVT-01 through SPEC-EVT-05.
 * 
 * DESIGN CONSTRAINTS:
 * - Clear date hierarchy, status tags (Open, Closed, Upcoming), and links to dynamic slugs.
 */

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button } from "@/components/ui";
import { getPublicEvents } from "@/lib/db/queries";
import { Calendar, MapPin, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export const revalidate = 60;

interface EventsPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { category } = await searchParams;

  const { data: eventsList = [] } = await getPublicEvents({
    category: category || undefined,
    limit: 20,
  }).catch(() => ({ data: [] }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Events & Calendar", href: "/events" },
  ];

  const categories = [
    { label: "All Activities", value: "" },
    { label: "Competitions (المسابقات)", value: "competition" },
    { label: "Workshops (ورش العمل)", value: "workshop" },
    { label: "Symposia (الندوات والمحاضرات)", value: "symposium" },
    { label: "Cultural Evenings (الأمسيات الثقافية)", value: "cultural" },
  ];

  return (
    <div>
      <PageHeader
        title="Annual Calendar & Events"
        titleAr="التقويم السنوي والفعاليات الأكاديمية"
        description="Explore our planned schedule of classical Arabic workshops, oratorical tournaments, academic lectures, and cultural celebrations."
        badge="12-Month Plan"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-[var(--border-color)]">
          {categories.map((c) => {
            const isSelected = (category || "") === c.value;
            return (
              <Link
                key={c.value}
                href={c.value ? `/events?category=${c.value}` : "/events"}
                className={`px-4 py-2 rounded-[5px] text-xs font-semibold tracking-wide transition-all border ${
                  isSelected
                    ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand-accent)]"
                }`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* Events Grid */}
        {eventsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventsList.map((event) => (
              <Card key={event.id} hoverElevate className="border-[var(--border-color)] flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent" size="sm">
                      {event.category || "Club Event"}
                    </Badge>
                    <span className="text-[11px] font-mono uppercase text-[var(--text-muted)]">
                      {event.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                      {event.titleEn}
                    </h3>
                    {event.titleAr && (
                      <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                        {event.titleAr}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                    {event.summaryEn || "Complete itinerary, speakers, and venue details available on the registration dossier."}
                  </p>

                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                      <span>{new Date(event.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="p-6 pt-0">
                  <Link href={`/events/${event.slug}`} className="w-full block">
                    <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View Event & Register
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Scheduled Events in this Category"
            description="The academic committee publishes seasonal calendar schedules at the start of each academic term. Check back soon for announcements."
            actionLabel="View All Activities"
            actionHref="/events"
          />
        )}
      </div>
    </div>
  );
}
