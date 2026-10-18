/**
 * @file src/app/admin/events/EventFormModal.tsx
 * @description Accessible Modal for Creating and Editing Club Event Dossiers (Feature 016).
 * 
 * DEVELOPER USAGE NOTE:
 * - Supports creating new events or editing existing event dossiers.
 * - Handles bilingual titles and descriptions, date/time ranges, venue, capacity, and registration toggles.
 * - Enforces client-side validation (startTime <= endTime).
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { X, Calendar, Clock, MapPin, Users, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { saveEventAction } from "@/lib/actions/events";

interface EventRecord {
  id?: string;
  slug?: string;
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
}

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventToEdit?: EventRecord | null;
}

const CATEGORY_OPTIONS = [
  { value: "academic", label: "Academic Symposium" },
  { value: "workshop", label: "Skills Workshop" },
  { value: "competition", label: "Debate & Oratory Competition" },
  { value: "seminar", label: "Scholarly Seminar" },
  { value: "cultural", label: "Cultural Heritage Showcase" },
  { value: "social", label: "Student & Community Gathering" },
];

export function EventFormModal({ isOpen, onClose, onSuccess, eventToEdit }: EventFormModalProps) {
  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    slug: "",
    summaryEn: "",
    summaryAr: "",
    descriptionEn: "",
    descriptionAr: "",
    category: "academic",
    startTime: "",
    endTime: "",
    venue: "",
    coverImageUrl: "",
    capacity: "",
    status: "confirmed" as "planned" | "confirmed" | "completed" | "postponed" | "cancelled",
    isRegistrationOpen: false,
    isPublished: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to format Date to datetime-local input string (YYYY-MM-DDTHH:mm)
  const formatForDateTimeLocal = (dateInput?: Date | string | null) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        titleEn: eventToEdit.titleEn || "",
        titleAr: eventToEdit.titleAr || "",
        slug: eventToEdit.slug || "",
        summaryEn: eventToEdit.summaryEn || "",
        summaryAr: eventToEdit.summaryAr || "",
        descriptionEn: eventToEdit.descriptionEn || "",
        descriptionAr: eventToEdit.descriptionAr || "",
        category: eventToEdit.category || "academic",
        startTime: formatForDateTimeLocal(eventToEdit.startTime),
        endTime: formatForDateTimeLocal(eventToEdit.endTime),
        venue: eventToEdit.venue || "",
        coverImageUrl: eventToEdit.coverImageUrl || "",
        capacity: eventToEdit.capacity ? eventToEdit.capacity.toString() : "",
        status: eventToEdit.status || "confirmed",
        isRegistrationOpen: !!eventToEdit.isRegistrationOpen,
        isPublished: eventToEdit.isPublished !== undefined ? !!eventToEdit.isPublished : true,
      });
    } else {
      // Default dates: tomorrow 10:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(13, 0, 0, 0);

      setFormData({
        titleEn: "",
        titleAr: "",
        slug: "",
        summaryEn: "",
        summaryAr: "",
        descriptionEn: "",
        descriptionAr: "",
        category: "academic",
        startTime: formatForDateTimeLocal(tomorrow),
        endTime: formatForDateTimeLocal(tomorrowEnd),
        venue: "",
        coverImageUrl: "",
        capacity: "60",
        status: "confirmed",
        isRegistrationOpen: true,
        isPublished: true,
      });
    }
    setError(null);
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.titleEn.trim()) {
      setError("English title is required.");
      return;
    }

    if (!formData.summaryEn.trim()) {
      setError("Brief summary is required.");
      return;
    }

    if (!formData.startTime) {
      setError("Start date and time are required.");
      return;
    }

    if (!formData.venue.trim()) {
      setError("Venue location is required.");
      return;
    }

    const start = new Date(formData.startTime);
    const end = formData.endTime ? new Date(formData.endTime) : null;

    if (end && start > end) {
      setError("Start date/time must precede or equal end date/time.");
      return;
    }

    setLoading(true);

    try {
      const res = await saveEventAction({
        id: eventToEdit?.id,
        slug: formData.slug.trim() || undefined,
        titleEn: formData.titleEn.trim(),
        titleAr: formData.titleAr.trim() || null,
        summaryEn: formData.summaryEn.trim(),
        summaryAr: formData.summaryAr.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || null,
        descriptionAr: formData.descriptionAr.trim() || null,
        category: formData.category,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        venue: formData.venue.trim(),
        coverImageUrl: formData.coverImageUrl.trim() || null,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        status: formData.status,
        isRegistrationOpen: formData.isRegistrationOpen,
        isPublished: formData.isPublished,
      });

      if (!res.success) {
        setError(res.error || "Failed to save event dossier.");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-muted)]/30">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {eventToEdit ? "Edit Event Dossier" : "Schedule New Event Dossier"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Institutional calendar and public registration details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Bilingual Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Event Title (English) <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Classical Arabic Rhetoric Symposium"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Event Title (Arabic)
              </label>
              <Input
                type="text"
                dir="rtl"
                placeholder="مثال: ندوة البلاغة والبيان العربي"
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                className="w-full text-xs font-arabic"
              />
            </div>
          </div>

          {/* Category, Status, Custom Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Lifecycle Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] font-medium"
              >
                <option value="confirmed">Confirmed</option>
                <option value="planned">Planned (Draft)</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                URL Slug (Optional)
              </label>
              <Input
                type="text"
                placeholder="auto-generated-from-title"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full text-xs font-mono"
              />
            </div>
          </div>

          {/* Start Time, End Time, Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                End Date & Time
              </label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Venue Location <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Main University Auditorium"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* Seating Capacity & Cover Image URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Seating Capacity Limit
              </label>
              <Input
                type="number"
                min="1"
                placeholder="Leave blank for unlimited"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full text-xs"
              />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Server will block registrations once this capacity count is reached.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Cover Image URL
              </label>
              <Input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* Brief Summary (EN & AR) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Summary (English) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Concise overview displayed in event cards and listings..."
                value={formData.summaryEn}
                onChange={(e) => setFormData({ ...formData, summaryEn: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Summary (Arabic)
              </label>
              <textarea
                rows={3}
                dir="rtl"
                placeholder="موجز موجز يُعرض في بطاقات الفعاليات..."
                value={formData.summaryAr}
                onChange={(e) => setFormData({ ...formData, summaryAr: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] resize-y font-arabic"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Full Program Description (English)
            </label>
            <textarea
              rows={4}
              placeholder="Detailed schedule, guest speakers, syllabus, or preparation guidelines..."
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] resize-y"
            />
          </div>

          {/* Registration & Publication Controls */}
          <div className="p-4 bg-[var(--bg-muted)]/30 border border-[var(--border-color)] rounded-lg space-y-3">
            <h4 className="text-xs font-bold text-[var(--text-primary)]">Public Visibility & Admissions</h4>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRegistrationOpen}
                  onChange={(e) => setFormData({ ...formData, isRegistrationOpen: e.target.checked })}
                  className="rounded border-[var(--border-color)] text-[var(--brand-accent)] focus:ring-[var(--brand-accent)]"
                />
                <div>
                  <span className="text-xs font-medium text-[var(--text-primary)]">Enable Public Attendee Registration</span>
                  <p className="text-[10px] text-[var(--text-muted)]">Displays registration form on `/events/[slug]`</p>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded border-[var(--border-color)] text-[var(--brand-accent)] focus:ring-[var(--brand-accent)]"
                />
                <div>
                  <span className="text-xs font-medium text-[var(--text-primary)]">Publish on Public Calendar</span>
                  <p className="text-[10px] text-[var(--text-muted)]">When unchecked, event is draft / internal only</p>
                </div>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              disabled={loading}
              className="text-xs font-bold"
            >
              {loading ? "Persisting Dossier..." : eventToEdit ? "Update Event Dossier" : "Publish Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
