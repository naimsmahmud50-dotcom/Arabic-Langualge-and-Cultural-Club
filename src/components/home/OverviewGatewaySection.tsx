/**
 * @file src/components/home/OverviewGatewaySection.tsx
 * @description Central Navigation Gateway Hub for Institutional Society Divisions & Archives.
 * 
 * ARCHITECTURAL ROLE:
 * - Serves as the central navigational gateway connecting the root homepage (/) to dedicated standalone portals.
 * - Displays 6 primary institutional division cards with live summary metrics in an automatic, continuous carousel.
 * - Meets Requirement SPEC-HOM-09, SPEC-ARC-01, and SPEC-039.
 * 
 * SPECIFICATIONS:
 * - Continuous 5-Second Auto-Slide Carousel:
 *   - Automatically advances every 5 seconds in an infinite loop from right to left without requiring manual clicks.
 *   - Auto-pauses on hover, touch, focus, or when manually paused via the header toggle.
 *   - Responsive items per view:
 *     - Desktop (>= 1024px): 3 cards per view with smooth continuous horizontal translation.
 *     - Tablet (640px - 1023px): 2 cards per view.
 *     - Mobile (< 640px): 1 card per view with 1:1 real-time touch drag and rubber-band bounds.
 *   - Dual navigation controls: Floating desktop side arrows + header controls + bottom progress dots.
 * - Royal Islamic Heritage Aesthetics:
 *   - Replaces generic square icons with arched Moorish Mihrab medallions, gold foil trim, and keystone jewels.
 *   - Portal-specific Lucide SVG icons (Calendar, ImageIcon, BookOpen, Bell, Users, Award).
 *   - Metallic gold status ribbons with authentic Arabic labels (`الفعاليات • 1 Scheduled`, etc.).
 *   - Background 8-fold Islamic geometric rosette and calligraphic watermark (`البوابات الأكاديمية`).
 *   - Fully interactive portal cards with elevated micro-highlight preview banners and animated CTA arrows.
 * - Strictly human vibe; zero AI emojis; WCAG AA contrast compliance.
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import {
  Calendar,
  Image as ImageIcon,
  BookOpen,
  Bell,
  Award,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Sparkles,
} from "lucide-react";

export interface OverviewGatewaySectionProps {
  stats: {
    upcomingEventsCount: number;
    nextEventTitle?: string | null;
    nextEventDate?: string | null;
    albumsCount: number;
    latestAlbumTitle?: string | null;
    resourcesCount: number;
    announcementsCount: number;
    latestAnnouncementTitle?: string | null;
    activeTermTitle?: string | null;
    publicationsCount: number;
  };
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

export function OverviewGatewaySection({ stats }: OverviewGatewaySectionProps) {
  // Carousel state
  const [activeIndex, setActiveIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [stepPx, setStepPx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // DOM Refs
  const trackRef = useRef<HTMLDivElement>(null);

  // Touch gesture tracking refs
  const [dragOffset, setDragOffset] = useState<number>(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchDirectionRef = useRef<"horizontal" | "vertical" | null>(null);
  const isSwipingRef = useRef<boolean>(false);
  const touchPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const swipeClickPreventTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 6 Primary Institutional Gateway Portals
  const gateways = [
    {
      id: "portal_events",
      titleEn: "Academic Calendar & Events",
      titleAr: "التقويم الأكاديمي والفعاليات",
      description:
        "Official schedule of symposia, classical Arabic debates, seasonal lectures, and 12-month annual milestones.",
      icon: Calendar,
      monogramAr: "ت",
      href: "/events",
      badgeEn:
        stats.upcomingEventsCount > 0
          ? `${stats.upcomingEventsCount} Scheduled`
          : "Annual Schedule",
      badgeAr: "الفعاليات",
      highlight: stats.nextEventTitle
        ? `Next: ${stats.nextEventTitle}`
        : "Explore upcoming colloquia, varsity debates, and academic symposia",
      cta: "View Full Calendar & Events",
    },
    {
      id: "portal_gallery",
      titleEn: "Photo & Media Archive",
      titleAr: "أرشيف الصور والوسائط",
      description:
        "Permanent photographic documentation preserving club conferences, award ceremonies, and calligraphy exhibitions.",
      icon: ImageIcon,
      monogramAr: "ص",
      href: "/gallery",
      badgeEn: `${stats.albumsCount} Collections`,
      badgeAr: "الألبومات",
      highlight: stats.latestAlbumTitle
        ? `Featured: ${stats.latestAlbumTitle}`
        : "Curated photographic albums documenting varsity milestones",
      cta: "Explore Visual Archives",
    },
    {
      id: "portal_resources",
      titleEn: "Arabic Learning Resources",
      titleAr: "مركز الموارد اللغوية",
      description:
        "Classical linguistic treatises, Nahw & Sarf cheat sheets, rhetorical manuals (Balaghah), and vocabulary reference guides.",
      icon: BookOpen,
      monogramAr: "م",
      href: "/resources",
      badgeEn: `${stats.resourcesCount} Materials`,
      badgeAr: "المراجع",
      highlight:
        "Grammar, syntax, rhetoric, and classical literature reference materials available to all members",
      cta: "Browse Learning Library",
    },
    {
      id: "portal_news",
      titleEn: "Gazettes & Announcements",
      titleAr: "الإعلانات والبيانات الرسمية",
      description:
        "Official administrative communiqués, election notices, scholarly symposium calls, and gazette releases.",
      icon: Bell,
      monogramAr: "خ",
      href: "/news",
      badgeEn:
        stats.announcementsCount > 0
          ? `${stats.announcementsCount} Notices`
          : "Bulletins",
      badgeAr: "البيانات",
      highlight: stats.latestAnnouncementTitle
        ? `Latest: ${stats.latestAnnouncementTitle}`
        : "Official secretarial dispatches and governance communiqués",
      cta: "Read All Announcements",
    },
    {
      id: "portal_leadership",
      titleEn: "Founders & Governance",
      titleAr: "المؤسسون والمجالس الإدارية",
      description:
        "Permanent roll of honor recognizing founding conveners, faculty patrons, and academic term committee officeholders.",
      icon: Users,
      monogramAr: "ق",
      href: "/leadership",
      badgeEn: stats.activeTermTitle || "Governing Council",
      badgeAr: "المجلس",
      highlight:
        "Term-by-term historical preservation with verified officeholders and alumni records",
      cta: "View Leadership Roster",
    },
    {
      id: "portal_publications",
      titleEn: "Publications & Roll of Honor",
      titleAr: "المنشورات وسجل الشرف",
      description:
        "Official society periodicals including 'Al-Bayan', monographs, research papers, and varsity debate championship awards.",
      icon: Award,
      monogramAr: "ن",
      href: "/publications",
      badgeEn: `${stats.publicationsCount} Publications`,
      badgeAr: "الإصدارات",
      highlight:
        "Academic periodicals, peer-reviewed research, and distinguished collegiate honors",
      cta: "Inspect Publications & Awards",
    },
  ];

  // Responsive dimension & step measurement
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window === "undefined") return;

      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }

      if (trackRef.current) {
        const firstArticle = trackRef.current.querySelector("article");
        if (firstArticle) {
          const rect = firstArticle.getBoundingClientRect();
          // rect.width + 24px gap (gap-6)
          setStepPx(rect.width + 24);
        }
      }
    };

    updateDimensions();

    let ro: ResizeObserver | null = null;
    if (trackRef.current && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        updateDimensions();
      });
      ro.observe(trackRef.current);
    }

    window.addEventListener("resize", updateDimensions);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      if (ro) ro.disconnect();
    };
  }, [gateways.length]);

  // Detect OS accessibility reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);

      const handleMotionChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener("change", handleMotionChange);
      return () => mediaQuery.removeEventListener("change", handleMotionChange);
    }
  }, []);

  // Compute maximum index for carousel pagination
  const maxIndex = Math.max(0, gateways.length - visibleCards);

  // Keep active index within bounds on resize
  useEffect(() => {
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex);
    }
  }, [activeIndex, maxIndex]);

  const goToNext = useCallback(() => {
    if (gateways.length <= visibleCards) return;
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [gateways.length, visibleCards, maxIndex]);

  const goToPrev = useCallback(() => {
    if (gateways.length <= visibleCards) return;
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [gateways.length, visibleCards, maxIndex]);

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // 5-second continuous relaxed auto-advance timer
  useEffect(() => {
    if (
      isPaused ||
      isHovered ||
      isTouching ||
      isFocused ||
      prefersReducedMotion ||
      gateways.length <= visibleCards
    ) {
      return;
    }

    const timer = setInterval(() => {
      goToNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [
    isPaused,
    isHovered,
    isTouching,
    isFocused,
    prefersReducedMotion,
    gateways.length,
    visibleCards,
    goToNext,
  ]);

  // Touch handlers with real-time 1:1 drag and direction disambiguation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1 || gateways.length <= visibleCards) return;

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

    // Disambiguate gesture direction after 6px displacement
    if (touchDirectionRef.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        touchDirectionRef.current =
          Math.abs(diffX) >= Math.abs(diffY) ? "horizontal" : "vertical";
      }
    }

    if (touchDirectionRef.current === "horizontal") {
      isSwipingRef.current = true;
      let responsiveDiffX = diffX;
      if (
        (activeIndex === 0 && diffX > 0) ||
        (activeIndex === maxIndex && diffX < 0)
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

    if (swipeClickPreventTimeoutRef.current) {
      clearTimeout(swipeClickPreventTimeoutRef.current);
    }
    swipeClickPreventTimeoutRef.current = setTimeout(() => {
      isSwipingRef.current = false;
    }, 120);

    if (touchPauseTimeoutRef.current) {
      clearTimeout(touchPauseTimeoutRef.current);
    }
    touchPauseTimeoutRef.current = setTimeout(() => {
      setIsTouching(false);
      touchPauseTimeoutRef.current = null;
    }, 4000);
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

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goToPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goToNext();
    }
  };

  // Exact pixel step translation calculation with responsive fallback
  const translateStyle =
    stepPx > 0
      ? `translateX(calc(-${activeIndex * stepPx}px + ${dragOffset}px))`
      : `translateX(calc(-${activeIndex} * (100% + 24px) / ${visibleCards} + ${dragOffset}px))`;

  return (
    <section
      className="py-20 bg-[var(--bg-surface)] border-b border-[var(--border-color)] overflow-hidden"
      aria-label="Institutional Gateway Portals"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="accent" size="sm">
              Institutional Portals
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif tracking-tight leading-tight">
              Explore Society Divisions & Archives
            </h2>
            <p
              className="font-arabic text-sm sm:text-base text-[var(--brand-accent)] font-semibold"
              dir="rtl"
            >
              تصفح الأقسام الأكاديمية والفعاليات والأرشيف الرقمي المستقل
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Each major division operates as a dedicated standalone portal with full archival records, deep-linking, and independent filtering.
            </p>
          </div>

          {/* Action Links & Interactive Carousel Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
            {gateways.length > visibleCards && (
              <div
                className="inline-flex items-center gap-1.5 p-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] shadow-xs"
                role="group"
                aria-label="Gateway carousel controls"
              >
                <button
                  type="button"
                  onClick={goToPrev}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--brand-accent)] hover:text-white transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                  aria-label="Previous division slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePause}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--brand-accent)] hover:text-white transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                  aria-label={
                    isPaused ? "Resume auto-sliding portals" : "Pause auto-sliding portals"
                  }
                  title={isPaused ? "Play" : "Pause"}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={goToNext}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--brand-accent)] hover:text-white transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                  aria-label="Next division slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link href="/about">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="border-[var(--border-color)] hover:border-[var(--brand-accent)]"
              >
                View Institutional Charter
              </Button>
            </Link>
          </div>
        </div>

        {/* Carousel Viewport / Slider Container */}
        <div
          className="relative focus:outline-none py-2"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          aria-roledescription="carousel"
          aria-label="Society Divisions & Archives Carousel"
        >
          {/* Floating Side Navigation Arrows for Immediate Visual Clickability */}
          {gateways.length > visibleCards && (
            <>
              <button
                type="button"
                onClick={goToPrev}
                className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center bg-[var(--bg-surface-elevated)] hover:bg-[var(--brand-accent)] text-[var(--text-primary)] hover:text-white border border-[var(--border-color)] hover:border-[var(--brand-accent)] shadow-lg transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                aria-label="Slide previous portal"
                title="Previous portal"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center bg-[var(--bg-surface-elevated)] hover:bg-[var(--brand-accent)] text-[var(--text-primary)] hover:text-white border border-[var(--border-color)] hover:border-[var(--brand-accent)] shadow-lg transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                aria-label="Slide next portal"
                title="Next portal"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Sliding Track Wrapper */}
          <div className="overflow-hidden -mx-2 px-2 py-4">
            <div
              ref={trackRef}
              className={cn(
                "flex gap-6 will-change-transform",
                isTouching
                  ? "transition-none"
                  : "transition-transform duration-600 ease-out"
              )}
              style={{
                transform: translateStyle,
              }}
            >
              {gateways.map((item, index) => {
                const Icon = item.icon;
                const isVisibleInView =
                  index >= activeIndex && index < activeIndex + visibleCards;

                return (
                  <article
                    key={item.id}
                    className={cn(
                      "shrink-0 group relative flex flex-col justify-between",
                      "w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333333%-16px)]",
                      "p-6 sm:p-7 rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)]",
                      "shadow-[0_4px_20px_-2px_rgba(23,61,50,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(23,61,50,0.12)]",
                      "hover:border-[var(--brand-accent)]/60 transition-all duration-300",
                      "overflow-hidden select-none"
                    )}
                    aria-roledescription="slide"
                    aria-label={`${item.titleEn}, ${item.badgeEn}`}
                    aria-hidden={!isVisibleInView}
                  >
                    <Link href={item.href} className="flex-1 flex flex-col justify-between">
                      {/* Top Gold Foil Accent Border */}
                      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--brand-accent)]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Watermarks: 8-Fold Geometric Rosette & Calligraphic Emblem */}
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 opacity-5 dark:opacity-10 text-[var(--brand-accent)] pointer-events-none transition-transform duration-700 group-hover:scale-115">
                        <IslamicGeometricRosette />
                      </div>
                      <div
                        className="absolute top-4 right-5 font-arabic text-xl font-bold opacity-[0.04] dark:opacity-[0.08] text-[var(--brand-accent)] select-none pointer-events-none"
                        dir="rtl"
                      >
                        البوابات الأكاديمية
                      </div>

                      {/* Top Header: Royal Moorish Arched Medallion & Metallic Live Status Ribbon */}
                      <div className="flex items-start justify-between gap-4 relative z-10 mb-5">
                        {/* Royal Moorish Arched Medallion Frame */}
                        <div className="relative w-14 h-18 sm:w-16 sm:h-20 shrink-0 rounded-t-full rounded-b-md p-[2px] bg-gradient-to-b from-[var(--brand-accent)] via-[var(--brand-accent)]/50 to-transparent shadow-sm">
                          <div className="w-full h-full rounded-t-full rounded-b-[4px] bg-gradient-to-b from-[var(--brand-primary)]/15 via-[var(--bg-surface)] to-[var(--bg-surface-elevated)] overflow-hidden flex flex-col items-center justify-center text-center p-1 relative">
                            <div className="text-[var(--brand-accent)] mb-1">
                              <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
                            </div>
                            <span className="font-arabic font-bold text-xs text-[var(--brand-accent-text)] tracking-wider" dir="rtl">
                              {item.monogramAr}
                            </span>
                          </div>
                          {/* Keystone Jewel */}
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--brand-accent)] rounded-[1px] shadow-xs" />
                        </div>

                        {/* Metallic Gold Status Ribbon */}
                        <div className="flex flex-col items-end gap-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-[var(--brand-accent)]/30 bg-gradient-to-r from-[var(--brand-accent)]/15 via-[var(--brand-accent)]/5 to-transparent text-[var(--brand-accent-text)] shadow-xs">
                            <span
                              className="font-arabic text-[11px] font-medium"
                              dir="rtl"
                            >
                              {item.badgeAr}
                            </span>
                            <span className="text-[9px] text-[var(--brand-accent)] opacity-60">
                              •
                            </span>
                            <span>{item.badgeEn}</span>
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] font-medium">
                            Portal Gateway
                          </span>
                        </div>
                      </div>

                      {/* Division Titles */}
                      <div className="space-y-1.5 relative z-10 mb-3">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] font-serif leading-snug line-clamp-2 group-hover:text-[var(--brand-primary)] dark:group-hover:text-[var(--brand-accent)] transition-colors">
                          {item.titleEn}
                        </h3>

                        <p
                          className="font-arabic text-xs sm:text-sm text-[var(--brand-accent)] font-semibold line-clamp-1"
                          dir="rtl"
                        >
                          {item.titleAr}
                        </p>
                      </div>

                      {/* Division Description */}
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3 relative z-10 mb-4">
                        {item.description}
                      </p>

                      {/* Micro Highlight Preview Banner */}
                      <div className="p-3 rounded-[6px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-2xs text-[var(--text-muted)] line-clamp-2 leading-relaxed flex items-center gap-2 relative z-10 mb-5">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0 opacity-70" />
                        <span className="italic">{item.highlight}</span>
                      </div>

                      {/* Card Institutional Footer Action */}
                      <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between relative z-10 mt-auto">
                        <span className="text-[11px] font-medium text-[var(--text-muted)]">
                          Dedicated Standalone Archive
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-accent-text)] group-hover:text-[var(--brand-accent-hover)] transition-colors">
                          <span>{item.cta}</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Pagination Progress Indicators */}
          {gateways.length > visibleCards && (
            <div
              className="flex items-center justify-center gap-2 mt-6"
              role="tablist"
              aria-label="Society divisions slide indicators"
            >
              {Array.from({ length: maxIndex + 1 }).map((_, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Slide group ${idx + 1} of ${maxIndex + 1}`}
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] cursor-pointer p-0",
                      isActive
                        ? "w-8 bg-[var(--brand-accent)]"
                        : "w-2.5 bg-[var(--border-color)] hover:bg-[var(--text-muted)]"
                    )}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
