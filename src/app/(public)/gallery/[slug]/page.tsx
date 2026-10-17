/**
 * @file src/app/(public)/gallery/[slug]/page.tsx
 * @route /gallery/[slug]
 * @description Album Photo Showcase and Lightbox Media View.
 * 
 * ARCHITECTURE & ROLE:
 * - Displays all verified photographs and media assets curated under an official album.
 * - Queries `getPublicGalleryAlbumBySlug(slug)`.
 * - Meets Requirement SPEC-GAL-03 and SPEC-GAL-04.
 */

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui";
import { getPublicGalleryAlbumBySlug } from "@/lib/db/queries";
import { Image as ImageIcon, Calendar, ArrowLeft } from "lucide-react";

export const revalidate = 60;

interface AlbumDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { slug } = await params;
  const album = await getPublicGalleryAlbumBySlug(slug).catch(() => null);

  if (!album) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Gallery", href: "/gallery" },
    { label: album.titleEn, href: `/gallery/${album.slug}` },
  ];

  return (
    <div>
      <PageHeader
        title={album.titleEn}
        titleAr={album.titleAr || undefined}
        description={album.descriptionEn || "Official media assets preserving memorable moments from this club milestone."}
        badge={album.academicYear || "Photographic Archive"}
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <Link href="/gallery" className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand-accent)] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to All Photo Albums
        </Link>

        {album.photos && album.photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {album.photos.map((photo) => (
              <Card key={photo.id} className="border-[var(--border-color)] overflow-hidden">
                <div className="relative aspect-4/3 bg-[var(--brand-dark)] flex items-center justify-center overflow-hidden">
                  <img
                    src={photo.fileUrl}
                    alt={photo.captionEn || "Club archive photo"}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                {(photo.captionEn || photo.captionAr) && (
                  <CardContent className="p-4 space-y-1">
                    {photo.captionEn && (
                      <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                        {photo.captionEn}
                      </p>
                    )}
                    {photo.captionAr && (
                      <p className="font-arabic text-xs text-[var(--brand-accent)] text-right" dir="rtl">
                        {photo.captionAr}
                      </p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Photographs Being Digitized"
            description="The media secretariat has created this album registry. High-resolution photographic assets are being validated for publication."
            actionLabel="Back to All Albums"
            actionHref="/gallery"
          />
        )}
      </div>
    </div>
  );
}
