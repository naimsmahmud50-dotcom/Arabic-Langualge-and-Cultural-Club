/**
 * @file src/app/admin/publications/PublicationFormModal.tsx
 * @description Accessible Modal for Registering and Editing Club Publications (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages periodicals, magazines (e.g. Al-Bayan), annual activity reports, and research journals.
 * - Enforces PDF document links, publication dates, and bilingual metadata.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { X, Book, Link as LinkIcon, FileText, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { savePublicationAction } from "@/lib/actions/content-cms";

interface PublicationRecord {
  id?: string;
  slug?: string;
  titleEn: string;
  titleAr?: string | null;
  publicationType: "magazine" | "newsletter" | "journal" | "report";
  issueNo?: string | null;
  publicationDate?: string | null;
  coverImageUrl?: string | null;
  fileUrl: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  isPublished: boolean;
}

interface PublicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  publicationToEdit?: PublicationRecord | null;
}

const PUBLICATION_TYPES = [
  { value: "magazine", label: "Official Club Magazine (Majallah)" },
  { value: "newsletter", label: "Monthly Newsletter Bulletin" },
  { value: "journal", label: "Academic Research Journal" },
  { value: "report", label: "Annual Institutional Report" },
];

export function PublicationFormModal({
  isOpen,
  onClose,
  onSuccess,
  publicationToEdit,
}: PublicationFormModalProps) {
  const isEditing = Boolean(publicationToEdit?.id);

  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    slug: "",
    publicationType: "magazine" as "magazine" | "newsletter" | "journal" | "report",
    issueNo: "",
    publicationDate: new Date().toISOString().split("T")[0],
    coverImageUrl: "",
    fileUrl: "",
    descriptionEn: "",
    descriptionAr: "",
    isPublished: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (publicationToEdit) {
      setFormData({
        titleEn: publicationToEdit.titleEn || "",
        titleAr: publicationToEdit.titleAr || "",
        slug: publicationToEdit.slug || "",
        publicationType: publicationToEdit.publicationType || "magazine",
        issueNo: publicationToEdit.issueNo || "",
        publicationDate: publicationToEdit.publicationDate || new Date().toISOString().split("T")[0],
        coverImageUrl: publicationToEdit.coverImageUrl || "",
        fileUrl: publicationToEdit.fileUrl || "",
        descriptionEn: publicationToEdit.descriptionEn || "",
        descriptionAr: publicationToEdit.descriptionAr || "",
        isPublished: publicationToEdit.isPublished ?? true,
      });
    } else {
      setFormData({
        titleEn: "",
        titleAr: "",
        slug: "",
        publicationType: "magazine",
        issueNo: "Vol. 1, Issue 1",
        publicationDate: new Date().toISOString().split("T")[0],
        coverImageUrl: "",
        fileUrl: "",
        descriptionEn: "",
        descriptionAr: "",
        isPublished: true,
      });
    }
    setErrorMessage(null);
  }, [publicationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.titleEn.trim()) {
      setErrorMessage("English publication title is required.");
      return;
    }

    if (!formData.fileUrl.trim()) {
      setErrorMessage("Document file URL (PDF) is required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await savePublicationAction({
        id: publicationToEdit?.id,
        slug: formData.slug.trim() || undefined,
        titleEn: formData.titleEn.trim(),
        titleAr: formData.titleAr.trim() || null,
        publicationType: formData.publicationType,
        issueNo: formData.issueNo.trim() || null,
        publicationDate: formData.publicationDate || null,
        coverImageUrl: formData.coverImageUrl.trim() || null,
        fileUrl: formData.fileUrl.trim(),
        descriptionEn: formData.descriptionEn.trim() || null,
        descriptionAr: formData.descriptionAr.trim() || null,
        isPublished: formData.isPublished,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to save publication.");
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
      aria-labelledby="publication-form-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
              <Book className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 id="publication-form-modal-title" className="text-base font-bold text-[var(--text-primary)]">
                {isEditing ? "Edit Publication Issue" : "Register Periodical Publication"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Curate official journals, magazines, and annual institutional reports.
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
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
                Publication Title (English) <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="e.g. Al-Bayan Cultural Review - Volume 2"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Publication Title (Arabic)
              </label>
              <Input
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                placeholder="مثال: مجلة البيان الثقافية - العدد الثاني"
                dir="rtl"
              />
            </div>
          </div>

          {/* Type, Issue No & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Publication Type
              </label>
              <select
                value={formData.publicationType}
                onChange={(e) => setFormData({ ...formData, publicationType: e.target.value as any })}
                className="w-full h-9 px-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              >
                {PUBLICATION_TYPES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Issue / Edition Number
              </label>
              <Input
                value={formData.issueNo}
                onChange={(e) => setFormData({ ...formData, issueNo: e.target.value })}
                placeholder="e.g. Issue 4, Autumn 2025"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Release Date
              </label>
              <Input
                type="date"
                value={formData.publicationDate}
                onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
              />
            </div>
          </div>

          {/* File URL (PDF) & Cover Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" /> PDF Document Link <span className="text-red-500">*</span>
              </label>
              <Input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="https://example.com/publications/al-bayan-vol2.pdf"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Cover Artwork URL
              </label>
              <Input
                type="url"
                value={formData.coverImageUrl}
                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Curatorial Description (English)
            </label>
            <textarea
              rows={3}
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              placeholder="Table of contents, contributing student essays, or editorial foreword..."
              className="w-full p-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
            />
          </div>

          {/* Publish Toggle */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 rounded text-[var(--brand-primary)] border-[var(--border-color)] focus:ring-[var(--brand-accent)]"
              />
              <span>Publish Periodical to Public Catalog</span>
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
              {isEditing ? "Save Changes" : "Save Publication"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
