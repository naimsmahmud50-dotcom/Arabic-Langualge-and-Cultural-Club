/**
 * @file src/app/(public)/gallery/[slug]/page.tsx
 * @route /gallery/[slug]
 * @description Official Album Dossier, Media Showcase & Lightbox Experience.
 * 
 * ARCHITECTURE & ROLE IN ARABIC CLUB SYSTEM:
 * - Public archival detail page presenting all curated photographs and audiovisual
 *   recordings associated with an institutional milestone, competition, or workshop.
 * - Deep-links to official club events (`/events/[slug]`) when cross-referenced.
 * - Fulfills Requirements SPEC-GAL-07 through SPEC-GAL-14.
 * 
 * DEVELOPER ONBOARDING NOTE:
 * - Strix-Supabase Security Guardrail: If an album is marked as draft (`isPublished === false`),
 *   `getPublicGalleryAlbumBySlug` returns `null` and this route triggers `notFound()`.
 *   This ensures confidential or unapproved photographs are never indexed or leaked.
 * - Dynamic OpenGraph metadata is generated via `generateMetadata()` for seamless social sharing.
 * 
 * HUMAN VIBE POLICY:
 * - Strictly zero AI emojis. Uses authentic institutional typography and Lucide SVG icons.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, EmptyState } from "@/components/ui";
import { getPublicGalleryAlbumBySlug } from "@/lib/db/queries";
import { AlbumMediaGrid } from "./AlbumMediaGrid";
import { 
  Camera, 
  Calendar, 
  ArrowLeft, 
  MapPin, 
  Link2, 
  Film, 
  Layers, 
  ExternalLink,
  ShieldCheck
} from "lucide-react";

export const revalidate = 60;

interface AlbumDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AlbumDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await getPublicGalleryAlbumBySlug(slug).catch(() => null);

  if (!album) {
    return {
      title: "Album Not Found | Arabic Language & Cultural Club",
    };
  }

  const title = `${album.titleEn} | Photo Archive`;
  const description = album.descriptionEn || `Archival photographic collection documenting ${album.titleEn}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: album.coverImageUrl ? [{ url: album.coverImageUrl }] : undefined,
    },
  };
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { slug } = await params;
  const album = await getPublicGalleryAlbumBySlug(slug).catch(() => null);

  if (!album) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Photo Gallery", href: "/gallery" },
    { label: album.titleEn, href: `/gallery/${album.slug}` },
  ];

  const photos = album.photos || [];
  const photoCount = album.photoCount ?? photos.filter((p) => p.mediaType === "image").length;
  const videoCount = album.videoCount ?? photos.filter((p) => p.mediaType === "video").length;

  return (
    <div>
      <PageHeader
        title={album.titleEn}
        titleAr={album.titleAr || undefined}
        description={
          album.descriptionEn ||
          "Official media assets preserving memorable proceedings and historical moments from this club milestone."
        }
        badge={album.academicYear || "Photographic Archive"}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Top Navigation & Meta Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Archival Collections</span>
          </Link>

          {/* Counts and Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5 font-medium">
              <Camera className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
              <span>{photoCount} Photographs</span>
            </span>
            {videoCount > 0 && (
              <>
                <span className="text-[var(--border-color)]">•</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Film className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                  <span>{videoCount} Video Record{videoCount > 1 ? "s" : ""}</span>
                </span>
              </>
            )}
            <span className="text-[var(--border-color)]">•</span>
            <Badge variant="accent" size="sm">
              {album.category.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Event Association Banner (Cross-linking to Event Dossier) */}
        {album.relatedEventSlug && album.relatedEventTitle && (
          <div className="bg-[var(--surface-color)] p-5 rounded-xl border border-[var(--brand-accent)]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-accent)] shrink-0">
                <Link2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-[var(--brand-accent)]">
                    Official Event Association
                  </span>
                  <Badge variant="neutral" size="sm">
                    Verified Dossier
                  </Badge>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  This media album directly documents the proceedings and outcomes of:{" "}
                  <strong className="text-[var(--text-primary)]">{album.relatedEventTitle}</strong>
                </p>
              </div>
            </div>

            <Link
              href={`/events/${album.relatedEventSlug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-dark)] transition-colors text-xs font-semibold shrink-0"
            >
              <span>View Event Dossier</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Archival Context Card */}
        <div className="bg-[var(--surface-color)] p-6 rounded-xl border border-[var(--border-color)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-6 text-[var(--text-secondary)]">
              {album.eventDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--brand-accent)]" />
                  <span>
                    Convened on: <strong className="text-[var(--text-primary)]">{album.eventDate}</strong>
                  </span>
                </div>
              )}
              {album.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--brand-accent)]" />
                  <span>
                    Location: <strong className="text-[var(--text-primary)]">{album.location}</strong>
                  </span>
                </div>
              )}
              {album.photographerCredit && (
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[var(--brand-accent)]" />
                  <span>
                    Curated by: <strong className="text-[var(--text-primary)]">{album.photographerCredit}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[var(--text-muted)] text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Archival Deposit</span>
            </div>
          </div>
        </div>

        {/* Interactive Media Grid */}
        {photos.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--brand-accent)]" />
                <span>Media Catalog ({photos.length} Assets)</span>
              </h2>
              <span className="text-xs text-[var(--text-muted)]">
                Click any asset to inspect in fullscreen lightbox
              </span>
            </div>

            <AlbumMediaGrid
              media={photos}
              albumTitleEn={album.titleEn}
              albumTitleAr={album.titleAr}
              academicYear={album.academicYear}
              location={album.location}
            />
          </div>
        ) : (
          <EmptyState
            title="Archival Media Being Cataloged"
            description="The press and documentation bureau has registered this official album. High-resolution photographic assets are undergoing archival collation and will appear here upon clearance."
            actionLabel="Return to Gallery Catalog"
            actionHref="/gallery"
          />
        )}
      </div>
    </div>
  );
}
