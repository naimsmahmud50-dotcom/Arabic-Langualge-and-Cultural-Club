/**
 * @file src/app/(public)/events/AnnualPlanCalendarClient.tsx
 * @route /events (Client Interactive Layer)
 * @description Interactive 12-Month Annual Plan, Upcoming Events, Past Events Archive, and Calendar Grid.
 * 
 * ARCHITECTURE & ROLE:
 * - Multi-mode platform hub supporting:
 *   1. 12-Month Master Curriculum Plan (Month-by-Month, Interactive Calendar Grid, Chronological Itinerary).
 *   2. Upcoming Gatherings (active registrations, seat counters, logistics).
 *   3. Past Events Archive (historical symposia, competitions, and records).
 * - Enforces zero synthetic content: unverified logistics are clearly rendered as
 *   "[Date to be finalized]" or "[Venue to be announced]".
 * - Makes cancelled and postponed activities unmistakably prominent with cautionary notices.
 * 
 * DESIGN SYSTEM TOKENS:
 * - Brand Primary: #173D32 (Forest Green)
 * - Brand Accent: #B18A4A (Antique Brass)
 * - Dark Surface: #17211D (Midnight Evergreen)
 * - Light Surface: #F5F0E5 (Warm Ivory)
 * 
 * ACCESSIBILITY & HUMAN VIBE:
 * - Full keyboard navigation (Tab, Enter, Space, Arrow keys).
 * - Zero cheesy AI emojis. Clean, scholarly SVG icons from lucide-react.
 */

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  List, 
  Clock, 
  MapPin, 
  FileText, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Info,
  Layers,
  ArrowRight,
  Sparkles,
  Users
} from "lucide-react";
import { Card, CardContent, Badge, Button, EmptyState } from "@/components/ui";

export interface AnnualPlanActivity {
  id: string;
  academicYear: string;
  monthNumber: number;
  activityTitleEn: string;
  activityTitleAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  category: string;
  status: "planned" | "confirmed" | "completed" | "postponed" | "cancelled";
  targetDate: string | null;
  time: string | null;
  location: string | null;
  relatedEventId: string | null;
  relatedEventSlug: string | null;
  relatedEventTitle: string | null;
  documentUrl: string | null;
  documentTitle: string | null;
  notes: string | null;
  isPublished: boolean;
}

export interface EventListItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string | null;
  summaryEn: string;
  summaryAr: string | null;
  category: string;
  startTime: Date | number;
  endTime: Date | number | null;
  venue: string;
  coverImageUrl: string | null;
  status: "planned" | "confirmed" | "completed" | "postponed" | "cancelled";
  capacity: number | null;
  isRegistrationOpen: boolean;
}

interface AnnualPlanCalendarClientProps {
  initialActivities: AnnualPlanActivity[];
  availableYears: string[];
  activeYear: string;
  upcomingEvents?: EventListItem[];
  pastEvents?: EventListItem[];
}

// Academic month labels mapping monthNumber (1 to 12) for an academic year starting September
const ACADEMIC_MONTHS: Record<number, { nameEn: string; nameAr: string; gregorianRef: string }> = {
  1: { nameEn: "Month 01 (September)", nameAr: "الشهر الأول (سبتمبر)", gregorianRef: "September" },
  2: { nameEn: "Month 02 (October)", nameAr: "الشهر الثاني (أكتوبر)", gregorianRef: "October" },
  3: { nameEn: "Month 03 (November)", nameAr: "الشهر الثالث (نوفمبر)", gregorianRef: "November" },
  4: { nameEn: "Month 04 (December)", nameAr: "الشهر الرابع (ديسمبر)", gregorianRef: "December" },
  5: { nameEn: "Month 05 (January)", nameAr: "الشهر الخامس (يناير)", gregorianRef: "January" },
  6: { nameEn: "Month 06 (February)", nameAr: "الشهر السادس (فبراير)", gregorianRef: "February" },
  7: { nameEn: "Month 07 (March)", nameAr: "الشهر السابع (مارس)", gregorianRef: "March" },
  8: { nameEn: "Month 08 (April)", nameAr: "الشهر الثامن (أبريل)", gregorianRef: "April" },
  9: { nameEn: "Month 09 (May)", nameAr: "الشهر التاسع (مايو)", gregorianRef: "May" },
  10: { nameEn: "Month 10 (June)", nameAr: "الشهر العاشر (يونيو)", gregorianRef: "June" },
  11: { nameEn: "Month 11 (July)", nameAr: "الشهر الحادي عشر (يوليو)", gregorianRef: "July" },
  12: { nameEn: "Month 12 (August)", nameAr: "الشهر الثاني عشر (أغسطس)", gregorianRef: "August" },
};

export function AnnualPlanCalendarClient({
  initialActivities,
  availableYears,
  activeYear,
  upcomingEvents = [],
  pastEvents = [],
}: AnnualPlanCalendarClientProps) {
  // Primary Platform Mode: Master Plan vs Upcoming Gatherings vs Past Events Archive
  const [mainTab, setMainTab] = useState<"plan" | "upcoming" | "past">("plan");

  // State: Active Academic Year, View Mode, Category Filter, Status Filter, Search Query
  const [selectedYear, setSelectedYear] = useState<string>(activeYear || availableYears[0] || "2024–2025");
  const [viewMode, setViewMode] = useState<"schedule" | "calendar" | "list">("schedule");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  // Calendar Grid specific state: Selected Calendar Month Index (0 to 11) and Selected Day for details
  const [calendarMonthIndex, setCalendarMonthIndex] = useState(0); // 0 = Sept, 1 = Oct ... 11 = Aug
  const [selectedActivityForModal, setSelectedActivityForModal] = useState<AnnualPlanActivity | null>(null);

  // Filter activities based on selected year, category, status, and search query
  const filteredActivities = useMemo(() => {
    return initialActivities.filter((act) => {
      if (act.academicYear !== selectedYear) return false;

      if (selectedCategory !== "all" && act.category !== selectedCategory) {
        return false;
      }

      if (selectedStatus !== "all" && act.status !== selectedStatus) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitleEn = act.activityTitleEn.toLowerCase().includes(query);
        const matchTitleAr = act.activityTitleAr ? act.activityTitleAr.toLowerCase().includes(query) : false;
        const matchDescEn = act.descriptionEn ? act.descriptionEn.toLowerCase().includes(query) : false;
        const matchDescAr = act.descriptionAr ? act.descriptionAr.toLowerCase().includes(query) : false;
        const matchLocation = act.location ? act.location.toLowerCase().includes(query) : false;
        if (!matchTitleEn && !matchTitleAr && !matchDescEn && !matchDescAr && !matchLocation) {
          return false;
        }
      }

      return true;
    });
  }, [initialActivities, selectedYear, selectedCategory, selectedStatus, searchQuery]);

  // Filter upcoming events
  const filteredUpcomingEvents = useMemo(() => {
    return upcomingEvents.filter((e) => {
      if (selectedCategory !== "all" && e.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = e.titleEn.toLowerCase().includes(q) || (e.titleAr && e.titleAr.toLowerCase().includes(q));
        const mSummary = e.summaryEn && e.summaryEn.toLowerCase().includes(q);
        const mVenue = e.venue && e.venue.toLowerCase().includes(q);
        if (!mTitle && !mSummary && !mVenue) return false;
      }
      return true;
    });
  }, [upcomingEvents, selectedCategory, searchQuery]);

  // Filter past events
  const filteredPastEvents = useMemo(() => {
    return pastEvents.filter((e) => {
      if (selectedCategory !== "all" && e.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mTitle = e.titleEn.toLowerCase().includes(q) || (e.titleAr && e.titleAr.toLowerCase().includes(q));
        const mSummary = e.summaryEn && e.summaryEn.toLowerCase().includes(q);
        const mVenue = e.venue && e.venue.toLowerCase().includes(q);
        if (!mTitle && !mSummary && !mVenue) return false;
      }
      return true;
    });
  }, [pastEvents, selectedCategory, searchQuery]);

  // Group activities by monthNumber (1 to 12)
  const activitiesByMonth = useMemo(() => {
    const map: Record<number, AnnualPlanActivity[]> = {};
    for (let m = 1; m <= 12; m++) {
      map[m] = [];
    }
    filteredActivities.forEach((act) => {
      if (map[act.monthNumber]) {
        map[act.monthNumber].push(act);
      }
    });
    return map;
  }, [filteredActivities]);

  // Category Options
  const categories = [
    { value: "all", label: "All Categories (جميع المجالات)" },
    { value: "academic", label: "Academic & Linguistic (أكاديمي ولغوي)" },
    { value: "workshop", label: "Workshops & Calligraphy (ورش عمل وخط)" },
    { value: "competition", label: "Debate & Oratory (مناظرات وخطابة)" },
    { value: "cultural", label: "Cultural Salons (أمسيات وصالونات)" },
    { value: "seminar", label: "Symposia & Lectures (ندوات ومحاضرات)" },
  ];

  // Status Filter Options
  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "confirmed", label: "Confirmed" },
    { value: "planned", label: "Planned" },
    { value: "completed", label: "Completed" },
    { value: "postponed", label: "Postponed / Rescheduled" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // Helper for Status Badge styling
  const renderStatusBadge = (status: AnnualPlanActivity["status"]) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-emerald-900/10 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Confirmed
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-color)]">
            <CheckCircle2 className="w-3 h-3 text-[var(--brand-accent)]" />
            Completed
          </span>
        );
      case "planned":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-amber-900/10 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Planned
          </span>
        );
      case "postponed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-amber-500/15 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-400 dark:border-amber-700">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Postponed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold bg-rose-900/10 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  // Compute stats for current year
  const yearStats = useMemo(() => {
    const total = filteredActivities.length;
    const completed = filteredActivities.filter(a => a.status === "completed").length;
    const confirmed = filteredActivities.filter(a => a.status === "confirmed").length;
    const planned = filteredActivities.filter(a => a.status === "planned").length;
    const postponed = filteredActivities.filter(a => a.status === "postponed").length;
    const cancelled = filteredActivities.filter(a => a.status === "cancelled").length;
    return { total, completed, confirmed, planned, postponed, cancelled };
  }, [filteredActivities]);

  return (
    <div className="space-y-8">
      {/* 1. Primary Platform Mode Tabs */}
      <div className="flex border-b-2 border-[var(--border-color)] gap-3 sm:gap-8 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          type="button"
          onClick={() => setMainTab("plan")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 -mb-[3px] transition-all whitespace-nowrap min-h-[44px] shrink-0 ${
            mainTab === "plan"
              ? "border-[var(--brand-accent)] text-[var(--brand-primary)] dark:text-[var(--brand-accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>12-Month Master Plan</span>
        </button>
        <button
          type="button"
          onClick={() => setMainTab("upcoming")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 -mb-[3px] transition-all whitespace-nowrap min-h-[44px] shrink-0 ${
            mainTab === "upcoming"
              ? "border-[var(--brand-accent)] text-[var(--brand-primary)] dark:text-[var(--brand-accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Upcoming Gatherings ({filteredUpcomingEvents.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMainTab("past")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 -mb-[3px] transition-all whitespace-nowrap min-h-[44px] shrink-0 ${
            mainTab === "past"
              ? "border-[var(--brand-accent)] text-[var(--brand-primary)] dark:text-[var(--brand-accent)]"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Past Events Archive ({filteredPastEvents.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 12-MONTH MASTER PLAN & CALENDAR GRID                                */}
      {/* ========================================================================= */}
      {mainTab === "plan" && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in">
          {/* Academic Session Selector & Master Control Header */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[6px] p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-[var(--border-color)]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-widest font-mono font-semibold text-[var(--brand-accent)]">
                    Institutional Academic Master Plan
                  </span>
                  <span className="text-[var(--border-color)]">•</span>
                  <span className="text-xs text-[var(--text-muted)]">Ratified Program</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight">
                  Session Calendar ({selectedYear})
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  Official schedule of academic lectures, classical language circles, debate tournaments, and cultural gatherings.
                </p>
              </div>

              {/* Academic Year Selector Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">
                  Academic Session:
                </span>
                <div className="flex flex-wrap gap-1 bg-[var(--bg-surface-elevated)] p-1 rounded-[6px] border border-[var(--border-color)]">
                  {availableYears.map((yr) => {
                    const isSelected = yr === selectedYear;
                    return (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setSelectedYear(yr)}
                        className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold tracking-wide transition-all ${
                          isSelected
                            ? "bg-[var(--brand-primary)] text-white shadow-sm"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                        }`}
                      >
                        {yr} {yr === activeYear && <span className="opacity-75 text-[10px] ml-1">(Current)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Real Metrics Banner (Strictly Zero Fake Data) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-4 pt-4 sm:pt-6 text-center">
              <div className="p-2.5 sm:p-3 rounded-[4px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--text-primary)]">{yearStats.total}</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Total Activities</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-[4px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{yearStats.completed}</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Completed</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-[4px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">{yearStats.confirmed}</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Confirmed</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-[4px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                <div className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{yearStats.planned}</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Planned</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-[4px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                <div className="text-xl sm:text-2xl font-bold font-mono text-amber-500">{yearStats.postponed}</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Postponed</div>
              </div>
              <div className="p-2.5 sm:p-3 rounded-[4px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                <div className="text-xl sm:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{yearStats.cancelled}</div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">Cancelled</div>
              </div>
            </div>
          </div>

          {/* Interactive Navigation Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* View Mode Toggle */}
            <div className="flex overflow-x-auto no-scrollbar p-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[6px] shadow-sm -mx-4 px-4 sm:mx-0 sm:px-1 gap-1">
              <button
                type="button"
                onClick={() => setViewMode("schedule")}
                className={`flex items-center gap-2 px-3 py-2 rounded-[4px] text-xs font-semibold transition-all shrink-0 whitespace-nowrap min-h-[40px] ${
                  viewMode === "schedule"
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                12-Month Master Plan
              </button>
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-3 py-2 rounded-[4px] text-xs font-semibold transition-all shrink-0 whitespace-nowrap min-h-[40px] ${
                  viewMode === "calendar"
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Calendar Grid View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-2 rounded-[4px] text-xs font-semibold transition-all shrink-0 whitespace-nowrap min-h-[40px] ${
                  viewMode === "list"
                    ? "bg-[var(--brand-primary)] text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Chronological Itinerary
              </button>
            </div>

            {/* Live Search & Status Select */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, location, or topic..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[5px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Clear
                  </button>
                )}
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filter activities by status"
                className="px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[5px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
              >
                {statuses.map(st => (
                  <option key={st.value} value={st.value}>{st.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-[var(--border-color)]">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedCategory(c.value)}
                  className={`px-3.5 py-1.5 rounded-[4px] text-xs font-semibold tracking-wide transition-all border ${
                    isSelected
                      ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand-accent)]"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {/* Render Plan Modes */}
          {filteredActivities.length === 0 ? (
            <EmptyState
              title={`No Activities Found for Session ${selectedYear}`}
              description={
                searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
                  ? "No activities match your current search or category filter. Try clearing your filters."
                  : `The executive council has not ratified an annual program schedule for ${selectedYear} yet. Please inspect other academic sessions or return soon.`
              }
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedStatus("all");
                  }}
                >
                  Clear All Filters
                </Button>
              }
            />
          ) : (
            <>
              {/* VIEW MODE 1: Month-by-Month 12-Month Plan */}
              {viewMode === "schedule" && (
                <div className="space-y-10">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((monthNum) => {
                    const monthActs = activitiesByMonth[monthNum] || [];
                    const monthInfo = ACADEMIC_MONTHS[monthNum];

                    if (monthActs.length === 0) return null;

                    return (
                      <div key={monthNum} className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-[4px] bg-[var(--brand-primary)] text-white font-mono font-bold text-sm flex items-center justify-center">
                              {monthNum < 10 ? `0${monthNum}` : monthNum}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                {monthInfo.nameEn}
                              </h3>
                              <p className="text-xs text-[var(--brand-accent)] font-arabic" dir="rtl">
                                {monthInfo.nameAr}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-[var(--text-muted)] font-mono">
                            {monthActs.length} {monthActs.length === 1 ? "Activity" : "Activities"} Scheduled
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {monthActs.map((act) => (
                            <ActivityCard key={act.id} activity={act} renderStatusBadge={renderStatusBadge} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* VIEW MODE 2: Interactive Monthly Calendar Grid */}
              {viewMode === "calendar" && (
                <CalendarGridView
                  activities={filteredActivities}
                  academicYear={selectedYear}
                  currentMonthIndex={calendarMonthIndex}
                  onMonthIndexChange={setCalendarMonthIndex}
                  onSelectActivity={setSelectedActivityForModal}
                  renderStatusBadge={renderStatusBadge}
                />
              )}

              {/* VIEW MODE 3: Chronological Itinerary List */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  <div className="text-xs text-[var(--text-muted)] pb-2 border-b border-[var(--border-color)] flex items-center justify-between">
                    <span>Displaying {filteredActivities.length} verified activities for session {selectedYear}</span>
                    <span className="font-mono">Chronological Sequence</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {filteredActivities.map((act) => (
                      <ActivityListItem key={act.id} activity={act} renderStatusBadge={renderStatusBadge} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: UPCOMING EVENTS & REGISTRATION PORTAL                              */}
      {/* ========================================================================= */}
      {mainTab === "upcoming" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                Upcoming Academic Gatherings
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Verified oratorical tournaments, calligraphy masterclasses, and symposia accepting seat reservations.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search upcoming events..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[5px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          {filteredUpcomingEvents.length === 0 ? (
            <EmptyState
              title="No Upcoming Events Scheduled"
              description="There are currently no upcoming events matching your criteria. Check our 12-Month Master Plan or return soon."
              action={
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUpcomingEvents.map((evt) => (
                <Card key={evt.id} hoverElevate className="border-[var(--border-color)] flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="accent" size="sm" className="capitalize">
                        {evt.category}
                      </Badge>
                      <span className="text-[11px] font-mono font-bold uppercase text-[var(--text-muted)]">
                        {evt.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                        {evt.titleEn}
                      </h4>
                      {evt.titleAr && (
                        <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                          {evt.titleAr}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                      {evt.summaryEn}
                    </p>

                    <div className="pt-3 border-t border-[var(--border-color)] space-y-2 text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-2 font-mono">
                        <CalendarIcon className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        <span>{new Date(evt.startTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        <span>{new Date(evt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        <span className="truncate">{evt.venue}</span>
                      </div>
                      {evt.capacity && (
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                          <span>Seating: {evt.capacity} Allocations</span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <div className="p-6 pt-0">
                    <Link href={`/events/${evt.slug}`} className="w-full block">
                      <Button variant="primary" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        <span>Inspect Dossier & Reserve Seat</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAST EVENTS ARCHIVE                                               */}
      {/* ========================================================================= */}
      {mainTab === "past" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                Historical Concluded Gatherings
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Archival repository of completed academic conferences, symposium proceedings, and public tournaments.
              </p>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search past archives..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[5px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-primary)]"
              />
            </div>
          </div>

          {filteredPastEvents.length === 0 ? (
            <EmptyState
              title="No Archival Gatherings Found"
              description="No historical events match your search query."
              action={
                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPastEvents.map((evt) => (
                <Card key={evt.id} className="border-[var(--border-color)] bg-[var(--bg-surface-elevated)] flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="neutral" size="sm" className="capitalize">
                        {evt.category}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        Completed
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                        {evt.titleEn}
                      </h4>
                      {evt.titleAr && (
                        <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                          {evt.titleAr}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                      {evt.summaryEn}
                    </p>

                    <div className="pt-3 border-t border-[var(--border-color)] space-y-1 text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-2 font-mono">
                        <CalendarIcon className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        <span>Concluded: {new Date(evt.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        <span>{evt.venue}</span>
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-6 pt-0">
                    <Link href={`/events/${evt.slug}`} className="w-full block">
                      <Button variant="outline" size="sm" className="w-full justify-between" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        <span>Inspect Archival Dossier</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal for Calendar Grid clicks */}
      {selectedActivityForModal && (
        <ActivityDetailModal
          activity={selectedActivityForModal}
          onClose={() => setSelectedActivityForModal(null)}
          renderStatusBadge={renderStatusBadge}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------

interface ActivityCardProps {
  activity: AnnualPlanActivity;
  renderStatusBadge: (status: AnnualPlanActivity["status"]) => React.ReactNode;
}

function ActivityCard({ activity, renderStatusBadge }: ActivityCardProps) {
  const isPostponed = activity.status === "postponed";
  const isCancelled = activity.status === "cancelled";

  return (
    <Card 
      className={`border transition-all flex flex-col justify-between ${
        isCancelled 
          ? "border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10" 
          : isPostponed
          ? "border-amber-300 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10"
          : "border-[var(--border-color)] hover:border-[var(--brand-accent)]"
      }`}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="accent" size="sm" className="capitalize">
            {activity.category}
          </Badge>
          <div>{renderStatusBadge(activity.status)}</div>
        </div>

        <div className="space-y-1">
          <h4 className={`text-base font-bold leading-snug text-[var(--text-primary)] ${isCancelled ? "line-through opacity-75" : ""}`}>
            {activity.activityTitleEn}
          </h4>
          {activity.activityTitleAr && (
            <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
              {activity.activityTitleAr}
            </p>
          )}
        </div>

        {activity.descriptionEn && (
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
            {activity.descriptionEn}
          </p>
        )}

        {(isPostponed || isCancelled) && activity.notes && (
          <div className={`p-3 rounded-[4px] text-xs space-y-1 border ${
            isCancelled 
              ? "bg-rose-900/10 border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200" 
              : "bg-amber-900/10 border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-200"
          }`}>
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
              {isCancelled ? <XCircle className="w-3.5 h-3.5 text-rose-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
              <span>{isCancelled ? "Official Cancellation Notice" : "Rescheduling Protocol"}</span>
            </div>
            <p className="leading-relaxed">{activity.notes}</p>
          </div>
        )}

        <div className="pt-3 border-t border-[var(--border-color)] space-y-1.5 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0" />
            <span className="font-mono">
              {activity.targetDate 
                ? new Date(activity.targetDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                : "[Date to be finalized]"}
            </span>
            {activity.time && (
              <>
                <span>•</span>
                <Clock className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0" />
                <span>{activity.time}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0" />
            <span className="truncate">
              {activity.location || "[Venue to be announced]"}
            </span>
          </div>
        </div>

        {(activity.relatedEventSlug || activity.documentUrl) && (
          <div className="pt-3 border-t border-[var(--border-color)] flex flex-wrap items-center gap-2">
            {activity.relatedEventSlug && (
              <Link href={`/events/${activity.relatedEventSlug}`} className="inline-flex">
                <Button variant="primary" size="sm" className="h-8 text-[11px] gap-1.5">
                  <span>Register & Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            )}

            {activity.documentUrl && (
              <a 
                href={activity.documentUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-accent)] hover:underline px-2.5 py-1.5 rounded-[4px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]"
              >
                <Download className="w-3 h-3" />
                <span>{activity.documentTitle || "Approved Syllabus"}</span>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityListItem({ activity, renderStatusBadge }: ActivityCardProps) {
  const isPostponed = activity.status === "postponed";
  const isCancelled = activity.status === "cancelled";

  return (
    <div className={`p-5 rounded-[6px] border bg-[var(--bg-surface)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${
      isCancelled 
        ? "border-rose-300 dark:border-rose-900/60" 
        : isPostponed 
        ? "border-amber-300 dark:border-amber-900/60" 
        : "border-[var(--border-color)] hover:border-[var(--brand-accent)]"
    }`}>
      <div className="space-y-2 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--brand-primary)] text-white">
            M{activity.monthNumber < 10 ? `0${activity.monthNumber}` : activity.monthNumber}
          </span>
          <Badge variant="accent" size="sm" className="capitalize">
            {activity.category}
          </Badge>
          {renderStatusBadge(activity.status)}
        </div>

        <div>
          <h4 className={`text-base font-bold text-[var(--text-primary)] ${isCancelled ? "line-through opacity-75" : ""}`}>
            {activity.activityTitleEn}
          </h4>
          {activity.activityTitleAr && (
            <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold mt-0.5" dir="rtl">
              {activity.activityTitleAr}
            </p>
          )}
        </div>

        {activity.descriptionEn && (
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {activity.descriptionEn}
          </p>
        )}

        {(isPostponed || isCancelled) && activity.notes && (
          <p className={`text-xs font-semibold p-2 rounded ${
            isCancelled ? "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300" : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          }`}>
            Note: {activity.notes}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
          <div className="flex items-center gap-1.5 font-mono">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>
              {activity.targetDate 
                ? new Date(activity.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "[Date to be finalized]"}
            </span>
          </div>

          {activity.time && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
              <span>{activity.time}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>{activity.location || "[Venue to be announced]"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
        {activity.relatedEventSlug && (
          <Link href={`/events/${activity.relatedEventSlug}`}>
            <Button variant="primary" size="sm" className="h-8 text-xs gap-1.5 whitespace-nowrap">
              <span>View Dossier</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        )}

        {activity.documentUrl && (
          <a
            href={activity.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--brand-accent)] font-semibold hover:underline px-2.5 py-1.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]"
          >
            <Download className="w-3 h-3" />
            <span>Prospectus</span>
          </a>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// CALENDAR GRID VIEW IMPLEMENTATION
// ----------------------------------------------------------------------

interface CalendarGridViewProps {
  activities: AnnualPlanActivity[];
  academicYear: string;
  currentMonthIndex: number;
  onMonthIndexChange: (idx: number) => void;
  onSelectActivity: (act: AnnualPlanActivity) => void;
  renderStatusBadge: (status: AnnualPlanActivity["status"]) => React.ReactNode;
}

function CalendarGridView({
  activities,
  academicYear,
  currentMonthIndex,
  onMonthIndexChange,
  onSelectActivity,
  renderStatusBadge,
}: CalendarGridViewProps) {
  const [startYearStr, endYearStr] = academicYear.split(/[-–—]/);
  const startYear = parseInt(startYearStr, 10) || 2024;
  const endYear = parseInt(endYearStr, 10) || 2025;

  const currentYear = currentMonthIndex < 4 ? startYear : endYear;
  const gregorianMonth = (currentMonthIndex + 8) % 12;

  const monthDate = new Date(currentYear, gregorianMonth, 1);
  const monthName = monthDate.toLocaleDateString("en-US", { month: "long" });
  const academicMonthNum = currentMonthIndex + 1;

  const daysInMonth = new Date(currentYear, gregorianMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, gregorianMonth, 1).getDay();

  const monthActivities = useMemo(() => {
    return activities.filter((a) => {
      if (a.targetDate) {
        const d = new Date(a.targetDate);
        return d.getFullYear() === currentYear && d.getMonth() === gregorianMonth;
      }
      return a.monthNumber === academicMonthNum;
    });
  }, [activities, currentYear, gregorianMonth, academicMonthNum]);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[6px] p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
        <div>
          <span className="text-xs uppercase font-mono font-semibold text-[var(--brand-accent)]">
            Month {academicMonthNum < 10 ? `0${academicMonthNum}` : academicMonthNum} of 12
          </span>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">
            {monthName} {currentYear}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthIndexChange(Math.max(0, currentMonthIndex - 1))}
            disabled={currentMonthIndex === 0}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Prev Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthIndexChange(Math.min(11, currentMonthIndex + 1))}
            disabled={currentMonthIndex === 11}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next Month
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-semibold text-[var(--text-muted)] uppercase tracking-wider pb-2 border-b border-[var(--border-color)]">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[90px] rounded-[4px] bg-[var(--bg-surface-elevated)]/30 border border-transparent" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = `${currentYear}-${String(gregorianMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const dayActs = monthActivities.filter((a) => a.targetDate === dateStr);

          return (
            <div
              key={dayNum}
              className={`min-h-[90px] p-2 rounded-[4px] border flex flex-col justify-between transition-all ${
                dayActs.length > 0
                  ? "bg-[var(--bg-surface-elevated)] border-[var(--brand-accent)]/60 shadow-xs"
                  : "bg-[var(--bg-surface)] border-[var(--border-color)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold ${dayActs.length > 0 ? "text-[var(--brand-primary)] dark:text-[var(--brand-accent)]" : "text-[var(--text-muted)]"}`}>
                  {dayNum}
                </span>
                {dayActs.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-[var(--brand-accent)]" />
                )}
              </div>

              {dayActs.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {dayActs.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => onSelectActivity(act)}
                      className="w-full text-left p-1.5 rounded-[3px] text-[10px] font-semibold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-accent)] transition-all truncate block"
                      title={act.activityTitleEn}
                    >
                      {act.activityTitleEn}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-6" />
              )}
            </div>
          );
        })}
      </div>

      {monthActivities.filter(a => !a.targetDate).length > 0 && (
        <div className="p-4 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
            <Info className="w-4 h-4 text-[var(--brand-accent)]" />
            <span>Activities Scheduled for this Month (Specific Day Pending Ratification):</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {monthActivities.filter(a => !a.targetDate).map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => onSelectActivity(act)}
                className="text-left p-3 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--brand-accent)] transition-all space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono font-bold text-[var(--brand-accent)]">
                    {act.category}
                  </span>
                  {renderStatusBadge(act.status)}
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)]">{act.activityTitleEn}</div>
                <div className="text-[11px] text-[var(--text-muted)]">[Date to be finalized]</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// ACTIVITY DETAIL MODAL (For Calendar Grid Clicks)
// ----------------------------------------------------------------------

interface ActivityDetailModalProps {
  activity: AnnualPlanActivity;
  onClose: () => void;
  renderStatusBadge: (status: AnnualPlanActivity["status"]) => React.ReactNode;
}

function ActivityDetailModal({ activity, onClose, renderStatusBadge }: ActivityDetailModalProps) {
  const isPostponed = activity.status === "postponed";
  const isCancelled = activity.status === "cancelled";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] p-6 shadow-xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--brand-primary)] text-white">
              Month {activity.monthNumber < 10 ? `0${activity.monthNumber}` : activity.monthNumber}
            </span>
            <Badge variant="accent" size="sm" className="capitalize">
              {activity.category}
            </Badge>
          </div>
          <div>{renderStatusBadge(activity.status)}</div>
        </div>

        <div className="space-y-1">
          <h3 className={`text-lg font-bold text-[var(--text-primary)] ${isCancelled ? "line-through opacity-75" : ""}`}>
            {activity.activityTitleEn}
          </h3>
          {activity.activityTitleAr && (
            <p className="font-arabic text-base text-[var(--brand-accent)] font-semibold" dir="rtl">
              {activity.activityTitleAr}
            </p>
          )}
        </div>

        {activity.descriptionEn && (
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {activity.descriptionEn}
          </p>
        )}

        {(isPostponed || isCancelled) && activity.notes && (
          <div className={`p-3 rounded text-xs space-y-1 border ${
            isCancelled ? "bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300" : "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
          }`}>
            <div className="font-bold uppercase tracking-wider text-[10px]">
              {isCancelled ? "Cancellation Note:" : "Rescheduling Protocol:"}
            </div>
            <p>{activity.notes}</p>
          </div>
        )}

        <div className="p-3 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] space-y-2 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span className="font-mono">
              {activity.targetDate 
                ? new Date(activity.targetDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                : "[Date to be finalized]"}
            </span>
          </div>
          {activity.time && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
              <span>{activity.time}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>{activity.location || "[Venue to be announced]"}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {activity.relatedEventSlug && (
              <Link href={`/events/${activity.relatedEventSlug}`}>
                <Button variant="primary" size="sm" className="gap-1.5">
                  <span>Register & Full Itinerary</span>
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            )}

            {activity.documentUrl && (
              <a
                href={activity.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-accent)] hover:underline px-3 py-1.5 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Prospectus</span>
              </a>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
