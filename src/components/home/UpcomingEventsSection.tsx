/**
 * @file src/components/home/UpcomingEventsSection.tsx
 * @description Upcoming Academic Events & Lectures Showcase.
 * 
 * ARCHITECTURAL ROLE:
 * - Real-time showcase of confirmed lectures, debate rounds, workshops, and symposiums.
 * - Queries `getPublicEvents({ status: "upcoming", limit: 3 })`.
 * - Meets Requirement SPEC-HOM-05 and SPEC-EVT-01.
 * 
 * CONSTRAINTS:
 * - Zero fabricated dates or events: displays live database records.
 * - Provides polished empty state when academic term events are in preparation.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Calendar, MapPin, ArrowRight, Clock, UserCheck } from "lucide-react";

interface EventItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  summaryEn?: string | null;
  category?: string | null;
  startTime: Date;
  endTime?: Date | null;
  venue?: string | null;
  status: string;
  isRegistrationOpen: boolean;
}

interface UpcomingEventsSectionProps {
  events: EventItem[];
}

export function UpcomingEventsSection({ events }: UpcomingEventsSectionProps) {
  return (
    <section className="py-20 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-color)]" aria-label="Upcoming Events">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="accent" size="sm">Academic Schedule</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif">
              Upcoming Events & Scholarly Assemblies
            </h2>
            <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
              جَدْوَلُ الْفَعَالِيَّاتِ وَالْمُحَاضَرَاتِ • أَنْشِطَةُ النَّادِي الْقَادِمَةُ
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Engage with guest linguists, participate in competitive debate circuits, and attend classical literature readings.
            </p>
          </div>
          <Link href="/events">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Full 12-Month Schedule
            </Button>
          </Link>
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((evt) => {
              const eventDate = new Date(evt.startTime);
              const formattedDate = eventDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const formattedTime = eventDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <Card key={evt.id} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="accent" size="sm">
                        {evt.category || "Scholarly Event"}
                      </Badge>
                      <Badge variant={evt.isRegistrationOpen ? "success" : "neutral"} size="sm">
                        {evt.isRegistrationOpen ? "Registration Open" : "Confirmed"}
                      </Badge>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] line-clamp-2">
                        {evt.titleEn}
                      </h3>
                      {evt.titleAr && (
                        <p className="font-arabic text-xs text-[var(--brand-accent)] font-medium" dir="rtl">
                          {evt.titleAr}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                      {evt.summaryEn || "Complete session briefing, speaker bio, and reading materials available."}
                    </p>

                    <div className="space-y-1.5 pt-3 border-t border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0" />
                        <span>{formattedDate} • {formattedTime}</span>
                      </div>
                      {evt.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0" />
                          <span className="truncate">{evt.venue}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <div className="p-4 bg-[var(--bg-primary)]/50 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <Link
                      href={`/events/${evt.slug}`}
                      className="text-xs font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Session Briefing</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    {evt.isRegistrationOpen && (
                      <Link href={`/events/${evt.slug}#register`}>
                        <Button variant="accent" size="sm" className="text-[11px] py-1 px-2.5">
                          Register
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center border border-dashed border-[var(--border-color)] rounded-[6px] max-w-lg mx-auto bg-[var(--bg-surface)]">
            <Calendar className="w-10 h-10 text-[var(--brand-accent)] mx-auto mb-3 opacity-80" />
            <h4 className="text-base font-bold text-[var(--text-primary)]">Upcoming Events in Preparation</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
              The academic secretariat is finalizing dates for the upcoming term. Please consult the full annual plan.
            </p>
            <div className="mt-5">
              <Link href="/events">
                <Button variant="outline" size="sm">Browse 12-Month Plan</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
