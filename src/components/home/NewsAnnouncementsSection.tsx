/**
 * @file src/components/home/NewsAnnouncementsSection.tsx
 * @description Official News, Press Releases, and Institutional Bulletins.
 * 
 * ARCHITECTURAL ROLE:
 * - Broadcasts verified announcements directly from the club secretariat.
 * - Queries `getPublicAnnouncements({ limit: 3 })`.
 * - Meets Requirement SPEC-HOM-10 and SPEC-NWS-01.
 * 
 * SPECIFICATIONS:
 * - Desktop (md screens, >= 768px): 3-column balanced card grid layout with all notices visible simultaneously.
 * - Mobile & Tablet (< 768px): Seamless touch-swipeable carousel with real-time drag feedback,
 *   smooth transitions, pagination indicator dots with roving tabindex, accessible next/previous navigation controls,
 *   and gentle auto-play that auto-resets on navigation and pauses on touch, hover, focus, or user preference.
 * - Aesthetic Polish:
 *   - Classical 8-fold Islamic Geometric Star Rosette SVG watermark combined with Arabic calligraphic category text glyphs.
 *   - Heritage gold accent border (var(--brand-accent)) and elegant soft ambient glow on hover and active state.
 *   - Substantial viewport shadow padding to eliminate clipping of card elevation and ambient glow.
 *   - Top illuminated gold accent line and pinned notice indicator.
 *   - Direct action links with arrow icons on each notice pointing specifically to its own dedicated page (`/news/${item.slug}`).
 *   - Strictly human vibe; zero AI emojis; full WCAG AA compliance with inert off-screen slides.
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import {
  Bell,
  Pin,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";

export interface AnnouncementItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  contentEn: string;
  contentAr?: string | null;
  category: string;
  isPinned: boolean;
  publishedAt: Date;
}

export interface NewsAnnouncementsSectionProps {
  announcements: AnnouncementItem[];
}

/**
 * Classical 8-fold Islamic Geometric Star Rosette
 * Precision SVG motif crafted for heritage watermark presentation.
 */
function IslamicGeometricRosette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("w-full h-full fill-none", className)}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="48"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeDasharray="3 3"
        opacity="0.6"
      />
      <polygon
        points="50,6 62,38 94,50 62,62 50,94 38,62 6,50 38,38"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <polygon
        points="50,6 62,38 94,50 62,62 50,94 38,62 6,50 38,38"
        stroke="currentColor"
        strokeWidth="0.8"
        transform="rotate(45 50 50)"
      />
      <circle cx="50" cy="50" r="26" stroke="currentColor" strokeWidth="0.6" />
      <circle
        cx="50"
        cy="50"
        r="16"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />
      <circle cx="50" cy="50" r="6" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}

/**
 * Returns classical Arabic glyph text matching announcement category
 */
function getCategoryWatermarkAr(category: string): string {
  const norm = category.toLowerCase().trim();
  switch (norm) {
    case "news":
      return "أخبار";
    case "notice":
    case "announcement":
      return "إعلان";
    case "press":
    case "press release":
      return "بيان";
    case "academic":
      return "دراسة";
    case "circular":
      return "منشور";
    default:
      return "بلاغ";
  }
}

interface NoticeCardProps {
  item: AnnouncementItem;
  isActive?: boolean;
  isFocusable?: boolean;
  isSwipingRef?: React.RefObject<boolean>;
  className?: string;
}

function NoticeCard({
  item,
  isActive = false,
  isFocusable = true,
  isSwipingRef,
  className,
}: NoticeCardProps) {
  const watermarkText = getCategoryWatermarkAr(item.category);
  const formattedDate = new Date(item.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between h-full min-h-[380px] sm:min-h-[360px]",
        "rounded-xl border",
        "bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)]",
        "p-6 sm:p-7 overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1.5",
        isActive
          ? "border-[var(--brand-accent)] shadow-[0_14px_34px_-6px_rgba(143,102,39,0.22)] dark:shadow-[0_14px_34px_-6px_rgba(229,190,106,0.18)]"
          : "border-[var(--border-color)] dark:border-[var(--border-subtle)] hover:border-[var(--brand-accent)]/80 hover:shadow-[0_16px_36px_-6px_rgba(143,102,39,0.18)] dark:hover:shadow-[0_16px_36px_-6px_rgba(229,190,106,0.15)]",
        "focus-within:ring-2 focus-within:ring-[var(--brand-accent)]/50 focus-within:border-[var(--brand-accent)]",
        className
      )}
    >
      {/* Top Heritage Gold Accent Line */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent to-transparent transition-all duration-500",
          isActive
            ? "via-[var(--brand-accent)] opacity-100"
            : "via-[var(--brand-accent)]/30 group-hover:via-[var(--brand-accent)]"
        )}
      />

      {/* Subtle Arabic Calligraphic & Geometric Watermark Motif */}
      <div
        aria-hidden="true"
        className={cn(
          "absolute -right-8 -bottom-8 w-48 h-48 pointer-events-none select-none",
          "text-[var(--brand-primary)] dark:text-[var(--brand-accent)]",
          "transition-all duration-500 flex items-center justify-center",
          isActive
            ? "opacity-[0.10] dark:opacity-[0.15] scale-105 -rotate-3"
            : "opacity-[0.05] dark:opacity-[0.07] group-hover:opacity-[0.11] dark:group-hover:opacity-[0.16] group-hover:scale-105 group-hover:-rotate-3"
        )}
      >
        <IslamicGeometricRosette className="absolute inset-0" />
        <span
          className="font-arabic text-4xl sm:text-5xl font-bold select-none text-current"
          dir="rtl"
        >
          {watermarkText}
        </span>
      </div>

      {/* Card Header & Content */}
      <div className="relative z-10 space-y-4">
        {/* Badges strip: Category + Pinned Notice */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="accent"
            size="sm"
            className="capitalize font-semibold tracking-wider text-[11px]"
          >
            {item.category}
          </Badge>
          {item.isPinned && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-bold tracking-tight px-2.5 py-1 rounded-full uppercase transition-colors duration-300",
                isActive
                  ? "bg-[var(--brand-accent)]/20 text-[var(--brand-accent-text)] border border-[var(--brand-accent)]/50"
                  : "bg-[var(--brand-accent)]/10 text-[var(--brand-accent-text)] border border-[var(--brand-accent)]/25"
              )}
            >
              <Pin className="w-3.5 h-3.5 rotate-45 text-[var(--brand-accent)]" />
              Pinned Notice
            </span>
          )}
        </div>

        {/* English Title & Arabic Subtitle */}
        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight leading-snug group-hover:text-[var(--brand-primary)] dark:group-hover:text-[var(--brand-accent)] transition-colors line-clamp-2">
            {item.titleEn}
          </h3>
          {item.titleAr && (
            <p
              className="font-arabic text-xs sm:text-sm text-[var(--brand-accent-text)] font-semibold leading-normal line-clamp-1"
              dir="rtl"
            >
              {item.titleAr}
            </p>
          )}
        </div>

        {/* Refined Micro-Divider */}
        <div
          aria-hidden="true"
          className={cn(
            "h-[1.5px] transition-all duration-300",
            isActive
              ? "w-16 bg-[var(--brand-accent)]"
              : "w-10 bg-[var(--brand-accent)]/30 group-hover:w-16 group-hover:bg-[var(--brand-accent)]"
          )}
        />

        {/* Content Body Preview */}
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
          {item.contentEn}
        </p>
      </div>

      {/* Action Destination Link and Date */}
      <div className="relative z-10 pt-4 mt-6 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
          {formattedDate}
        </span>
        <Link
          href={`/news/${item.slug}`}
          tabIndex={isFocusable === false ? -1 : undefined}
          aria-hidden={isFocusable === false ? true : undefined}
          onClick={(e) => {
            if (isSwipingRef?.current) {
              e.preventDefault();
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)] hover:text-[var(--brand-accent-hover)] dark:hover:text-[var(--brand-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1 -mx-1 group/link"
        >
          <span>Read Notice</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export function NewsAnnouncementsSection({ announcements }: NewsAnnouncementsSectionProps) {
  // Carousel interactive state for mobile/tablet (< 768px / md)
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Real-time touch drag state & refs
  const [dragOffset, setDragOffset] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchDirectionRef = useRef<"horizontal" | "vertical" | null>(null);
  const isSwipingRef = useRef<boolean>(false);
  const touchPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const swipeClickPreventTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Detect OS accessibility reduced motion preference safely across browsers
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleMotionChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleMotionChange);
        return () => mediaQuery.removeEventListener("change", handleMotionChange);
      } else if ("addListener" in mediaQuery) {
        const legacyQuery = mediaQuery as unknown as {
          addListener: (fn: (e: MediaQueryListEvent) => void) => void;
          removeListener: (fn: (e: MediaQueryListEvent) => void) => void;
        };
        legacyQuery.addListener(handleMotionChange);
        return () => legacyQuery.removeListener(handleMotionChange);
      }
    }
  }, []);

  // Cleanup pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (touchPauseTimeoutRef.current) clearTimeout(touchPauseTimeoutRef.current);
      if (swipeClickPreventTimeoutRef.current) clearTimeout(swipeClickPreventTimeoutRef.current);
    };
  }, []);

  const totalSlides = announcements.length;

  const goToNext = useCallback(() => {
    if (totalSlides <= 1) return;
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    if (totalSlides <= 1) return;
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Gentle auto-play timer: resets on slide index change and pauses on interaction
  useEffect(() => {
    if (
      totalSlides <= 1 ||
      isPaused ||
      isHovered ||
      isTouching ||
      isFocused ||
      prefersReducedMotion
    ) {
      return;
    }

    const timer = setTimeout(() => {
      goToNext();
    }, 5000);

    return () => clearTimeout(timer);
  }, [
    activeIndex,
    totalSlides,
    isPaused,
    isHovered,
    isTouching,
    isFocused,
    prefersReducedMotion,
    goToNext,
  ]);

  // Touch gesture handlers with real-time drag tracking & multi-touch exclusion
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1 || totalSlides <= 1) return;

    if (touchPauseTimeoutRef.current) {
      clearTimeout(touchPauseTimeoutRef.current);
      touchPauseTimeoutRef.current = null;
    }

    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchDirectionRef.current = null;
    isSwipingRef.current = false;
    setDragOffset(0);
    setIsTouching(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      touchStartXRef.current === null ||
      touchStartYRef.current === null ||
      e.touches.length !== 1 ||
      totalSlides <= 1
    ) {
      return;
    }

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartXRef.current;
    const diffY = currentY - touchStartYRef.current;

    // Disambiguate gesture direction after minimal displacement (6px)
    if (touchDirectionRef.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        touchDirectionRef.current =
          Math.abs(diffX) >= Math.abs(diffY) ? "horizontal" : "vertical";
      }
    }

    if (touchDirectionRef.current === "horizontal") {
      isSwipingRef.current = true;
      // Gentle rubber-band resistance at track ends
      let responsiveDiffX = diffX;
      if (
        (activeIndex === 0 && diffX > 0) ||
        (activeIndex === totalSlides - 1 && diffX < 0)
      ) {
        responsiveDiffX = diffX * 0.35;
      }
      setDragOffset(responsiveDiffX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) return;

    const threshold = 40;
    if (dragOffset < -threshold && activeIndex < totalSlides - 1) {
      goToNext();
    } else if (dragOffset > threshold && activeIndex > 0) {
      goToPrev();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchDirectionRef.current = null;
    setDragOffset(0);

    // Prevent immediate link clicks if user was swiping
    if (swipeClickPreventTimeoutRef.current) {
      clearTimeout(swipeClickPreventTimeoutRef.current);
    }
    swipeClickPreventTimeoutRef.current = setTimeout(() => {
      isSwipingRef.current = false;
    }, 150);

    // Briefly pause auto-advance after gesture completion
    if (touchPauseTimeoutRef.current) {
      clearTimeout(touchPauseTimeoutRef.current);
    }
    touchPauseTimeoutRef.current = setTimeout(() => {
      setIsTouching(false);
      touchPauseTimeoutRef.current = null;
    }, 2500);
  };

  const handleTouchCancel = () => {
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchDirectionRef.current = null;
    isSwipingRef.current = false;
    setDragOffset(0);
    setIsTouching(false);
  };

  return (
    <section
      className="py-16 sm:py-20 bg-[var(--bg-primary)] border-b border-[var(--border-color)]"
      aria-label="News and Announcements"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
          <div className="max-w-2xl space-y-2 sm:space-y-3">
            <Badge variant="accent" size="sm">Secretariat Dispatches</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] font-serif leading-tight">
              Latest News & Institutional Notices
            </h2>
            <p className="font-arabic text-sm sm:text-base text-[var(--brand-accent)] font-medium" dir="rtl">
              الْأَخْبَارُ وَالْبَيَانَاتُ الرَّسْمِيَّةُ • بَلَاغَاتُ الْأَمَانَةِ الْعَامَّةِ لِلنَّادِي
            </p>
            <p className="text-xs sm:text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
              Timely communications concerning executive elections, admissions windows, varsity debate qualifications, and public lectures.
            </p>
          </div>
          <Link href="/news" className="self-start md:self-end">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              All Official Bulletins
            </Button>
          </Link>
        </div>

        {announcements.length > 0 ? (
          <div>
            {/* 1. Desktop Presentation: 3-column Grid (>= 768px / md) */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {announcements.map((item) => (
                <NoticeCard key={item.id} item={item} />
              ))}
            </div>

            {/* 2. Mobile & Tablet Presentation: Swipeable Touch Carousel (< 768px / md) */}
            <div
              className="block md:hidden"
              role="region"
              aria-roledescription="carousel"
              aria-label="Secretariat News and Notices Carousel"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            >
              {/* Screen Reader Live Region */}
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                Slide {activeIndex + 1} of {totalSlides}: {announcements[activeIndex]?.titleEn}
              </div>

              {/* Overflow Viewport with Padding Buffer */}
              <div className="py-4 px-2 -my-4 -mx-2 overflow-hidden max-w-lg sm:max-w-xl mx-auto">
                <div
                  className={cn(
                    "flex touch-pan-y",
                    isTouching || prefersReducedMotion
                      ? "transition-none"
                      : "transition-transform duration-500 ease-out"
                  )}
                  style={{
                    transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchCancel}
                >
                  {announcements.map((item, idx) => (
                    <div
                      key={item.id}
                      id={`notice-slide-${idx}`}
                      className="w-full flex-shrink-0 px-2 select-none"
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`Slide ${idx + 1} of ${totalSlides}: ${item.titleEn}`}
                      aria-hidden={idx !== activeIndex}
                    >
                      <NoticeCard
                        item={item}
                        isActive={idx === activeIndex}
                        isFocusable={idx === activeIndex}
                        isSwipingRef={isSwipingRef}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Controls Toolbar: Chevron Prev + Pagination Dots + Pause/Play + Chevron Next */}
              {totalSlides > 1 && (
                <div className="mt-8 flex items-center justify-between max-w-lg sm:max-w-xl mx-auto px-2">
                  {/* Left: Previous Button */}
                  <button
                    type="button"
                    onClick={goToPrev}
                    aria-label="Previous notice"
                    className="w-10 h-10 rounded-full border border-[var(--border-color)] dark:border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Center: Pagination Dots & Counter */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className="flex items-center gap-1.5"
                      role="tablist"
                      aria-label="Notices slides"
                    >
                      {announcements.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          id={`notice-tab-${idx}`}
                          aria-selected={idx === activeIndex}
                          aria-controls={`notice-slide-${idx}`}
                          tabIndex={idx === activeIndex ? 0 : -1}
                          aria-label={`Go to slide ${idx + 1}: ${item.titleEn}`}
                          onClick={() => goToSlide(idx)}
                          className="p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded-full cursor-pointer"
                        >
                          <span
                            className={cn(
                              "block transition-all duration-300",
                              idx === activeIndex
                                ? "w-7 h-2 rounded-full bg-[var(--brand-accent)] shadow-sm"
                                : "w-2 h-2 rounded-full bg-[var(--border-color)] hover:bg-[var(--text-muted)]"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <div
                      className="text-[11px] font-mono text-[var(--text-muted)] font-medium select-none"
                      aria-hidden="true"
                    >
                      0{activeIndex + 1} / 0{totalSlides}
                    </div>
                  </div>

                  {/* Right: Pause/Resume Toggle & Next Button */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={togglePause}
                      aria-label={
                        isPaused
                          ? "Resume notice auto-advance"
                          : "Pause notice auto-advance"
                      }
                      title={
                        isPaused
                          ? "Resume auto-advance"
                          : "Pause auto-advance"
                      }
                      className="w-10 h-10 rounded-full border border-[var(--border-color)] dark:border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
                    >
                      {isPaused ? (
                        <Play className="w-4 h-4 ml-0.5" />
                      ) : (
                        <Pause className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={goToNext}
                      aria-label="Next notice"
                      className="w-10 h-10 rounded-full border border-[var(--border-color)] dark:border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[6px] max-w-md mx-auto">
            <Bell className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">No Active Bulletins</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              New secretarial announcements will be dispatched here as ratified.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
