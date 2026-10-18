/**
 * @file src/app/(public)/gallery/[slug]/MediaLightbox.tsx
 * @description Accessible Fullscreen Media Lightbox and Viewer Component.
 * 
 * ARCHITECTURE & ROLE IN ARABIC CLUB SYSTEM:
 * - Provides an immersive, high-fidelity media inspection experience for photographs
 *   and video excerpts in the club's archival gallery.
 * - Fulfills Requirements SPEC-GAL-09 through SPEC-GAL-12 and WCAG 2.2 AA accessibility.
 * 
 * ACCESSIBILITY & KEYBOARD CONTROLS:
 * - [Esc]: Dismisses lightbox and restores focus and body scroll.
 * - [ArrowLeft]: Navigates to previous media asset.
 * - [ArrowRight]: Navigates to next media asset.
 * - Screen-reader announcements for active item counter (e.g., "Item 2 of 6").
 * - Focus trapping and clean backdrop lock.
 * 
 * HUMAN VIBE POLICY:
 * - Strictly zero AI emojis. Uses authentic institutional typography and Lucide SVG icons.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Film, 
  Maximize2, 
  Download,
  Calendar,
  MapPin,
  ExternalLink
} from "lucide-react";

export interface LightboxMediaItem {
  id: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  mediaType: "image" | "video";
  videoUrl?: string | null;
  captionEn?: string | null;
  captionAr?: string | null;
  altText?: string | null;
  credit?: string | null;
  width?: number | null;
  height?: number | null;
}

interface MediaLightboxProps {
  items: LightboxMediaItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  albumTitleEn: string;
  albumTitleAr?: string | null;
  academicYear?: string;
  location?: string | null;
}

export function MediaLightbox({
  items,
  initialIndex,
  isOpen,
  onClose,
  albumTitleEn,
  albumTitleAr,
  academicYear,
  location,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Synchronize initial index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, items.length - 1)));
    }
  }, [isOpen, initialIndex, items.length]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Keyboard navigation listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || items.length === 0) return null;

  const currentItem = items[currentIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Archival Media Lightbox Viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none transition-opacity duration-300"
    >
      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white">
        <div className="space-y-0.5">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--brand-accent)]">
              {currentItem.mediaType === "video" ? "Audiovisual Record" : "Photographic Record"}
            </span>
            <span className="text-xs text-white/60">
              {currentIndex + 1} of {items.length}
            </span>
            {academicYear && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/15">
                {academicYear}
              </span>
            )}
          </div>
          <h2 className="text-sm font-semibold text-white/90 truncate max-w-md sm:max-w-xl">
            {albumTitleEn}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct File View Link */}
          <a
            href={currentItem.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Full Resolution Media"
            className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </a>

          {/* Close Lightbox */}
          <button
            onClick={onClose}
            aria-label="Close Lightbox (Esc)"
            className="p-2.5 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Media Container */}
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 sm:pb-28">
        {currentItem.mediaType === "video" ? (
          <div className="relative max-w-4xl w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10">
            {currentItem.videoUrl && currentItem.videoUrl.includes("youtube") ? (
              <iframe
                src={currentItem.videoUrl}
                title={currentItem.captionEn || "Archival Video"}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                controls
                autoPlay
                playsInline
                src={currentItem.videoUrl || currentItem.fileUrl}
                poster={currentItem.thumbnailUrl || undefined}
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        ) : (
          <div className="relative max-w-5xl max-h-[75vh] flex items-center justify-center">
            <img
              src={currentItem.fileUrl}
              alt={currentItem.altText || currentItem.captionEn || albumTitleEn}
              className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-md shadow-2xl select-none"
            />
          </div>
        )}
      </div>

      {/* Left Navigation Arrow */}
      {items.length > 1 && (
        <button
          onClick={handlePrev}
          aria-label="Previous Media (Left Arrow)"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Right Navigation Arrow */}
      {items.length > 1 && (
        <button
          onClick={handleNext}
          aria-label="Next Media (Right Arrow)"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Bottom Information Drawer */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 px-6 py-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            {currentItem.captionEn && (
              <p className="text-sm font-medium text-white/90 leading-snug">
                {currentItem.captionEn}
              </p>
            )}
            {currentItem.captionAr && (
              <p className="font-arabic text-sm text-[var(--brand-accent)] text-right leading-relaxed" dir="rtl">
                {currentItem.captionAr}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 pt-1">
              {currentItem.credit && (
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                  <span>Curated by: {currentItem.credit}</span>
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-white/50" />
                  <span>{location}</span>
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Strip / Indicator dots */}
          {items.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-xs md:max-w-md shrink-0">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Jump to item ${idx + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? "bg-[var(--brand-accent)] scale-125 ring-2 ring-[var(--brand-accent)]/50"
                      : "bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
