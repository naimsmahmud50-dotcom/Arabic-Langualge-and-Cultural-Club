/**
 * DEVELOPER NOTE:
 * File: src/app/(public)/events/[slug]/page.tsx
 * Route: /events/[slug]
 * Module: Public Event Dossier
 * Phase 8 Enhancement (030-event-to-gallery-website-integration):
 * - Integrates `getPublicGalleryAlbumByEventId(event.id)` to look up official published photo albums.
 * - Renders a dedicated Photographic Retrospective section with preview grid, photo counts,
 *   and direct deep-link to `/gallery/[albumSlug]`.
 * - Maintains strict Strix privacy: draft/archived albums remain completely hidden from public visitors.
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/app/(public)/events/[slug]/page.tsx
 * @route /events/[slug]
 * @description Detailed Event Dossier & Real Interactive Registration Portal.
 */

import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { 
  getPublicEventBySlug, 
  getEventRegistrationStats,
  getPublicGalleryAlbumByEventId 
} from "@/lib/db/queries";
import { EventRegistrationCard } from "./EventRegistrationCard";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ShieldCheck, 
  ArrowLeft, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  BookOpen,
  UserCheck,
  Camera,
  ExternalLink
} from "lucide-react";

export const revalidate = 60;

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug).catch(() => null);

  if (!event) {
    return {
      title: "Event Not Found | Arabic Language & Cultural Club",
      description: "The requested academic event or symposium could not be located in our records.",
    };
  }

  const title = `${event.titleEn} | Arabic Language & Cultural Club`;
  const description = event.summaryEn || event.descriptionEn?.slice(0, 160) || "Academic symposium and cultural event organized by the Arabic Language & Cultural Club.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/events/${event.slug}`,
      images: event.coverImageUrl ? [{ url: event.coverImageUrl }] : undefined,
    },
    alternates: {
      canonical: `/events/${event.slug}`,
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug).catch(() => null);

  if (!event) {
    notFound();
  }

  // Fetch live registration statistics and associated public photo album
  const stats = await getEventRegistrationStats(event.id).catch(() => null);
  const album = await getPublicGalleryAlbumByEventId(event.id).catch(() => null);

  const isCancelled = event.status === "cancelled";
  const isPostponed = event.status === "postponed";
  const isCompleted = event.status === "completed";

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Events & Calendar", href: "/events" },
    { label: event.titleEn, href: `/events/${event.slug}` },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* 1. Header */}
      <PageHeader
        title={event.titleEn}
        titleAr={event.titleAr || undefined}
        description={event.summaryEn || "Official institutional event brief and participant registration."}
        badge={event.category || "Official Event"}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Postponed / Cancelled Warning Banner */}
        {isCancelled && (
          <div className="mb-8 p-4 rounded-[6px] bg-rose-900/10 border-2 border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm uppercase tracking-wide">
                Notice of Official Event Cancellation
              </h4>
              <p className="text-xs leading-relaxed">
                This gathering has been officially cancelled by the executive secretariat. Registration is unavailable. We apologize for any inconvenience caused to prospective attendees.
              </p>
            </div>
          </div>
        )}

        {isPostponed && (
          <div className="mb-8 p-4 rounded-[6px] bg-amber-900/10 border-2 border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm uppercase tracking-wide">
                Notice of Schedule Postponement
              </h4>
              <p className="text-xs leading-relaxed">
                This event has been postponed to accommodate university examination timetables. Registration is temporarily on hold until the revised date is ratified by the Academic Council.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Dossier Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-[var(--border-color)] p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                <div>
                  <Badge variant="accent" size="sm" className="capitalize">
                    {event.category} Gathering
                  </Badge>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-1.5">
                    Academic Overview & Syllabus
                  </h2>
                </div>

                <span className="text-xs font-mono font-semibold uppercase px-2.5 py-1 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                  Status: {event.status}
                </span>
              </div>

              {/* Detailed Descriptions */}
              <div className="space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
                <p>
                  {event.descriptionEn || event.summaryEn || "Complete syllabus, reading lists, and presenter details will be delivered to registered attendees prior to assembly."}
                </p>

                {event.descriptionAr && (
                  <div className="p-5 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] font-arabic text-right leading-relaxed text-[var(--text-primary)]" dir="rtl">
                    <p className="text-xs font-mono text-[var(--brand-accent)] uppercase mb-2">
                      نبذة تعريفية باللغة العربية:
                    </p>
                    {event.descriptionAr}
                  </div>
                )}
              </div>

              {/* Verified Logistics Grid */}
              <div className="pt-6 border-t border-[var(--border-color)] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[var(--text-secondary)]">
                <div className="p-3 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[var(--brand-accent)] shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">Date of Assembly</span>
                    <strong className="text-[var(--text-primary)] font-mono">
                      {new Date(event.startTime).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[var(--brand-accent)] shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">Session Hours</span>
                    <strong className="text-[var(--text-primary)] font-mono">
                      {new Date(event.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {event.endTime && ` – ${new Date(event.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[var(--brand-accent)] shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">Venue / Assembly Hall</span>
                    <strong className="text-[var(--text-primary)] truncate max-w-[200px] block">
                      {event.venue || "Central Campus Assembly Hall"}
                    </strong>
                  </div>
                </div>

                <div className="p-3 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] flex items-center gap-3">
                  <Users className="w-4 h-4 text-[var(--brand-accent)] shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">Seating Capacity</span>
                    <strong className="text-[var(--text-primary)] font-mono">
                      {event.capacity ? `${event.capacity} Allocated Seats` : "Open Admission"}
                    </strong>
                  </div>
                </div>
              </div>
            </Card>

            {/* Photographic Retrospective & Media Archive (Bidirectional Event-to-Gallery Integration) */}
            {album && (
              <Card className="border-[var(--brand-accent)]/40 p-6 space-y-5 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-surface-elevated)] shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-accent)] flex items-center justify-center shrink-0">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold uppercase text-[var(--brand-accent)] tracking-wider">
                          Photographic Retrospective
                        </span>
                        <Badge variant="accent" size="sm">
                          {album.photoCount || album.mediaCount} Photos
                        </Badge>
                      </div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] mt-0.5">
                        {album.titleEn}
                      </h3>
                    </div>
                  </div>

                  <Link
                    href={`/gallery/${album.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-dark)] transition-colors text-xs font-semibold shrink-0"
                  >
                    <span>Explore Photo Album</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {album.photos && album.photos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {album.photos.slice(0, 4).map((p, idx) => (
                      <Link
                        key={p.id || idx}
                        href={`/gallery/${album.slug}`}
                        className="group relative aspect-4/3 rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--bg-surface-elevated)]"
                      >
                        <img
                          src={p.thumbnailUrl || p.fileUrl}
                          alt={p.altText || p.captionEn || `${event.titleEn} photograph`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {idx === 3 && album.photos.length > 4 && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-xs">
                            +{album.photos.length - 3} more
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                {album.descriptionEn && (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                    &ldquo;{album.descriptionEn}&rdquo;
                  </p>
                )}
              </Card>
            )}

            {/* Strict Attendee Privacy Statement */}
            <Card className="border-[var(--border-color)] p-6 space-y-2 bg-[var(--bg-surface)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                <ShieldCheck className="w-4 h-4 text-[var(--brand-accent)]" />
                <span>Institutional Privacy & Participant Confidentiality Policy</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                In compliance with the society&apos;s data protection constitution, the roster of registered participants is confidential. Personal contact details, registration identifiers, and student ID numbers are stored in secure administrative vaults and will strictly never be made public, crawled by search engines, or sold to external third parties.
              </p>
            </Card>

            <Link href="/events" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-accent)] hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Annual Master Calendar & Schedule
            </Link>
          </div>

          {/* Registration Sidebar */}
          <div>
            <EventRegistrationCard
              eventId={event.id}
              eventTitle={event.titleEn}
              isRegistrationOpen={event.isRegistrationOpen}
              status={event.status as any}
              capacity={event.capacity}
              totalRegistered={stats?.totalRegistered || 0}
              remainingSeats={stats?.remainingSeats ?? null}
              isAtCapacity={stats?.isAtCapacity || false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
