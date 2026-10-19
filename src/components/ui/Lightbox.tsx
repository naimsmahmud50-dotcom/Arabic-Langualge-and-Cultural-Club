/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/ui/Lightbox.tsx
 * Module: Design System Shared UI Primitives
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/ui/Lightbox.tsx
 * @description Accessible photographic lightbox modal with keyboard navigation (Esc, Arrow keys) and zoom focus.
 */

"use client";

import React, { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  titleAr?: string;
  caption?: string;
  currentIndex?: number;
  total?: number;
  onPrev?: () => void;
  onNext?: () => void;
}

export function Lightbox({
  isOpen,
  onClose,
  src,
  alt,
  titleAr,
  caption,
  currentIndex,
  total,
  onPrev,
  onNext,
}: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
      if (e.key === "ArrowRight" && onNext) onNext();
    },
    [onClose, onPrev, onNext]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="High-resolution image viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-6 animate-fade-in-up"
      onClick={onClose}
    >
      {/* Top Header Bar */}
      <div
        className="absolute top-4 inset-x-4 sm:inset-x-6 flex items-center justify-between text-white z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          {currentIndex !== undefined && total !== undefined && (
            <span className="text-xs font-mono bg-white/10 px-2.5 py-1 rounded-[4px] border border-white/20 text-[#E5BE6A]">
              {currentIndex + 1} / {total}
            </span>
          )}
          <span className="text-sm font-semibold truncate max-w-xs sm:max-w-md text-white/90">
            {alt}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {src && (
            <a
              href={src}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Download original asset"
            >
              <Download className="w-5 h-5" />
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close image viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute start-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all z-10 hidden sm:flex items-center justify-center"
          aria-label="Previous photograph"
        >
          <ChevronLeft className="w-6 h-6 rtl-mirror" />
        </button>
      )}

      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute end-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all z-10 hidden sm:flex items-center justify-center"
          aria-label="Next photograph"
        >
          <ChevronRight className="w-6 h-6 rtl-mirror" />
        </button>
      )}

      {/* Main Image Frame */}
      <div
        className="relative max-w-5xl max-h-[80vh] w-full h-full flex flex-col items-center justify-center my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-[70vh]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="90vw"
            className="object-contain drop-shadow-2xl select-none"
            priority
          />
        </div>

        {(caption || titleAr) && (
          <div className="mt-4 text-center space-y-1 max-w-2xl px-4">
            {titleAr && (
              <p className="font-arabic text-base text-[#E5BE6A]" dir="rtl">
                {titleAr}
              </p>
            )}
            {caption && (
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                {caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
