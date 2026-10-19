/**
 * @file src/components/home/GalleryPreviewSection.tsx
 * @description Curated Photographic Archive & Visual Registry Preview.
 * 
 * ARCHITECTURAL ROLE:
 * - Showcases verified photo documentation of club events and symposiums.
 * - Queries `getPublicGalleryAlbums({ limit: 4 })`.
 * - Meets Requirement SPEC-HOM-11 and SPEC-GAL-01.
 * 
 * CONSTRAINTS:
 * - Complies with institutional photo publishing and student consent standards.
 * - Restrained typography with academic year and date metadata.
 */

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Image as ImageIcon, ArrowRight, Camera, Calendar } from "lucide-react";

interface GalleryAlbumItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  descriptionEn?: string | null;
  coverImageUrl?: string | null;
  academicYear?: string | null;
  photoCount?: number;
  eventDate?: string | null;
}

interface GalleryPreviewSectionProps {
  albums: GalleryAlbumItem[];
}

export function GalleryPreviewSection({ albums }: GalleryPreviewSectionProps) {
  return (
    <section className="py-20 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-color)]" aria-label="Visual Archives">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="accent" size="sm">Visual Documentation</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif">
              Visual Archives & Event Highlights
            </h2>
            <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
              الْمَعْرِضُ الْفُوتُوغْرَافِيُّ وَالتَّوْثِيقُ الْمَرْئِيُّ • لَقَطَاتٌ مِنْ فَعَالِيَّاتِ النَّادِي
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Curated photographic documentation recording guest speaker colloquia, debate finals, calligraphy exhibitions, and annual convocations.
            </p>
          </div>
          <Link href="/gallery">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Explore Full Photo Archive
            </Button>
          </Link>
        </div>

        {albums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {albums.map((album) => (
              <Card key={album.id} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden flex flex-col justify-between">
                <div>
                  {/* Photo Frame or Placeholder */}
                  <div className="relative aspect-4/3 bg-[var(--brand-dark)] flex items-center justify-center border-b border-[var(--border-subtle)] overflow-hidden">
                    {album.coverImageUrl ? (
                      <Image
                        src={album.coverImageUrl}
                        alt={album.titleEn}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="text-center p-4 space-y-2">
                        <Camera className="w-8 h-8 text-[var(--brand-accent)] mx-auto opacity-70" />
                        <span className="text-[11px] text-[#A6B2A8] block font-mono">Archival Plate</span>
                      </div>
                    )}
                    {album.academicYear && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-[4px] bg-black/70 backdrop-blur-xs text-[10px] font-mono text-white border border-white/20">
                        {album.academicYear}
                      </span>
                    )}
                  </div>

                  <CardContent className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-[var(--text-primary)] line-clamp-1">
                      {album.titleEn}
                    </h3>
                    {album.titleAr && (
                      <p className="font-arabic text-xs text-[var(--brand-accent)] font-medium line-clamp-1" dir="rtl">
                        {album.titleAr}
                      </p>
                    )}
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {album.descriptionEn || "Photographic record from our official community archive."}
                    </p>
                  </CardContent>
                </div>

                <div className="p-4 bg-[var(--bg-primary)]/40 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-mono text-[11px]">
                    {album.photoCount || 12} plates
                  </span>
                  <Link
                    href={`/gallery/${album.slug}`}
                    className="text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Album</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[6px] max-w-md mx-auto">
            <Camera className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Photo Ingestion in Process</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Curated photographic rolls are undergoing metadata and consent checks.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
