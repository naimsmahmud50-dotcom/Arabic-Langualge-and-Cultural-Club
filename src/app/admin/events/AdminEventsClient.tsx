/**
 * DEVELOPER NOTE:
 * File: src/app/admin/events/AdminEventsClient.tsx
 * Module: Admin Events & Calendar Operations
 * Phase 8 Enhancement (030-event-to-gallery-website-integration):
 * - Added Photo Archive column and status badges to the events table.
 * - Added "Manage Photos" deep-link to `/admin/gallery?albumId=...` for events with linked albums.
 * - Added "Create Photo Album" direct launcher linking to `/admin/gallery?createForEvent=...` with
 *   event ID, title, date, and venue prefilled, preventing duplicate albums.
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/app/admin/events/AdminEventsClient.tsx
 * @description Comprehensive Administrative Management Console for Events, Annual Plans & Registrations (Feature 016 & 030).
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { AdminConfirmModal } from "@/components/admin";
import { EventFormModal } from "./EventFormModal";
import { EventAttendeesModal } from "./EventAttendeesModal";
import { AnnualPlanActivityModal } from "./AnnualPlanActivityModal";
import { 
  updateEventStatusAction, 
  deleteEventAction, 
  deleteAnnualPlanActivityAction 
} from "@/lib/actions/events";
import { 
  CalendarDays, 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Edit, 
  Trash2, 
  Eye, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  FileText,
  ExternalLink,
  ChevronRight,
  Camera
} from "lucide-react";
import Link from "next/link";

interface EventItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  summaryEn: string;
  summaryAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  category: string;
  startTime: Date | string;
  endTime?: Date | string | null;
  venue: string;
  coverImageUrl?: string | null;
  capacity?: number | null;
  status: "planned" | "confirmed" | "completed" | "postponed" | "cancelled";
  isRegistrationOpen: boolean;
  isPublished: boolean;
  registeredCount: number;
  albumId?: string | null;
  albumSlug?: string | null;
  albumTitleEn?: string | null;
  albumIsPublished?: boolean | null;
}

interface AnnualPlanItem {
  id: string;
  academicYear: string;
  monthNumber: number;
  activityTitleEn: string;
  activityTitleAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  category: string;
  status: "planned" | "confirmed" | "completed" | "postponed" | "cancelled";
  targetDate?: string | null;
  time?: string | null;
  location?: string | null;
  relatedEventId?: string | null;
  relatedEventSlug?: string | null;
  relatedEventTitle?: string | null;
  documentUrl?: string | null;
  documentTitle?: string | null;
  notes?: string | null;
  isPublished: boolean;
}

interface AttendeeItem {
  id: string;
  eventId: string;
  attendeeName: string;
  email: string;
  phone?: string | null;
  studentId?: string | null;
  status: "registered" | "confirmed" | "attended" | "cancelled";
  registeredAt: Date | string;
}

interface AdminEventsClientProps {
  initialEvents: EventItem[];
  initialAnnualPlans: AnnualPlanItem[];
  academicYears: string[];
  eventRegistrationsMap: Record<string, AttendeeItem[]>;
}

const MONTH_LABELS: Record<number, string> = {
  1: "M1 (Sep)",
  2: "M2 (Oct)",
  3: "M3 (Nov)",
  4: "M4 (Dec)",
  5: "M5 (Jan)",
  6: "M6 (Feb)",
  7: "M7 (Mar)",
  8: "M8 (Apr)",
  9: "M9 (May)",
  10: "M10 (Jun)",
  11: "M11 (Jul)",
  12: "M12 (Aug)",
};

export function AdminEventsClient({
  initialEvents,
  initialAnnualPlans,
  academicYears,
  eventRegistrationsMap,
}: AdminEventsClientProps) {
  const router = useRouter();

  // Active Tab: "events" | "annual-plans"
  const [activeTab, setActiveTab] = useState<"events" | "annual-plans">("events");

  // Tab 1 (Events) Filters
  const [eventSearch, setEventSearch] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("all");
  const [eventCategoryFilter, setEventCategoryFilter] = useState("all");

  // Tab 2 (Annual Plans) Filters
  const [planSearch, setPlanSearch] = useState("");
  const [planYearFilter, setPlanYearFilter] = useState(academicYears[0] || "all");
  const [planMonthFilter, setPlanMonthFilter] = useState("all");
  const [planStatusFilter, setPlanStatusFilter] = useState("all");

  // Modals state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);

  const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<EventItem | null>(null);

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<AnnualPlanItem | null>(null);

  // Confirm delete or status change modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    confirmLabel?: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  // Filtered Events
  const filteredEvents = initialEvents.filter((evt) => {
    const matchesStatus = eventStatusFilter === "all" || evt.status === eventStatusFilter;
    const matchesCategory = eventCategoryFilter === "all" || evt.category === eventCategoryFilter;
    const s = eventSearch.toLowerCase();
    const matchesSearch = !eventSearch.trim() ||
      evt.titleEn.toLowerCase().includes(s) ||
      (evt.titleAr && evt.titleAr.includes(s)) ||
      evt.slug.toLowerCase().includes(s) ||
      evt.venue.toLowerCase().includes(s);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  // Filtered Annual Plans
  const filteredPlans = initialAnnualPlans.filter((plan) => {
    const matchesYear = planYearFilter === "all" || plan.academicYear === planYearFilter;
    const matchesMonth = planMonthFilter === "all" || plan.monthNumber === parseInt(planMonthFilter, 10);
    const matchesStatus = planStatusFilter === "all" || plan.status === planStatusFilter;
    const s = planSearch.toLowerCase();
    const matchesSearch = !planSearch.trim() ||
      plan.activityTitleEn.toLowerCase().includes(s) ||
      (plan.activityTitleAr && plan.activityTitleAr.includes(s)) ||
      (plan.location && plan.location.toLowerCase().includes(s));

    return matchesYear && matchesMonth && matchesStatus && matchesSearch;
  });

  // Status Badge Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="accent" size="sm" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Confirmed</Badge>;
      case "planned":
        return <Badge variant="neutral" size="sm">Planned</Badge>;
      case "completed":
        return <Badge variant="outline" size="sm" className="text-[var(--text-muted)]">Completed</Badge>;
      case "postponed":
        return <Badge variant="neutral" size="sm" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Postponed</Badge>;
      case "cancelled":
        return <Badge variant="destructive" size="sm">Cancelled</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  // Event Action Handlers
  const handleOpenCreateEvent = () => {
    setEventToEdit(null);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt: EventItem) => {
    setEventToEdit(evt);
    setIsEventModalOpen(true);
  };

  const handleOpenAttendees = (evt: EventItem) => {
    setSelectedEventForAttendees(evt);
    setIsAttendeesModalOpen(true);
  };

  const handlePromptPostponeEvent = (evt: EventItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Postpone Event",
      message: `Are you sure you want to postpone "${evt.titleEn}"? Public visitors will be notified with a postponement banner while preserving the event dossier and registrations.`,
      isDestructive: false,
      confirmLabel: "Postpone Event",
      onConfirm: async () => {
        await updateEventStatusAction(evt.id, "postponed", "Administrative postponement");
        router.refresh();
      },
    });
  };

  const handlePromptCancelEvent = (evt: EventItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Cancel Event",
      message: `Are you sure you want to cancel "${evt.titleEn}"? The event will remain archived with a cancellation notice to preserve institutional transparency. Existing attendee registrations will be marked cancelled.`,
      isDestructive: true,
      confirmLabel: "Confirm Cancellation",
      onConfirm: async () => {
        await updateEventStatusAction(evt.id, "cancelled", "Administrative cancellation");
        router.refresh();
      },
    });
  };

  const handlePromptDeleteEvent = (evt: EventItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Event Record",
      message: `Are you sure you want to permanently delete "${evt.titleEn}"? This operation cascades to all attendee registrations and cannot be undone.`,
      isDestructive: true,
      confirmLabel: "Permanently Delete",
      onConfirm: async () => {
        await deleteEventAction(evt.id);
        router.refresh();
      },
    });
  };

  // Annual Plan Action Handlers
  const handleOpenCreatePlan = () => {
    setPlanToEdit(null);
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (plan: AnnualPlanItem) => {
    setPlanToEdit(plan);
    setIsPlanModalOpen(true);
  };

  const handlePromptDeletePlan = (plan: AnnualPlanItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Annual Plan Activity",
      message: `Are you sure you want to delete "${plan.activityTitleEn}" from the ${plan.academicYear} itinerary?`,
      isDestructive: true,
      confirmLabel: "Delete Activity",
      onConfirm: async () => {
        await deleteAnnualPlanActivityAction(plan.id);
        router.refresh();
      },
    });
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Activities, Events & Annual Calendar
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Coordinate 12-month annual roadmaps, academic symposiums, seat reservations, and attendance rosters
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-[var(--bg-muted)]/50 p-1 rounded-xl border border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "events"
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>Event Dossiers</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] rounded-full font-bold">
              {initialEvents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("annual-plans")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "annual-plans"
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span>Annual Plan Roadmap</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-full font-bold border border-[var(--border-color)]">
              {initialAnnualPlans.length}
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: EVENT DOSSIERS & REGISTRATIONS                                */}
      {/* ==================================================================== */}
      {activeTab === "events" && (
        <div className="space-y-6">
          {/* Action Bar & Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  type="text"
                  placeholder="Search events, venue, slug..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="pl-8 text-xs w-full"
                />
              </div>

              {/* Status Filter */}
              <select
                value={eventStatusFilter}
                onChange={(e) => setEventStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Category Filter */}
              <select
                value={eventCategoryFilter}
                onChange={(e) => setEventCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
              >
                <option value="all">All Categories</option>
                <option value="academic">Academic</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
                <option value="seminar">Seminar</option>
                <option value="cultural">Cultural</option>
                <option value="social">Social</option>
              </select>
            </div>

            <Button
              variant="accent"
              size="sm"
              onClick={handleOpenCreateEvent}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs font-bold shrink-0"
            >
              Schedule New Event
            </Button>
          </div>

          {/* Events Data Table */}
          <Card className="border-[var(--border-color)] overflow-hidden">
            {filteredEvents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Dossier</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Schedule & Venue</TableHead>
                    <TableHead>Seating & Registrations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Public Admissions</TableHead>
                    <TableHead>Photo Archive</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((evt) => (
                    <TableRow key={evt.id} className="hover:bg-[var(--bg-muted)]/30 transition-colors">
                      <TableCell className="max-w-xs">
                        <div className="font-bold text-xs text-[var(--text-primary)]">
                          {evt.titleEn}
                        </div>
                        {evt.titleAr && (
                          <div className="font-arabic text-xs text-[var(--brand-accent)] mt-0.5" dir="rtl">
                            {evt.titleAr}
                          </div>
                        )}
                        <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">
                          /events/{evt.slug}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="accent" size="sm" className="capitalize">
                          {evt.category}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs font-mono text-[var(--text-primary)] flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-[var(--brand-accent)]" />
                          <span>{new Date(evt.startTime).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
                          <span>{evt.venue}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--text-primary)]">
                            {evt.registeredCount} {evt.capacity ? `/ ${evt.capacity}` : "attendees"}
                          </span>
                          {evt.capacity && evt.registeredCount >= evt.capacity && (
                            <span className="px-1.5 py-0.2 text-[9px] bg-red-500/10 text-red-500 rounded font-bold uppercase">
                              Full
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleOpenAttendees(evt)}
                          className="text-[11px] text-[var(--brand-accent)] hover:underline flex items-center gap-1 mt-0.5 font-medium"
                        >
                          <Users className="w-3 h-3" />
                          <span>View Attendee Roster</span>
                        </button>
                      </TableCell>

                      <TableCell>
                        {renderStatusBadge(evt.status)}
                      </TableCell>

                      <TableCell>
                        <div className="space-y-0.5">
                          <Badge
                            variant={evt.isRegistrationOpen ? "accent" : "neutral"}
                            size="sm"
                          >
                            {evt.isRegistrationOpen ? "Registration Open" : "Registration Closed"}
                          </Badge>
                          {!evt.isPublished && (
                            <div className="text-[10px] text-amber-600 font-medium">
                              Draft (Hidden)
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        {evt.albumId ? (
                          <div className="space-y-1">
                            <Badge
                              variant={evt.albumIsPublished ? "accent" : "neutral"}
                              size="sm"
                              className="text-[10px]"
                            >
                              {evt.albumIsPublished ? "Album Published" : "Album Draft"}
                            </Badge>
                            <Link
                              href={`/admin/gallery?albumId=${evt.albumId}`}
                              className="text-[11px] text-[var(--brand-accent)] hover:underline flex items-center gap-1 font-medium"
                            >
                              <Camera className="w-3 h-3" />
                              <span>Manage Photos</span>
                            </Link>
                          </div>
                        ) : (
                          <Link
                            href={`/admin/gallery?createForEvent=${evt.id}&eventTitle=${encodeURIComponent(evt.titleEn)}&eventDate=${evt.startTime ? new Date(evt.startTime).toISOString().slice(0, 10) : ""}&venue=${encodeURIComponent(evt.venue || "")}`}
                            className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--brand-accent)] hover:underline flex items-center gap-1 font-medium"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Create Album</span>
                          </Link>
                        )}
                      </TableCell>

                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditEvent(evt)}
                          className="text-xs px-2 py-1"
                          title="Edit Event"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>

                        {evt.status === "confirmed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePromptPostponeEvent(evt)}
                            className="text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 px-2 py-1"
                            title="Postpone"
                          >
                            Postpone
                          </Button>
                        )}

                        {evt.status !== "cancelled" && evt.status !== "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePromptCancelEvent(evt)}
                            className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2 py-1"
                            title="Cancel Event"
                          >
                            Cancel
                          </Button>
                        )}

                        <Link href={`/events/${evt.slug}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] px-2 py-1"
                            title="View Public Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePromptDeleteEvent(evt)}
                          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2 py-1"
                          title="Permanently Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 p-6">
                <EmptyState
                  title="No Events Found"
                  description={
                    eventSearch || eventStatusFilter !== "all" || eventCategoryFilter !== "all"
                      ? "No events match the selected filters. Clear your search criteria or schedule a new event."
                      : "The event calendar is currently empty. Start planning the academic session by scheduling an inaugural seminar."
                  }
                  action={
                    <Button variant="accent" size="sm" onClick={handleOpenCreateEvent}>
                      Schedule Inaugural Event
                    </Button>
                  }
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ANNUAL PLAN & MONTHLY ACTIVITIES                              */}
      {/* ==================================================================== */}
      {activeTab === "annual-plans" && (
        <div className="space-y-6">
          {/* Action Bar & Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <Input
                  type="text"
                  placeholder="Search annual plan..."
                  value={planSearch}
                  onChange={(e) => setPlanSearch(e.target.value)}
                  className="pl-8 text-xs w-full"
                />
              </div>

              {/* Academic Year Filter */}
              <select
                value={planYearFilter}
                onChange={(e) => setPlanYearFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] font-mono"
              >
                <option value="all">All Academic Sessions</option>
                {academicYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Month Filter */}
              <select
                value={planMonthFilter}
                onChange={(e) => setPlanMonthFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
              >
                <option value="all">All Months (1–12)</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{MONTH_LABELS[m]}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={planStatusFilter}
                onChange={(e) => setPlanStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
              >
                <option value="all">All Statuses</option>
                <option value="planned">Planned</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <Button
              variant="accent"
              size="sm"
              onClick={handleOpenCreatePlan}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs font-bold shrink-0"
            >
              Schedule Monthly Activity
            </Button>
          </div>

          {/* Annual Plan Table */}
          <Card className="border-[var(--border-color)] overflow-hidden">
            {filteredPlans.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month & Session</TableHead>
                    <TableHead>Activity Title (EN / AR)</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date, Time & Venue</TableHead>
                    <TableHead>Linked Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPlans.map((plan) => (
                    <TableRow key={plan.id} className="hover:bg-[var(--bg-muted)]/30 transition-colors">
                      <TableCell>
                        <div className="font-bold text-xs text-[var(--brand-accent)]">
                          {MONTH_LABELS[plan.monthNumber] || `Month ${plan.monthNumber}`}
                        </div>
                        <div className="text-[10px] font-mono text-[var(--text-muted)]">
                          {plan.academicYear}
                        </div>
                      </TableCell>

                      <TableCell className="max-w-xs">
                        <div className="font-bold text-xs text-[var(--text-primary)]">
                          {plan.activityTitleEn}
                        </div>
                        {plan.activityTitleAr && (
                          <div className="font-arabic text-xs text-[var(--text-secondary)] mt-0.5" dir="rtl">
                            {plan.activityTitleAr}
                          </div>
                        )}
                        {plan.documentTitle && (
                          <div className="text-[10px] text-[var(--brand-accent)] flex items-center gap-1 mt-1">
                            <FileText className="w-3 h-3" />
                            <span>{plan.documentTitle}</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="accent" size="sm" className="capitalize">
                          {plan.category}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="text-xs font-mono text-[var(--text-primary)]">
                          {plan.targetDate || <span className="text-[var(--text-muted)]">Unscheduled</span>}
                        </div>
                        {plan.time && (
                          <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                            {plan.time}
                          </div>
                        )}
                        {plan.location && (
                          <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                            {plan.location}
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        {plan.relatedEventId ? (
                          <Link 
                            href={`/events/${plan.relatedEventSlug}`} 
                            target="_blank"
                            className="inline-flex items-center gap-1 text-xs text-[var(--brand-accent)] hover:underline font-medium"
                          >
                            <span>{plan.relatedEventTitle || "View Event"}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-xs text-[var(--text-muted)]">—</span>
                        )}
                      </TableCell>

                      <TableCell>
                        {renderStatusBadge(plan.status)}
                      </TableCell>

                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditPlan(plan)}
                          className="text-xs px-2 py-1"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePromptDeletePlan(plan)}
                          className="text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 px-2 py-1"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 p-6">
                <EmptyState
                  title="No Annual Plan Activities Found"
                  description={
                    planSearch || planYearFilter !== "all" || planMonthFilter !== "all"
                      ? "No activities matched your search or filter settings."
                      : "Schedule activities for this academic session to display on the 12-month calendar."
                  }
                  action={
                    <Button variant="accent" size="sm" onClick={handleOpenCreatePlan}>
                      Schedule First Activity
                    </Button>
                  }
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODALS & DIALOGS                                                     */}
      {/* ==================================================================== */}

      {/* 1. Event Dossier Form Modal */}
      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSuccess={() => router.refresh()}
        eventToEdit={eventToEdit}
      />

      {/* 2. Attendee Roster & Attendance Modal */}
      {selectedEventForAttendees && (
        <EventAttendeesModal
          isOpen={isAttendeesModalOpen}
          onClose={() => {
            setIsAttendeesModalOpen(false);
            setSelectedEventForAttendees(null);
          }}
          eventId={selectedEventForAttendees.id}
          eventTitle={selectedEventForAttendees.titleEn}
          capacity={selectedEventForAttendees.capacity}
          registrations={eventRegistrationsMap[selectedEventForAttendees.id] || []}
          onAttendanceChanged={() => router.refresh()}
        />
      )}

      {/* 3. Annual Plan Activity Modal */}
      <AnnualPlanActivityModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSuccess={() => router.refresh()}
        activityToEdit={planToEdit}
        eventsList={initialEvents.map(e => ({ id: e.id, titleEn: e.titleEn, category: e.category }))}
        academicYears={academicYears}
      />

      {/* 4. Action Confirmation Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
      />
    </div>
  );
}
