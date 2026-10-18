/**
 * @file src/app/admin/events/AnnualPlanActivityModal.tsx
 * @description Accessible Modal for Scheduling Annual Plan Monthly Activities (Feature 016).
 * 
 * DEVELOPER USAGE NOTE:
 * - Supports creating and editing 12-month calendar activities linked to an academic year.
 * - Allows cross-linking an annual plan activity to a full event dossier.
 * - Validates month numbers (1 to 12), dates, and categories.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { X, Calendar, MapPin, Clock, FileText, AlertCircle, Link as LinkIcon } from "lucide-react";
import { saveAnnualPlanActivityAction } from "@/lib/actions/events";

interface AnnualPlanRecord {
  id?: string;
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
  documentUrl?: string | null;
  documentTitle?: string | null;
  notes?: string | null;
  isPublished: boolean;
}

interface EventOption {
  id: string;
  titleEn: string;
  category: string;
}

interface AnnualPlanActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  activityToEdit?: AnnualPlanRecord | null;
  eventsList: EventOption[];
  academicYears: string[];
}

const MONTH_NAMES = [
  "Month 1 (September / Muharram)",
  "Month 2 (October / Safar)",
  "Month 3 (November / Rabi' al-Awwal)",
  "Month 4 (December / Rabi' al-Thani)",
  "Month 5 (January / Jumada al-Ula)",
  "Month 6 (February / Jumada al-Thani)",
  "Month 7 (March / Rajab)",
  "Month 8 (April / Sha'ban)",
  "Month 9 (May / Ramadan)",
  "Month 10 (June / Shawwal)",
  "Month 11 (July / Dhu al-Qi'dah)",
  "Month 12 (August / Dhu al-Hijjah)",
];

const CATEGORY_OPTIONS = [
  { value: "academic", label: "Academic Symposium" },
  { value: "workshop", label: "Skills Workshop" },
  { value: "competition", label: "Debate & Oratory" },
  { value: "seminar", label: "Scholarly Seminar" },
  { value: "cultural", label: "Cultural Showcase" },
  { value: "social", label: "Community Gathering" },
];

export function AnnualPlanActivityModal({
  isOpen,
  onClose,
  onSuccess,
  activityToEdit,
  eventsList,
  academicYears,
}: AnnualPlanActivityModalProps) {
  const [formData, setFormData] = useState({
    academicYear: academicYears[0] || "2024–2025",
    monthNumber: 1,
    activityTitleEn: "",
    activityTitleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    category: "academic",
    status: "planned" as "planned" | "confirmed" | "completed" | "postponed" | "cancelled",
    targetDate: "",
    time: "",
    location: "",
    relatedEventId: "",
    documentUrl: "",
    documentTitle: "",
    notes: "",
    isPublished: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activityToEdit) {
      setFormData({
        academicYear: activityToEdit.academicYear || (academicYears[0] || "2024–2025"),
        monthNumber: activityToEdit.monthNumber || 1,
        activityTitleEn: activityToEdit.activityTitleEn || "",
        activityTitleAr: activityToEdit.activityTitleAr || "",
        descriptionEn: activityToEdit.descriptionEn || "",
        descriptionAr: activityToEdit.descriptionAr || "",
        category: activityToEdit.category || "academic",
        status: activityToEdit.status || "planned",
        targetDate: activityToEdit.targetDate || "",
        time: activityToEdit.time || "",
        location: activityToEdit.location || "",
        relatedEventId: activityToEdit.relatedEventId || "",
        documentUrl: activityToEdit.documentUrl || "",
        documentTitle: activityToEdit.documentTitle || "",
        notes: activityToEdit.notes || "",
        isPublished: activityToEdit.isPublished !== undefined ? !!activityToEdit.isPublished : true,
      });
    } else {
      setFormData({
        academicYear: academicYears[0] || "2024–2025",
        monthNumber: 1,
        activityTitleEn: "",
        activityTitleAr: "",
        descriptionEn: "",
        descriptionAr: "",
        category: "academic",
        status: "planned",
        targetDate: "",
        time: "",
        location: "",
        relatedEventId: "",
        documentUrl: "",
        documentTitle: "",
        notes: "",
        isPublished: true,
      });
    }
    setError(null);
  }, [activityToEdit, isOpen, academicYears]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.activityTitleEn.trim()) {
      setError("English activity title is required.");
      return;
    }

    if (formData.monthNumber < 1 || formData.monthNumber > 12) {
      setError("Month number must be between 1 and 12.");
      return;
    }

    setLoading(true);

    try {
      const res = await saveAnnualPlanActivityAction({
        id: activityToEdit?.id,
        academicYear: formData.academicYear.trim(),
        monthNumber: Number(formData.monthNumber),
        activityTitleEn: formData.activityTitleEn.trim(),
        activityTitleAr: formData.activityTitleAr.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || null,
        descriptionAr: formData.descriptionAr.trim() || null,
        category: formData.category,
        status: formData.status,
        targetDate: formData.targetDate.trim() || null,
        time: formData.time.trim() || null,
        location: formData.location.trim() || null,
        relatedEventId: formData.relatedEventId.trim() || null,
        documentUrl: formData.documentUrl.trim() || null,
        documentTitle: formData.documentTitle.trim() || null,
        notes: formData.notes.trim() || null,
        isPublished: formData.isPublished,
      });

      if (!res.success) {
        setError(res.error || "Failed to save annual plan activity.");
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-muted)]/30">
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {activityToEdit ? "Edit Annual Plan Activity" : "Schedule Annual Plan Activity"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Month-by-month academic calendar milestone
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

        {/* Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Academic Year, Month Selector, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. 2024–2025"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Academic Month <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.monthNumber}
                onChange={(e) => setFormData({ ...formData, monthNumber: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] font-medium"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>

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
          </div>

          {/* Activity Title (EN / AR) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Activity Title (English) <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Annual Arabic Calligraphy Exhibition"
                value={formData.activityTitleEn}
                onChange={(e) => setFormData({ ...formData, activityTitleEn: e.target.value })}
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Activity Title (Arabic)
              </label>
              <Input
                type="text"
                dir="rtl"
                placeholder="مثال: المعرض السنوي للخط العربي"
                value={formData.activityTitleAr}
                onChange={(e) => setFormData({ ...formData, activityTitleAr: e.target.value })}
                className="w-full text-xs font-arabic"
              />
            </div>
          </div>

          {/* Target Date, Time, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Target Date (Optional)
              </label>
              <Input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Time (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. 10:00 AM - 1:00 PM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Location (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. Faculty Auditorium"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* Operational Status & Related Event Cross-Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Operational Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] font-medium"
              >
                <option value="planned">Planned</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Link to Event Dossier (Optional)
              </label>
              <select
                value={formData.relatedEventId}
                onChange={(e) => setFormData({ ...formData, relatedEventId: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
              >
                <option value="">No linked event dossier</option>
                {eventsList.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.titleEn} ({evt.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Approved Document Attachment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Document Title (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. Official Competition Guidelines PDF"
                value={formData.documentTitle}
                onChange={(e) => setFormData({ ...formData, documentTitle: e.target.value })}
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Document URL
              </label>
              <Input
                type="url"
                placeholder="https://.../document.pdf"
                value={formData.documentUrl}
                onChange={(e) => setFormData({ ...formData, documentUrl: e.target.value })}
                className="w-full text-xs"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Description (English)
              </label>
              <textarea
                rows={3}
                placeholder="Summary of this activity's goals, participants, and outcomes..."
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] resize-y"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
                Description (Arabic)
              </label>
              <textarea
                rows={3}
                dir="rtl"
                placeholder="تفاصيل النشاط باللغة العربية..."
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] resize-y font-arabic"
              />
            </div>
          </div>

          {/* Internal Notes & Publication Toggle */}
          <div className="p-4 bg-[var(--bg-muted)]/30 border border-[var(--border-color)] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Internal Administrative Notes
              </label>
              <Input
                type="text"
                placeholder="Operational reminders (not shown to public visitors)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full text-xs"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer shrink-0 pt-3 sm:pt-0">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="rounded border-[var(--border-color)] text-[var(--brand-accent)] focus:ring-[var(--brand-accent)]"
              />
              <div>
                <span className="text-xs font-medium text-[var(--text-primary)]">Publish Activity</span>
                <p className="text-[10px] text-[var(--text-muted)]">Visible on public annual calendar</p>
              </div>
            </label>
          </div>

          {/* Footer */}
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
              {loading ? "Saving Activity..." : activityToEdit ? "Update Activity" : "Schedule Activity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
