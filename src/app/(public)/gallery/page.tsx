/**
 * @file src/app/(public)/gallery/page.tsx
 * @route /gallery
 * @description Official Photo & Media Archive Catalog.
 * 
 * ARCHITECTURE & ROLE IN ARABIC CLUB SYSTEM:
 * - Public archival repository preserving photographic and audiovisual records
 *   of club milestones, oratorical tournaments, calligraphy vernissages,
 *   academic symposia, and rare manuscript restoration workshops.
 * - Queries `getPublicGalleryAlbums()` with category, year, and search filtering.
 * - Fulfills Requirement REQ-PUB-10, SPEC-GAL-01 through SPEC-GAL-06.
 * 
 * DEVELOPER ONBOARDING NOTE:
 * - Filter state is managed through URL search parameters (`category`, `year`, `q`),
 *   ensuring deep-linking and bookmarkable archival collections.
 * - Draft albums (`isPublished === false`) are strictly filtered out by the database layer.
 * - Each album indicates whether it is cross-linked to an official club event (`relatedEventSlug`).
 * 
 * HUMAN VIBE POLICY:
 * - Strictly zero AI emojis. Uses authentic institutional typography and Lucide SVG icons.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button } from "@/components/ui";
import { getPublicGalleryAlbums, getPublicGalleryYears } from "@/lib/db/queries";
import { 
  Camera, 
  Calendar, 
  ArrowRight, 
  Search, 
  Link2,
  MapPin
} from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Photo & Media Gallery Archive | Arabic Language & Cultural Club",
  description: "Official visual repository preserving photographic and audiovisual records of club milestones, oratorical tournaments, calligraphy vernissages, and academic symposia.",
  openGraph: {
    title: "Photo & Media Gallery Archive — Arabic Language & Cultural Club",
    description: "Browse photographic albums and archival recordings documenting the heritage of the Arabic Language & Cultural Club.",
    url: "/gallery",
  },
  alternates: {
    canonical: "/gallery",
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo & Media Gallery Archive — Arabic Language & Cultural Club",
    description: "Browse photographic albums and archival recordings documenting the heritage of the Arabic Language & Cultural Club.",
  },
};

interface GalleryPageProps {
  searchParams: Promise<{ category?: string; year?: string; q?: string; page?: string }>;
}

const CATEGORIES = [
  { id: "all", labelEn: "All Archives", labelAr: "كافة الألبومات" },
  { id: "debates", labelEn: "Debates & Eloquence", labelAr: "المناظرات والفصاحة" },
  { id: "calligraphy", labelEn: "Calligraphy & Arts", labelAr: "الخط والزخرفة" },
  { id: "symposia", labelEn: "Symposia & Lectures", labelAr: "الندوات والمحاضرات" },
  { id: "workshops", labelEn: "Codicology & Workshops", labelAr: "المخطوطات والورش" },
  { id: "ceremonies", labelEn: "Ceremonies & Galas", labelAr: "المراسم والتكريم" },
];

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const { category = "all", year = "all", q = "" } = await searchParams;

  const [albumsResult, availableYears] = await Promise.all([
    getPublicGalleryAlbums({
      category,
      year,
      search: q,
      limit: 24,
    }).catch(() => ({ data: [], pagination: { total: 0 } })),
    getPublicGalleryYears().catch(() => []),
  ]);

  const albums = albumsResult.data || [];
  const totalAlbums = albumsResult.pagination?.total || 0;

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Photo Gallery", href: "/gallery" },
  ];

  return (
    <div>
      <PageHeader
        title="Photo & Media Archive"
        titleAr="معرض الصور والأرشيف المرئي"
        description="Preserving visual memories of our academic symposia, oratorical championships, cultural evenings, and rare manuscript workshops."
        badge="Archival Repository"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-6 sm:space-y-10">
        {/* Controls Toolbar: Search, Category Filters, Academic Year Selector */}
        <div className="bg-[var(--surface-color)] p-4 sm:p-6 rounded-xl border border-[var(--border-color)] shadow-sm space-y-4 sm:space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <form action="/gallery" method="GET" className="relative w-full md:max-w-md">
              <input type="hidden" name="category" value={category} />
              <input type="hidden" name="year" value={year} />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search albums by keyword, topic, or location..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] transition-all min-h-[44px]"
              />
            </form>

            {/* Academic Year Dropdown & Stats */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full md:w-auto justify-between md:justify-end">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                Showing <strong className="text-[var(--text-primary)]">{albums.length}</strong> of{" "}
                <strong className="text-[var(--text-primary)]">{totalAlbums}</strong> albums
              </span>

              {availableYears.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
                  <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0" />
                  <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-1 text-xs shrink-0">
                    <Link
                      href={`/gallery?category=${category}&year=all&q=${encodeURIComponent(q)}`}
                      className={`px-2.5 py-1.5 rounded transition-colors min-h-[32px] flex items-center ${
                        year === "all"
                          ? "bg-[var(--brand-primary)] text-white font-semibold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      All Years
                    </Link>
                    {availableYears.map((y) => (
                      <Link
                        key={y}
                        href={`/gallery?category=${category}&year=${encodeURIComponent(y)}&q=${encodeURIComponent(q)}`}
                        className={`px-2.5 py-1.5 rounded transition-colors min-h-[32px] flex items-center ${
                          year === y
                            ? "bg-[var(--brand-primary)] text-white font-semibold"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                      >
                        {y}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 border-t border-[var(--border-subtle)] pt-4">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.id;
              return (
                <Link
                  key={cat.id}
                  href={`/gallery?category=${cat.id}&year=${year}&q=${encodeURIComponent(q)}`}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[36px] ${
                    isActive
                      ? "bg-[var(--brand-accent)] text-[var(--brand-dark)] shadow-sm"
                      : "bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  <span>{cat.labelEn}</span>
                  <span className="font-arabic text-[11px] opacity-75" dir="rtl">
                    {cat.labelAr}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Gallery Albums Section */}
        <section aria-labelledby="gallery-albums-heading">
          <h2 id="gallery-albums-heading" className="sr-only">
            Archival Photography and Media Albums
          </h2>
          {albums.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {albums.map((album, idx) => (
              <Card 
                key={album.id} 
                hoverElevate 
                className="border-[var(--border-color)] overflow-hidden group flex flex-col justify-between"
              >
                <Link href={`/gallery/${album.slug}`} className="block flex-1 flex flex-col">
                  {/* Album Cover Thumbnail */}
                  <div className="relative aspect-video bg-[var(--brand-dark)] flex items-center justify-center overflow-hidden border-b border-[var(--border-color)]">
                    {album.coverImageUrl ? (
                      <Image
                        src={album.coverImageUrl}
                        alt={album.titleEn}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 640px) 380px, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-[var(--brand-accent)] opacity-80">
                        <Camera className="w-10 h-10" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Archival Dossier</span>
                      </div>
                    )}

                    {/* Overlay Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                      <Badge variant="accent" size="sm">
                        {album.academicYear}
                      </Badge>
                      <Badge variant="neutral" size="sm" className="bg-black/60 text-white border-white/20">
                        {album.category.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Media Count Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/10">
                      <Camera className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                      <span>{album.mediaCount || 0} Assets</span>
                    </div>

                    {/* Event Linked Indicator */}
                    {album.relatedEventId && (
                      <div className="absolute top-3 right-3 bg-[var(--brand-primary)]/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-white flex items-center gap-1 border border-white/20">
                        <Link2 className="w-3 h-3 text-[var(--brand-accent)]" />
                        <span>Event Linked</span>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 sm:p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors leading-tight">
                        {album.titleEn}
                      </h3>
                      {album.titleAr && (
                        <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold line-clamp-1" dir="rtl">
                          {album.titleAr}
                        </p>
                      )}
                      {album.descriptionEn && (
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                          {album.descriptionEn}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-[var(--border-subtle)] space-y-2.5">
                      {/* Event Date & Location */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-[var(--text-muted)] gap-2">
                        {album.eventDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[var(--brand-accent)]" />
                            <span>{album.eventDate}</span>
                          </span>
                        )}
                        {album.location && (
                          <span className="flex items-center gap-1 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-white/50" />
                            <span className="truncate">{album.location}</span>
                          </span>
                        )}
                      </div>

                      {/* Explore Action Button */}
                      <div className="flex items-center justify-between text-xs text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-semibold pt-1">
                        <span>Explore Archival Album</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Archival Media Found"
            description={
              q
                ? `No albums match your search query "${q}". Try clearing filters or using broader keywords.`
                : "The media and documentation bureau is actively digitizing and curating photographic materials for this category."
            }
            actionLabel="Reset All Filters"
            actionHref="/gallery"
          />
        )}
        </section>
      </div>
    </div>
  );
}
