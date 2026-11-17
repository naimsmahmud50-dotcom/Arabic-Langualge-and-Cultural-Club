/**
 * @file src/components/home/CommitteePreviewSection.tsx
 * @description Current Committee & Governing Council Interactive Preview Section.
 * 
 * ARCHITECTURAL ROLE:
 * - Highlights active executive council stewardship under the current academic term.
 * - Displays official leadership roster in a world-class responsive interactive carousel.
 * - Meets Requirement SPEC-HOM-04, SPEC-COM-01, and SPEC-037.
 * 
 * SPECIFICATIONS:
 * - Multi-item Responsive Carousel:
 *   - Desktop (>= 1024px): 3 executive cards visible simultaneously with smooth horizontal sliding.
 *   - Tablet (640px - 1023px): 2 cards visible with proportional slide steps.
 *   - Mobile (< 640px): 1 card visible with 1:1 real-time touch drag, momentum snap, and rubber-banding.
 *   - Dual navigation controls: Floating side arrows on the cards + header buttons + pagination dots.
 * - Royal Islamic Mihrab Arch Frame & Insignia:
 *   - Replaces flat letter boxes with an arched Moorish Mihrab frame, 1.5px gold border, and ambient shadow.
 *   - Renders high-res portrait when `photoUrl` is present.
 *   - Renders rank-specific insignia (Crown, Award, Scroll, Shield) and authentic Arabic monogram when photo is pending.
 * - Metadata & Styling:
 *   - Metallic gold ribbon rank badges (`الرتبة الأولى • Rank #1`).
 *   - Background 8-fold Islamic geometric rosette and calligraphic watermark (`المجلس التنفيذي`).
 *   - Direct portfolio link (`/leadership#officer-[assignmentId]`) with animated hover arrow.
 *   - Accessible carousel navigation: left/right buttons, pagination dots, keyboard controls, and pause/play toggle.
 * - Strictly human vibe; zero AI emojis; WCAG AA contrast compliance.
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import {
  Users2,
  ArrowRight,
  ShieldCheck,
  Award,
  Crown,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";

export interface CommitteeMemberItem {
  assignmentId: string;
  positionTitleEn: string;
  positionTitleAr?: string | null;
  fullNameEn: string;
  fullNameAr?: string | null;
  roleDescription?: string | null;
  rankOrder: number;
  photoUrl?: string | null;
}

export interface CommitteePreviewSectionProps {
  termTitle?: string;
  academicYear?: string;
  officers: CommitteeMemberItem[];
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
 * Formats academic Arabic rank ordinal
 */
function getRankAr(rank: number): string {
  switch (rank) {
    case 1:
      return "الرتبة الأولى";
    case 2:
      return "الرتبة الثانية";
    case 3:
      return "الرتبة الثالثة";
    case 4:
      return "الرتبة الرابعة";
    case 5:
      return "الرتبة الخامسة";
    case 6:
      return "الرتبة السادسة";
    case 7:
      return "الرتبة السابعة";
    case 8:
      return "الرتبة الثامنة";
    default:
      return "عضو المجلس";
  }
}

/**
 * Renders appropriate executive insignia based on leadership rank
 */
function ExecutiveInsigniaIcon({ rank, className }: { rank: number; className?: string }) {
  if (rank === 1) {
    return <Crown className={cn("stroke-[1.5]", className)} />;
  }
  if (rank === 2) {
    return <Award className={cn("stroke-[1.5]", className)} />;
  }
  if (rank === 3) {
    return <ScrollText className={cn("stroke-[1.5]", className)} />;
  }
  return <ShieldCheck className={cn("stroke-[1.5]", className)} />;
}

export function CommitteePreviewSection({
  termTitle = "Governing Executive Council",
  academicYear = "2024–2025",
  officers,
}: CommitteePreviewSectionProps) {
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

  // Responsive items count updater & step measurement
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
  }, [officers.length]);

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
  const maxIndex = Math.max(0, officers.length - visibleCards);

  // Keep active index within bounds on resize
  useEffect(() => {
    if (activeIndex > maxIndex) {
      setActiveIndex(maxIndex);
    }
  }, [activeIndex, maxIndex]);

  const goToNext = useCallback(() => {
    if (officers.length <= visibleCards) return;
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [officers.length, visibleCards, maxIndex]);

  const goToPrev = useCallback(() => {
    if (officers.length <= visibleCards) return;
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [officers.length, visibleCards, maxIndex]);

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // 5-second gentle auto-advance timer
  useEffect(() => {
    if (
      isPaused ||
      isHovered ||
      isTouching ||
      isFocused ||
      prefersReducedMotion ||
      officers.length <= visibleCards
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
    officers.length,
    visibleCards,
    goToNext,
  ]);

  // Touch handlers with real-time 1:1 drag and direction disambiguation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1 || officers.length <= visibleCards) return;

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
      // Rubber-band resistance at boundaries
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

    if (swipeClickPreventTimeoutRef.current) {
      clearTimeout(swipeClickPreventTimeoutRef.current);
    }
    swipeClickPreventTimeoutRef.current = setTimeout(() => {
      isSwipingRef.current = false;
    }, 120);

    // Buffer before auto-play resumes
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

  // 100% exact translateX calculation using measured pixel step with fallback
  const translateStyle =
    stepPx > 0
      ? `translateX(calc(-${activeIndex * stepPx}px + ${dragOffset}px))`
      : `translateX(calc(-${activeIndex} * (100% + 24px) / ${visibleCards} + ${dragOffset}px))`;

  return (
    <section
      className="py-20 bg-[var(--bg-primary)] border-b border-[var(--border-color)] overflow-hidden"
      aria-label="Current Committee Governance"
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
              Current Governance
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif tracking-tight">
              Executive Council & Committee ({academicYear})
            </h2>
            <p
              className="font-arabic-heading text-sm sm:text-base text-[var(--brand-accent)] font-semibold"
              dir="rtl"
            >
              الْهَيْئَةُ الْإِدَارِيَّةُ الْحَالِيَّةُ • أَعْضَاءُ الْمَجْلِسِ التَّنْفِيذِيِّ لِلْعَامِ الْأَكَادِيمِيِّ
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Serving the academic term with democratic accountability, constitutional loyalty, and academic devotion to Arabic scholarship at Kabi Nazrul Government College, Dhaka.
            </p>
          </div>

          {/* Action Links & Interactive Carousel Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
            {officers.length > visibleCards && (
              <div
                className="inline-flex items-center gap-1.5 p-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs"
                role="group"
                aria-label="Executive carousel controls"
              >
                <button
                  type="button"
                  onClick={goToPrev}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--brand-accent)] hover:text-white transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                  aria-label="Previous leadership slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={togglePause}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--brand-accent)] hover:text-white transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                  aria-label={
                    isPaused ? "Resume leadership auto-play" : "Pause leadership auto-play"
                  }
                  title={isPaused ? "Play" : "Pause"}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
                </button>

                <button
                  type="button"
                  onClick={goToNext}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--brand-accent)] hover:text-white transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                  aria-label="Next leadership slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <Link href="/leadership">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="border-[var(--border-color)] hover:border-[var(--brand-accent)]"
              >
                View All Historical Committees
              </Button>
            </Link>
          </div>
        </div>

        {/* Carousel Viewport / Slider Container */}
        {officers.length > 0 ? (
          <div
            className="relative focus:outline-none py-2"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
            aria-roledescription="carousel"
            aria-label="Executive Council Officers Carousel"
          >
            {/* Floating Side Navigation Arrows for Immediate Visual Clickability */}
            {officers.length > visibleCards && (
              <>
                <button
                  type="button"
                  onClick={goToPrev}
                  className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center bg-[var(--bg-surface)] hover:bg-[var(--brand-accent)] text-[var(--text-primary)] hover:text-white border border-[var(--border-color)] hover:border-[var(--brand-accent)] shadow-lg transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                  aria-label="Slide previous leadership officer"
                  title="Previous officer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center bg-[var(--bg-surface)] hover:bg-[var(--brand-accent)] text-[var(--text-primary)] hover:text-white border border-[var(--border-color)] hover:border-[var(--brand-accent)] shadow-lg transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                  aria-label="Slide next leadership officer"
                  title="Next officer"
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
                    : "transition-transform duration-500 ease-out"
                )}
                style={{
                  transform: translateStyle,
                }}
              >
                {officers.map((officer, index) => {
                  const isVisibleInView =
                    index >= activeIndex && index < activeIndex + visibleCards;

                  return (
                    <article
                      key={officer.assignmentId}
                      className={cn(
                        "shrink-0 group relative flex flex-col justify-between",
                        "w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333333%-16px)]",
                        "p-6 sm:p-7 rounded-[10px] border border-[var(--border-color)] bg-[var(--bg-surface)]",
                        "shadow-[0_4px_20px_-2px_rgba(23,61,50,0.05)] hover:shadow-[0_12px_32px_-4px_rgba(23,61,50,0.12)]",
                        "hover:border-[var(--brand-accent)]/60 transition-all duration-300",
                        "overflow-hidden select-none"
                      )}
                      aria-roledescription="slide"
                      aria-label={`${officer.fullNameEn}, ${officer.positionTitleEn}`}
                      aria-hidden={!isVisibleInView}
                    >
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
                        المجلس التنفيذي
                      </div>

                      {/* Top Profile Header: Royal Mihrab Arch & Rank Ribbon */}
                      <div className="flex items-start justify-between gap-4 relative z-10 mb-5">
                        {/* Royal Arched Mihrab Portrait / Insignia Frame */}
                        <div className="relative w-16 h-20 sm:w-18 sm:h-22 shrink-0 rounded-t-full rounded-b-md p-[2px] bg-gradient-to-b from-[var(--brand-accent)] via-[var(--brand-accent)]/50 to-transparent shadow-sm">
                          <div className="w-full h-full rounded-t-full rounded-b-[4px] bg-gradient-to-b from-[var(--brand-primary)]/15 via-[var(--bg-surface-elevated)] to-[var(--bg-surface)] overflow-hidden flex flex-col items-center justify-center relative">
                            {officer.photoUrl ? (
                              <img
                                src={officer.photoUrl}
                                alt={officer.fullNameEn}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-center p-1">
                                <div className="text-[var(--brand-accent)] mb-1">
                                  <ExecutiveInsigniaIcon
                                    rank={officer.rankOrder}
                                    className="w-5 h-5 sm:w-6 sm:h-6"
                                  />
                                </div>
                                <span
                                  className="font-arabic-heading font-bold text-xs text-[var(--brand-accent-text)] tracking-wider"
                                  dir="rtl"
                                >
                                  {officer.fullNameAr
                                    ? officer.fullNameAr.trim().charAt(0)
                                    : officer.fullNameEn.trim().charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Keystone Jewel */}
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[var(--brand-accent)] rounded-[1px] shadow-xs" />
                        </div>

                        {/* Metallic Gold Rank Ribbon */}
                        <div className="flex flex-col items-end gap-1">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-[var(--brand-accent)]/30 bg-gradient-to-r from-[var(--brand-accent)]/15 via-[var(--brand-accent)]/5 to-transparent text-[var(--brand-accent-text)] shadow-xs">
                            <span
                              className="font-arabic text-[11px] font-medium"
                              dir="rtl"
                            >
                              {getRankAr(officer.rankOrder)}
                            </span>
                            <span className="text-[9px] text-[var(--brand-accent)] opacity-60">
                              •
                            </span>
                            <span>Rank #{officer.rankOrder}</span>
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] font-medium">
                            {academicYear}
                          </span>
                        </div>
                      </div>

                      {/* Officer Identity & Official Designation */}
                      <div className="space-y-1.5 relative z-10 mb-4">
                        <h3 className="text-lg font-bold text-[var(--text-primary)] font-serif leading-snug group-hover:text-[var(--brand-primary)] dark:group-hover:text-[var(--brand-accent)] transition-colors">
                          {officer.fullNameEn}
                        </h3>

                        {officer.fullNameAr && (
                          <p
                            className="font-arabic-heading text-xs sm:text-sm text-[var(--brand-accent)] font-semibold"
                            dir="rtl"
                          >
                            {officer.fullNameAr}
                          </p>
                        )}

                        <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-[var(--brand-accent)]" />
                          <span>{officer.positionTitleEn}</span>
                          {officer.positionTitleAr && (
                            <span
                              className="font-arabic text-[11px] font-normal opacity-80"
                              dir="rtl"
                            >
                              ({officer.positionTitleAr})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mandate Description */}
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3 relative z-10 mb-6">
                        {officer.roleDescription ||
                          "Executive council member administering club academic programs, student mentorship, and cultural assemblies."}
                      </p>

                      {/* Card Institutional Footer Action */}
                      <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between relative z-10 mt-auto">
                        <span className="text-[11px] font-medium text-[var(--text-muted)]">
                          Constitutional Mandate
                        </span>
                        <Link
                          href={`/leadership#officer-${officer.assignmentId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-accent-text)] hover:text-[var(--brand-accent-hover)] transition-colors group/btn"
                        >
                          <span>View Profile & Portfolio</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Pagination Progress Indicators */}
            {officers.length > visibleCards && (
              <div
                className="flex items-center justify-center gap-2 mt-6"
                role="tablist"
                aria-label="Executive leadership slide indicators"
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
        ) : (
          <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[6px] max-w-md mx-auto">
            <Users2 className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              Committee Rosters Pending Update
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              The current term's executive assignments are being archived and ratified.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
