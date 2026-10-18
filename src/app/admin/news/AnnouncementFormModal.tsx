/**
 * @file src/app/admin/news/AnnouncementFormModal.tsx
 * @description Accessible Modal for Authoring and Editing Club Announcements (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages editorial bulletins, official notices, and news articles for the Arabic Club.
 * - Supports rich Markdown body text in English and Arabic, priority pinning, and publication states.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { X, Newspaper, Pin, User, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { saveAnnouncementAction } from "@/lib/actions/content-cms";

interface AnnouncementRecord {
  id?: string;
  slug?: string;
  titleEn: string;
  titleAr?: string | null;
  summaryEn?: string | null;
  summaryAr?: string | null;
  contentEn: string;
  contentAr?: string | null;
  category: string;
  coverImageUrl?: string | null;
  authorName?: string | null;
  status: "draft" | "published" | "archived";
  isPinned: boolean;
  isPublished: boolean;
}

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  announcementToEdit?: AnnouncementRecord | null;
}

const CATEGORIES = [
  { value: "notice", label: "Official Administrative Notice" },
  { value: "news", label: "Club News & Updates" },
  { value: "press", label: "Press Release & External Memo" },
  { value: "academic", label: "Academic Advisory & Lecture Note" },
  { value: "achievement", label: "Distinction & Recognition" },
];

export function AnnouncementFormModal({
  isOpen,
  onClose,
  onSuccess,
  announcementToEdit,
}: AnnouncementFormModalProps) {
  const isEditing = Boolean(announcementToEdit?.id);

  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    slug: "",
    summaryEn: "",
    summaryAr: "",
    contentEn: "",
    contentAr: "",
    category: "notice",
    coverImageUrl: "",
    authorName: "",
    status: "published" as "draft" | "published" | "archived",
    isPinned: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (announcementToEdit) {
      setFormData({
        titleEn: announcementToEdit.titleEn || "",
        titleAr: announcementToEdit.titleAr || "",
        slug: announcementToEdit.slug || "",
        summaryEn: announcementToEdit.summaryEn || "",
        summaryAr: announcementToEdit.summaryAr || "",
        contentEn: announcementToEdit.contentEn || "",
        contentAr: announcementToEdit.contentAr || "",
        category: announcementToEdit.category || "notice",
        coverImageUrl: announcementToEdit.coverImageUrl || "",
        authorName: announcementToEdit.authorName || "",
        status: announcementToEdit.status || "published",
        isPinned: announcementToEdit.isPinned ?? false,
      });
    } else {
      setFormData({
        titleEn: "",
        titleAr: "",
        slug: "",
        summaryEn: "",
        summaryAr: "",
        contentEn: "",
        contentAr: "",
        category: "notice",
        coverImageUrl: "",
        authorName: "Editorial Secretariat",
        status: "published",
        isPinned: false,
      });
    }
    setErrorMessage(null);
  }, [announcementToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.titleEn.trim()) {
      setErrorMessage("English title is required.");
      return;
    }

    if (!formData.contentEn.trim()) {
      setErrorMessage("English announcement body content is required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await saveAnnouncementAction({
        id: announcementToEdit?.id,
        slug: formData.slug.trim() || undefined,
        titleEn: formData.titleEn.trim(),
        titleAr: formData.titleAr.trim() || null,
        summaryEn: formData.summaryEn.trim() || null,
        summaryAr: formData.summaryAr.trim() || null,
        contentEn: formData.contentEn.trim(),
        contentAr: formData.contentAr.trim() || null,
        category: formData.category,
        coverImageUrl: formData.coverImageUrl.trim() || null,
        authorName: formData.authorName.trim() || null,
        status: formData.status,
        isPinned: formData.isPinned,
        isPublished: formData.status === "published",
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to save announcement.");
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
      aria-labelledby="announcement-form-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
              <Newspaper className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 id="announcement-form-modal-title" className="text-base font-bold text-[var(--text-primary)]">
                {isEditing ? "Edit News Bulletin" : "Author Official Announcement"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Publish verified updates, notices, and press releases for club constituents.
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
                Headline / Title (English) <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="e.g. Schedule Announced for Classical Arabic Seminar Series"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Headline / Title (Arabic)
              </label>
              <Input
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                placeholder="مثال: الإعلان عن جدول ندوات اللغة العربية الكلاسيكية"
                dir="rtl"
              />
            </div>
          </div>

          {/* Category, Status & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                Publication Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full h-9 px-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              >
                <option value="published">Published (Visible Publicly)</option>
                <option value="draft">Draft (Restricted to Admins)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Author Attribution
              </label>
              <Input
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                placeholder="e.g. Editorial Secretariat"
              />
            </div>
          </div>

          {/* Cover Image URL & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Cover Image URL
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
                Custom URL Slug (Optional)
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated-from-title"
              />
            </div>
          </div>

          {/* Summaries */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Summary Lead (English)
              </label>
              <textarea
                rows={2}
                value={formData.summaryEn}
                onChange={(e) => setFormData({ ...formData, summaryEn: e.target.value })}
                placeholder="Concise 1-2 sentence lead paragraph for card previews..."
                className="w-full p-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Summary Lead (Arabic)
              </label>
              <textarea
                rows={2}
                value={formData.summaryAr}
                onChange={(e) => setFormData({ ...formData, summaryAr: e.target.value })}
                placeholder="موجز صحفي قصير للعرض في البطاقات..."
                dir="rtl"
                className="w-full p-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] font-arabic"
              />
            </div>
          </div>

          {/* Full Markdown Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Article Body Content (English Markdown) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={6}
              value={formData.contentEn}
              onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
              placeholder="Full announcement narrative text, details, guidelines, or schedule..."
              required
              className="w-full p-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Article Body Content (Arabic Markdown, Optional)
            </label>
            <textarea
              rows={4}
              value={formData.contentAr}
              onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
              placeholder="نص الإعلان الكامل باللغة العربية..."
              dir="rtl"
              className="w-full p-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-arabic focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
            />
          </div>

          {/* Priority Pinning Toggle */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--brand-primary)] border-[var(--border-color)] focus:ring-[var(--brand-accent)]"
              />
              <span className="flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5 text-amber-500" />
                Pin Bulletin to Top of Public Announcements
              </span>
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
              {isEditing ? "Save Changes" : "Publish Announcement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
