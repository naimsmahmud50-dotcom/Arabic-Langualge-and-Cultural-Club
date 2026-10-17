/**
 * @file src/app/(public)/events/[slug]/page.tsx
 * @route /events/[slug]
 * @description Detailed Event Dossier and Public Registration Portal.
 * 
 * ARCHITECTURE & ROLE:
 * - Displays complete itinerary, speakers, venue, registration limits, and registration form.
 * - Queries `getPublicEventBySlug(slug)`.
 * - Meets Requirement SPEC-EVT-03 and SPEC-EVT-04.
 */

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { getPublicEventBySlug } from "@/lib/db/queries";
import { Calendar, MapPin, Clock, Users, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

export const revalidate = 60;

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug).catch(() => null);

  if (!event) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: event.titleEn, href: `/events/${event.slug}` },
  ];

  return (
    <div>
      <PageHeader
        title={event.titleEn}
        titleAr={event.titleAr || undefined}
        description={event.summaryEn || "Official institutional event brief and participant registration."}
        badge={event.category || "Official Event"}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Dossier Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-[var(--border-color)] p-8 space-y-6">
              <div>
                <Badge variant="accent" size="sm">Program Description</Badge>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-2">
                  Event Brief & Academic Itinerary
                </h2>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed space-y-4">
                <p>
                  {event.descriptionEn || event.summaryEn || "Detailed itinerary will be distributed to confirmed registrants prior to the symposium."}
                </p>
                {event.descriptionAr && (
                  <div className="p-4 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-arabic text-right leading-relaxed text-[var(--text-primary)]" dir="rtl">
                    {event.descriptionAr}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[var(--brand-accent)]" />
                  <span>
                    <strong>Date:</strong> {new Date(event.startTime).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[var(--brand-accent)]" />
                  <span>
                    <strong>Time:</strong> {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[var(--brand-accent)]" />
                  <span>
                    <strong>Location:</strong> {event.venue || "Campus Auditorium / Hall"}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[var(--brand-accent)]" />
                  <span>
                    <strong>Max Capacity:</strong> {event.capacity || "Open Admission"}
                  </span>
                </div>
              </div>
            </Card>

            <Link href="/events" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-accent)] hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Full 12-Month Calendar
            </Link>
          </div>

          {/* Registration Sidebar */}
          <div>
            <Card className="border-[var(--border-color)] bg-[var(--bg-surface-elevated)] p-6 space-y-6 sticky top-28">
              <div className="space-y-1">
                <Badge variant={event.isRegistrationOpen ? "accent" : "neutral"} size="sm">
                  {event.isRegistrationOpen ? "Registration Open" : "Registration Closed"}
                </Badge>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Reserve Your Seat
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Admission is complimentary for enrolled students and registered club fellows.
                </p>
              </div>

              {event.isRegistrationOpen ? (
                <form className="space-y-4" action="#">
                  <Input
                    label="Full Name (English)"
                    placeholder="e.g. Tariq Al-Mansur"
                    required
                  />
                  <Input
                    label="Student ID / Registration No."
                    placeholder="e.g. 2024-ARB-089"
                    required
                  />
                  <Input
                    label="Institutional Email"
                    type="email"
                    placeholder="student@university.edu"
                    required
                  />
                  <Button variant="accent" size="md" className="w-full justify-center">
                    Confirm Seat Reservation
                  </Button>
                  <p className="text-[11px] text-[var(--text-muted)] text-center leading-tight">
                    By registering, you consent to event attendee communications according to our privacy charter.
                  </p>
                </form>
              ) : (
                <div className="p-4 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-color)] text-center space-y-2">
                  <p className="text-xs text-[var(--text-secondary)]">
                    Official registration for this session is currently not accepting new applicants.
                  </p>
                  <Link href="/contact" className="text-xs text-[var(--brand-accent)] font-semibold hover:underline block">
                    Contact Academic Secretariat →
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
