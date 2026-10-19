/**
 * @file src/app/(public)/gallery/[slug]/AlbumMediaGrid.tsx
 * @description Interactive Client Media Grid with Lightbox Trigger.
 * 
 * ARCHITECTURE & ROLE IN ARABIC CLUB SYSTEM:
 * - Renders a responsive, accessible gallery grid for all published photographs
 *   and video assets under an official album dossier.
 * - Handles client-side click events to launch the fullscreen `MediaLightbox`.
 * - Shows video badges and play overlays for video assets.
 * 
 * DEVELOPER ONBOARDING NOTE:
 * - Kept as a client component to isolate interactive lightbox state while allowing
 *   the parent `page.tsx` to remain a pure Next.js Server Component with static SEO metadata.
 * 
 * HUMAN VIBE POLICY:
 * - Strictly zero AI emojis. Uses authentic institutional typography and Lucide SVG icons.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent, Badge } from "@/components/ui";
import { MediaLightbox, LightboxMediaItem } from "./MediaLightbox";
import { Camera, Film, Play, Maximize2, Sparkles } from "lucide-react";

interface AlbumMediaGridProps {
  media: LightboxMediaItem[];
  albumTitleEn: string;
  albumTitleAr?: string | null;
  academicYear?: string;
  location?: string | null;
}

export function AlbumMediaGrid({
  media,
  albumTitleEn,
  albumTitleAr,
  academicYear,
  location,
}: AlbumMediaGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const openLightboxAt = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((item, index) => {
          const isVideo = item.mediaType === "video";
          const displayUrl = item.thumbnailUrl || item.fileUrl;

          return (
            <Card
              key={item.id}
              hoverElevate
              onClick={() => openLightboxAt(index)}
              className="border-[var(--border-color)] overflow-hidden cursor-pointer group flex flex-col justify-between"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-4/3 bg-[var(--brand-dark)] flex items-center justify-center overflow-hidden border-b border-[var(--border-color)]">
                {displayUrl ? (
                  <Image
                    src={displayUrl}
                    alt={item.altText || item.captionEn || `${albumTitleEn} photo ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[var(--brand-accent)] opacity-80">
                    <Camera className="w-8 h-8" />
                  </div>
                )}

                {/* Video Indicator Overlay */}
                {isVideo && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/25 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-[var(--brand-accent)] text-[var(--brand-dark)] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge variant="accent" size="sm" className="flex items-center gap-1 shadow-sm">
                        <Film className="w-3 h-3" />
                        <span>Video Asset</span>
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Hover Maximize Hint */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 px-2.5 py-1 rounded text-[11px] text-white flex items-center gap-1.5 backdrop-blur-sm border border-white/10">
                  <Maximize2 className="w-3 h-3 text-[var(--brand-accent)]" />
                  <span>Inspect Media</span>
                </div>

                {/* Sort / Item Index Counter */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-semibold text-white/80">
                  #{index + 1}
                </div>
              </div>

              {/* Caption & Metadata Details */}
              {(item.captionEn || item.captionAr || item.credit) && (
                <CardContent className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    {item.captionEn && (
                      <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed line-clamp-2">
                        {item.captionEn}
                      </p>
                    )}
                    {item.captionAr && (
                      <p className="font-arabic text-xs text-[var(--brand-accent)] text-right font-medium line-clamp-1" dir="rtl">
                        {item.captionAr}
                      </p>
                    )}
                  </div>

                  {item.credit && (
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                      <Camera className="w-3 h-3 text-[var(--brand-accent)]" />
                      <span className="truncate">Credit: {item.credit}</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Accessible Fullscreen Lightbox */}
      <MediaLightbox
        items={media}
        initialIndex={selectedIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        albumTitleEn={albumTitleEn}
        albumTitleAr={albumTitleAr}
        academicYear={academicYear}
        location={location}
      />
    </>
  );
}
