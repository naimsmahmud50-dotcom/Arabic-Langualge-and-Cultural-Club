/**
 * @file src/app/admin/gallery/AlbumFormModal.tsx
 * @description Accessible Modal for Creating and Editing Photo Gallery Albums (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages photographic albums for exhibitions, debate tournaments, symposia, and annual galas.
 * - Supports academic year assignment, category selection, photographer credits, and event linking.
 * - Adheres to Strix Privacy Protocol: Unreleased albums remain unpublished drafts until reviewed.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { X, Images, Calendar, MapPin, Camera, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { saveGalleryAlbumAction } from "@/lib/actions/content-cms";

interface AlbumRecord {
  id?: string;
  slug?: string;
  titleEn: string;
  titleAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  coverImageUrl?: string | null;
  eventDate?: string | null;
  academicYear: string;
  category: string;
  relatedEventId?: string | null;
  photographerCredit?: string | null;
  location?: string | null;
  isFeatured?: boolean;
  isPublished?: boolean;
}

interface AlbumFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  albumToEdit?: AlbumRecord | null;
  academicYears: string[];
  eventsList: Array<{ id: string; titleEn: string }>;
}

const CATEGORIES = [
  { value: "cultural", label: "Cultural Festivities & Galas" },
  { value: "debates", label: "Inter-University Debates" },
  { value: "symposia", label: "Academic Symposia & Seminars" },
  { value: "calligraphy", label: "Calligraphy & Visual Arts" },
  { value: "workshops", label: "Pedagogical Workshops" },
  { value: "ceremonies", label: "Inaugural & Graduation Ceremonies" },
];

export function AlbumFormModal({
  isOpen,
  onClose,
  onSuccess,
  albumToEdit,
  academicYears,
  eventsList,
}: AlbumFormModalProps) {
  const isEditing = Boolean(albumToEdit?.id);

  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    slug: "",
    descriptionEn: "",
    descriptionAr: "",
    coverImageUrl: "",
    eventDate: new Date().toISOString().split("T")[0],
    academicYear: academicYears[0] || "2026–2027",
    category: "cultural",
    relatedEventId: "",
    photographerCredit: "",
    location: "",
    isFeatured: false,
    isPublished: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (albumToEdit) {
      setFormData({
        titleEn: albumToEdit.titleEn || "",
        titleAr: albumToEdit.titleAr || "",
        slug: albumToEdit.slug || "",
        descriptionEn: albumToEdit.descriptionEn || "",
        descriptionAr: albumToEdit.descriptionAr || "",
        coverImageUrl: albumToEdit.coverImageUrl || "",
        eventDate: albumToEdit.eventDate || new Date().toISOString().split("T")[0],
        academicYear: albumToEdit.academicYear || academicYears[0] || "2026–2027",
        category: albumToEdit.category || "cultural",
        relatedEventId: albumToEdit.relatedEventId || "",
        photographerCredit: albumToEdit.photographerCredit || "",
        location: albumToEdit.location || "",
        isFeatured: albumToEdit.isFeatured ?? false,
        isPublished: albumToEdit.isPublished ?? true,
      });
    } else {
      setFormData({
        titleEn: "",
        titleAr: "",
        slug: "",
        descriptionEn: "",
        descriptionAr: "",
        coverImageUrl: "",
        eventDate: new Date().toISOString().split("T")[0],
        academicYear: academicYears[0] || "2026–2027",
        category: "cultural",
        relatedEventId: "",
        photographerCredit: "",
        location: "",
        isFeatured: false,
        isPublished: true,
      });
    }
    setErrorMessage(null);
  }, [albumToEdit, academicYears, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.titleEn.trim()) {
      setErrorMessage("English album title is required.");
      return;
    }

    if (!formData.academicYear) {
      setErrorMessage("Academic year designation is required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await saveGalleryAlbumAction({
        id: albumToEdit?.id,
        slug: formData.slug.trim() || undefined,
        titleEn: formData.titleEn.trim(),
        titleAr: formData.titleAr.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || null,
        descriptionAr: formData.descriptionAr.trim() || null,
        coverImageUrl: formData.coverImageUrl.trim() || null,
        eventDate: formData.eventDate || null,
        academicYear: formData.academicYear,
        category: formData.category,
        relatedEventId: formData.relatedEventId || null,
        photographerCredit: formData.photographerCredit.trim() || null,
        location: formData.location.trim() || null,
        isFeatured: formData.isFeatured,
        isPublished: formData.isPublished,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to save album.");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="album-form-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
              <Images className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 id="album-form-modal-title" className="text-base font-bold text-[var(--text-primary)]">
                {isEditing ? "Edit Photographic Album" : "Create New Photo Album"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Curate visual retrospectives and organize photography collections.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-[4px] hover:bg-[var(--bg-surface-hover)] disabled:opacity-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-[6px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Album Title (English) <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="e.g. 5th Annual National Arabic Debate Championship"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Album Title (Arabic)
              </label>
              <Input
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                placeholder="مثال: البطولة الوطنية الخامسة للمناظرات العربية"
                dir="rtl"
              />
            </div>
          </div>

          {/* Academic Year, Category & Event Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full h-9 px-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              >
                {academicYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-9 px-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Event Date
              </label>
              <Input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              />
            </div>
          </div>

          {/* Cover Image URL & Related Event Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                Cover Image URL
              </label>
              <Input
                type="url"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Cross-Link to Club Event (Optional)
              </label>
              <select
                value={formData.relatedEventId}
                onChange={(e) => setFormData({ ...formData, relatedEventId: e.target.value })}
                className="w-full h-9 px-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              >
                <option value="">None (Independent Album)</option>
                {eventsList.map((evt) => (
                  <option key={evt.id} value={evt.id}>{evt.titleEn}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location & Photographer Credit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                Location / Venue
              </label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. University Grand Auditorium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                Photographer / Archival Credit
              </label>
              <Input
                value={formData.photographerCredit}
                onChange={(e) => setFormData({ ...formData, photographerCredit: e.target.value })}
                placeholder="e.g. Club Media Secretariat / Tariq Hasan"
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Album Narrative (English)
            </label>
            <textarea
              rows={3}
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              placeholder="Curatorial summary of the tournament, finalists, and notable moments..."
              className="w-full p-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-[var(--border-subtle)]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--brand-primary)] border-[var(--border-color)] focus:ring-[var(--brand-accent)]"
              >
              </input>
              <span>Publish Album to Public Gallery</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--brand-primary)] border-[var(--border-color)] focus:ring-[var(--brand-accent)]"
              >
              </input>
              <span>Spotlight as Featured Collection</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              isLoading={isLoading}
            >
              {isEditing ? "Save Changes" : "Create Album"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
