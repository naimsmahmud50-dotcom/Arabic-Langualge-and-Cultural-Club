/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/home/IntroductionSection.tsx
 * Module: Institutional Overview - The Purpose & Four Pillars of Our Society
 * Institution: Kabi Nazrul Government College, Dhaka (شاعر نذر الإسلام كلية حكومية، دكا)
 * Society: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
 * 
 * ARCHITECTURAL ROLE & SPECIFICATION:
 * - Introduces the foundational mandate and core ethos of the Arabic Language & Cultural Club.
 * - Outlines the Four Pillars:
 *   1. Linguistic Eloquence (الفصاحة والبلاغة) -> /events
 *   2. Historical Preservation (حفظ التراث والتوثيق) -> /history
 *   3. Ethical Leadership (القيادة الرشيدة) -> /leadership
 *   4. Scholarly Engagement (النشر والبحث العلمي) -> /publications
 * - Responsive Hybrid Architecture:
 *   - Desktop (lg screens, >= 1024px): High-end 4-column balanced card grid layout with all four pillars visible simultaneously.
 *   - Mobile & Tablet (< 1024px): Seamless touch-swipeable carousel with real-time drag feedback,
 *     smooth transitions, pagination indicator dots with roving tabindex, accessible next/previous navigation controls,
 *     and gentle auto-play that auto-resets on navigation and pauses on touch, hover, focus, or user preference.
 * - Aesthetic Polish:
 *   - Classical 8-fold Islamic Geometric Star Rosette SVG watermark combined with Arabic calligraphic text glyphs.
 *   - Heritage gold accent border (var(--brand-accent)) and elegant soft ambient glow on hover and active state.
 *   - Substantial viewport shadow padding to eliminate clipping of card elevation and ambient glow.
 *   - Subtle icon scale and 6-degree rotate micro-interaction with card lift animation.
 *   - Clear typography hierarchy: English title, Noto Naskh Arabic subtitle, micro-divider, and descriptive narrative.
 *   - Strictly human vibe; zero AI emojis; full WCAG AA compliance with inert off-screen slides.
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Badge, Button, HeritageDivider, GeometricPattern } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import {
  BookOpen,
  History,
  Users,
  Award,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { type SiteSettings } from "@/lib/types/settings";

export interface IntroductionSectionProps {
  settings?: SiteSettings;
}

interface PillarItem {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  titleEn: string;
  titleAr: string;
  watermarkAr: string;
  desc: string;
  actionText: string;
  href: string;
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

interface PillarCardProps {
  pillar: PillarItem;
  isActive?: boolean;
  isFocusable?: boolean;
  isSwipingRef?: React.RefObject<boolean>;
  className?: string;
}

function PillarCard({
  pillar,
  isActive = false,
  isFocusable = true,
  isSwipingRef,
  className,
}: PillarCardProps) {
  const Icon = pillar.icon;

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
          {pillar.watermarkAr}
        </span>
      </div>

      {/* Card Header & Content */}
      <div className="relative z-10 space-y-4">
        {/* Icon & Pillar Number Badge */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center border transition-all duration-300",
              isActive
                ? "bg-[var(--brand-accent)] text-white dark:bg-[var(--brand-accent)] dark:text-[#17211D] border-[var(--brand-accent)] shadow-md scale-105"
                : "bg-[var(--brand-primary)]/10 dark:bg-[var(--brand-accent)]/15 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] border-[var(--brand-primary)]/15 dark:border-[var(--brand-accent)]/25 group-hover:bg-[var(--brand-accent)] group-hover:text-white dark:group-hover:bg-[var(--brand-accent)] dark:group-hover:text-[#17211D] group-hover:scale-105 group-hover:shadow-md"
            )}
          >
            <Icon
              className={cn(
                "w-6 h-6 transition-transform duration-300",
                isActive ? "rotate-6" : "group-hover:rotate-6"
              )}
            />
          </div>
          <span
            className={cn(
              "text-[11px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full uppercase transition-colors duration-300",
              isActive
                ? "bg-[var(--brand-accent)]/20 text-[var(--brand-accent-text)] border border-[var(--brand-accent)]/50"
                : "bg-[var(--brand-accent)]/10 text-[var(--brand-accent-text)] border border-[var(--brand-accent)]/25"
            )}
          >
            Pillar {pillar.number}
          </span>
        </div>

        {/* Pillar English Title & Noto Naskh Arabic Subtitle */}
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight leading-snug group-hover:text-[var(--brand-primary)] dark:group-hover:text-[var(--brand-accent)] transition-colors">
            {pillar.titleEn}
          </h3>
          <p
            className="font-arabic text-sm sm:text-base text-[var(--brand-accent-text)] font-semibold leading-normal"
            dir="rtl"
          >
            {pillar.titleAr}
          </p>
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

        {/* Descriptive Narrative Copy */}
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          {pillar.desc}
        </p>
      </div>

      {/* Action Destination Link */}
      <div className="relative z-10 pt-4 mt-6 border-t border-[var(--border-subtle)]">
        <Link
          href={pillar.href}
          tabIndex={isFocusable === false ? -1 : undefined}
          aria-hidden={isFocusable === false ? true : undefined}
          onClick={(e) => {
            if (isSwipingRef?.current) {
              e.preventDefault();
            }
          }}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)] hover:text-[var(--brand-accent-hover)] dark:hover:text-[var(--brand-primary-hover)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] rounded py-1 px-1 -mx-1 group/link"
        >
          <span>{pillar.actionText}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}

export function IntroductionSection({ settings }: IntroductionSectionProps) {
  const badgeText = settings?.mission_badge_en || "Foundational Mandate";
  const titleText =
    settings?.mission_title_en || "The Purpose & Four Pillars of Our Society";
  const subtitleText =
    settings?.mission_subtitle_ar ||
    "«إِنَّ مِنَ الْبَيَانِ لَسِحْرًا» • أربعة أركان تقوم عليها مسيرتنا في كلية كابي نذرول الحكومية";
  const descText =
    settings?.mission_desc_en ||
    "Founded as the premier collegiate society at Kabi Nazrul Government College, Dhaka, the Arabic Language & Cultural Club provides an intellectually rigorous sanctuary for the mastery, celebration, and dissemination of classical Arabic letters.";

  const pillars: PillarItem[] = [
    {
      number: "01",
      icon: BookOpen,
      titleEn: "Linguistic Eloquence",
      titleAr: "الفصاحة والبلاغة",
      watermarkAr: "فصاحة",
      desc: "Deep immersion in classical Arabic grammar (Nahw), morphology (Sarf), rhetoric (Balaghah), and prose comprehension.",
      actionText: "Explore Masterclasses & Workshops",
      href: "/events",
    },
    {
      number: "02",
      icon: History,
      titleEn: "Historical Preservation",
      titleAr: "حفظ التراث والتوثيق",
      watermarkAr: "تراث",
      desc: "An enduring institutional archive preserving founding manuscripts, committee lineages, and student scholarly work.",
      actionText: "Inspect Historical Archives",
      href: "/history",
    },
    {
      number: "03",
      icon: Users,
      titleEn: "Ethical Leadership",
      titleAr: "القيادة الرشيدة",
      watermarkAr: "قيادة",
      desc: "Orderly democratic governance, inter-generational mentorship between senior fellows and newcomers, and executive discipline.",
      actionText: "View Leadership Lineage",
      href: "/leadership",
    },
    {
      number: "04",
      icon: Award,
      titleEn: "Scholarly Engagement",
      titleAr: "النشر والبحث العلمي",
      watermarkAr: "معرفة",
      desc: "Publishing peer-reviewed student journals, hosting national Arabic debate competitions, and public academic symposiums.",
      actionText: "Access Academic Publications",
      href: "/publications",
    },
  ];

  // Carousel interactive state for mobile/tablet (< 1024px)
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
        // Fallback for legacy WebKit
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

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % pillars.length);
  }, [pillars.length]);

  const goToPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + pillars.length) % pillars.length);
  }, [pillars.length]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Gentle auto-play timer: resets on slide index change and pauses on interaction
  useEffect(() => {
    if (
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
    isPaused,
    isHovered,
    isTouching,
    isFocused,
    prefersReducedMotion,
    goToNext,
  ]);

  // Touch gesture handlers with real-time drag tracking & multi-touch exclusion
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;

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
      e.touches.length !== 1
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
        (activeIndex === pillars.length - 1 && diffX < 0)
      ) {
        responsiveDiffX = diffX * 0.35;
      }
      setDragOffset(responsiveDiffX);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null) {
      setIsTouching(false);
      return;
    }

    if (touchDirectionRef.current === "horizontal") {
      // 40px swipe trigger threshold
      if (dragOffset < -40) {
        goToNext();
      } else if (dragOffset > 40) {
        goToPrev();
      }
    }

    setDragOffset(0);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchDirectionRef.current = null;

    // Guard against accidental link clicks triggered immediately after a swipe
    if (swipeClickPreventTimeoutRef.current) {
      clearTimeout(swipeClickPreventTimeoutRef.current);
    }
    swipeClickPreventTimeoutRef.current = setTimeout(() => {
      isSwipingRef.current = false;
    }, 100);

    // Settling buffer before resuming gentle auto-advance
    if (touchPauseTimeoutRef.current) {
      clearTimeout(touchPauseTimeoutRef.current);
    }
    touchPauseTimeoutRef.current = setTimeout(() => {
      setIsTouching(false);
      touchPauseTimeoutRef.current = null;
    }, 3500);
  };

  const handleTouchCancel = () => {
    setDragOffset(0);
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchDirectionRef.current = null;
    isSwipingRef.current = false;
    setIsTouching(false);
    if (touchPauseTimeoutRef.current) {
      clearTimeout(touchPauseTimeoutRef.current);
      touchPauseTimeoutRef.current = null;
    }
  };

  // Keyboard accessibility controls for carousel region
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToNext();
    } else if (e.key === "Home") {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goToSlide(pillars.length - 1);
    }
  };

  return (
    <section
      className="relative py-12 sm:py-16 lg:py-24 bg-[var(--bg-primary)] border-b border-[var(--border-color)] overflow-hidden"
      aria-label="Introduction to the Club & Four Pillars"
    >
      {/* Decorative Heritage Motif Background Watermark */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 w-96 h-96 pointer-events-none select-none opacity-[0.03] dark:opacity-[0.05]"
      >
        <GeometricPattern />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16 space-y-3 sm:space-y-4">
          <Badge variant="accent" size="sm">
            {badgeText}
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] font-serif leading-tight">
            {titleText}
          </h2>
          <p
            className="font-arabic text-sm sm:text-base lg:text-lg text-[var(--brand-accent-text)] font-semibold leading-relaxed"
            dir="rtl"
          >
            {subtitleText}
          </p>
          <p className="text-xs sm:text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            {descText}
          </p>
        </div>

        {/* 1. Desktop View: High-End 4-Column Balanced Card Grid (lg screens >= 1024px) */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6">
          {pillars.map((pillar) => (
            <PillarCard key={pillar.number} pillar={pillar} isFocusable={true} />
          ))}
        </div>

        {/* 2. Mobile & Tablet View: Touch-Swipeable Carousel (< 1024px) */}
        <div className="block lg:hidden max-w-lg sm:max-w-xl md:max-w-2xl mx-auto">
          <div
            className="relative outline-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocusCapture={() => setIsFocused(true)}
            onBlurCapture={() => setIsFocused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            onKeyDown={handleKeyDown}
            role="region"
            aria-roledescription="carousel"
            aria-label="The Four Pillars of Our Society"
          >
            {/* Screen Reader Live Announcer */}
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              {isPaused
                ? `Slide ${activeIndex + 1} of ${pillars.length}: ${pillars[activeIndex].titleEn} (Auto-advance paused)`
                : `Slide ${activeIndex + 1} of ${pillars.length}: ${pillars[activeIndex].titleEn}`}
            </div>

            {/* Slide Track Viewport with Shadow Buffer and Pan-Y Touch Handling */}
            <div className="overflow-hidden py-4 px-2 -my-4 -mx-2 touch-pan-y">
              <div
                className={cn(
                  "flex will-change-transform items-stretch",
                  dragOffset === 0 &&
                    !prefersReducedMotion &&
                    "transition-transform duration-500 ease-out"
                )}
                style={{
                  transform:
                    dragOffset !== 0
                      ? `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`
                      : `translateX(-${activeIndex * 100}%)`,
                }}
                dir="ltr"
              >
                {pillars.map((pillar, idx) => (
                  <div
                    key={pillar.number}
                    id={`pillar-slide-${idx}`}
                    className="w-full shrink-0 px-2 sm:px-3 h-full"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Pillar ${idx + 1} of ${pillars.length}: ${pillar.titleEn}`}
                    aria-hidden={idx !== activeIndex}
                  >
                    <PillarCard
                      pillar={pillar}
                      isActive={idx === activeIndex}
                      isFocusable={idx === activeIndex}
                      isSwipingRef={isSwipingRef}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Navigation & Pagination Controls Bar */}
            <div className="mt-4 sm:mt-6 flex items-center justify-between gap-3 px-2">
              {/* Previous Button */}
              <button
                type="button"
                onClick={goToPrev}
                aria-label="Previous pillar"
                className="w-10 h-10 rounded-full border border-[var(--border-color)] dark:border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Center: Pagination Dots & Counter */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="flex items-center gap-1.5"
                  role="tablist"
                  aria-label="Pillars slides"
                >
                  {pillars.map((p, idx) => (
                    <button
                      key={p.number}
                      type="button"
                      role="tab"
                      id={`pillar-tab-${idx}`}
                      aria-selected={idx === activeIndex}
                      aria-controls={`pillar-slide-${idx}`}
                      tabIndex={idx === activeIndex ? 0 : -1}
                      aria-label={`Go to slide ${idx + 1}: ${p.titleEn}`}
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
                  0{activeIndex + 1} / 0{pillars.length}
                </div>
              </div>

              {/* Right: Pause/Resume Toggle & Next Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePause}
                  aria-label={
                    isPaused
                      ? "Resume pillar auto-advance"
                      : "Pause pillar auto-advance"
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
                  aria-label="Next pillar"
                  className="w-10 h-10 rounded-full border border-[var(--border-color)] dark:border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Heritage Divider */}
        <HeritageDivider className="max-w-md mx-auto mt-12 sm:mt-14 opacity-50" />

        {/* Charter Exploration Link */}
        <div className="text-center">
          <Link href="/about">
            <Button
              variant="outline"
              size="md"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Read Our Constitution & Full Institutional Charter
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
