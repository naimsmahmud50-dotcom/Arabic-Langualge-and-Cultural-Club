/**
 * @file src/app/(public)/gallery/page.tsx
 * @route /gallery
 * @description Official Photo and Media Archive.
 * 
 * ARCHITECTURE & ROLE:
 * - Public photo albums documenting cultural galas, calligraphy exhibitions,
 *   annual assemblies, and academic competitions.
 * - Queries `getPublicGalleryAlbums()`.
 * - Meets Requirement SPEC-GAL-01 through SPEC-GAL-04.
 * 
 * PRIVACY SAFEGUARDS:
 * - Adheres strictly to member publication consent.
 */

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui";
import { getPublicGalleryAlbums } from "@/lib/db/queries";
import { Image as ImageIcon, Calendar, ArrowRight } from "lucide-react";

export const revalidate = 60;

export default async function GalleryPage() {
  const { data: albums = [] } = await getPublicGalleryAlbums().catch(() => ({ data: [] }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Photo Gallery", href: "/gallery" },
  ];

  return (
    <div>
      <PageHeader
        title="Photo & Media Archive"
        titleAr="معرض الصور والأرشيف المرئي"
        description="Preserving visual memories of our academic gatherings, oratorical competitions, cultural nights, and calligraphy exhibitions."
        badge="Archival Repository"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {albums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
              <Card key={album.id} hoverElevate className="border-[var(--border-color)] overflow-hidden group">
                <Link href={`/gallery/${album.slug}`} className="block">
                  {/* Album Cover Thumbnail */}
                  <div className="relative aspect-video bg-[var(--brand-dark)] flex items-center justify-center overflow-hidden border-b border-[var(--border-color)]">
                    {album.coverImageUrl ? (
                      <img
                        src={album.coverImageUrl}
                        alt={album.titleEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-[var(--brand-accent)] opacity-80">
                        <ImageIcon className="w-10 h-10" />
                        <span className="text-xs uppercase tracking-wider font-semibold">Institutional Album</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant="accent" size="sm">
                        {album.academicYear || "Archive"}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-3">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors leading-tight">
                      {album.titleEn}
                    </h3>
                    {album.titleAr && (
                      <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                        {album.titleAr}
                      </p>
                    )}
                    {album.descriptionEn && (
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                        {album.descriptionEn}
                      </p>
                    )}

                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-semibold">
                      <span>Explore Gallery</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Archival Media Under Cataloging"
            description="The media and press secretariat is curating and scanning photographic records from past academic terms. Albums will be displayed here once cataloged."
            actionLabel="Return to Homepage"
            actionHref="/"
          />
        )}
      </div>
    </div>
  );
}
