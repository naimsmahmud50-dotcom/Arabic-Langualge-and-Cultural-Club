/**
 * @file src/app/admin/resources/ResourceFormModal.tsx
 * @description Accessible Modal for Authoring and Editing Arabic Learning Resources (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages pedagogical treatises, vocabulary lists, grammar guides, and downloadable PDFs.
 * - Categorized by classical disciplines (Nahw, Sarf, Balaghah) and proficiency tiers.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { X, BookOpen, Link as LinkIcon, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { saveLearningResourceAction } from "@/lib/actions/content-cms";

interface ResourceRecord {
  id?: string;
  slug?: string;
  titleEn: string;
  titleAr?: string | null;
  category: "grammar" | "morphology" | "rhetoric" | "vocabulary" | "literature" | "reading" | "general";
  skillLevel: "beginner" | "intermediate" | "advanced";
  fileUrl?: string | null;
  contentEn?: string | null;
  contentAr?: string | null;
  isPublished: boolean;
}

interface ResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resourceToEdit?: ResourceRecord | null;
}

const CATEGORIES = [
  { value: "grammar", label: "Classical Grammar (Nahw)" },
  { value: "morphology", label: "Word Morphology (Sarf)" },
  { value: "rhetoric", label: "Rhetoric & Eloquence (Balaghah)" },
  { value: "vocabulary", label: "Lexicon & Vocabulary (Mufradat)" },
  { value: "literature", label: "Prose & Poetry (Adab)" },
  { value: "reading", label: "Reading Comprehension (Qira'ah)" },
  { value: "general", label: "General Linguistics" },
];

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner (Mubtadi')" },
  { value: "intermediate", label: "Intermediate (Mutawassit)" },
  { value: "advanced", label: "Advanced (Mutaqaddim)" },
];

export function ResourceFormModal({
  isOpen,
  onClose,
  onSuccess,
  resourceToEdit,
}: ResourceFormModalProps) {
  const isEditing = Boolean(resourceToEdit?.id);

  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    slug: "",
    category: "grammar" as any,
    skillLevel: "beginner" as any,
    fileUrl: "",
    contentEn: "",
    contentAr: "",
    isPublished: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (resourceToEdit) {
      setFormData({
        titleEn: resourceToEdit.titleEn || "",
        titleAr: resourceToEdit.titleAr || "",
        slug: resourceToEdit.slug || "",
        category: resourceToEdit.category || "grammar",
        skillLevel: resourceToEdit.skillLevel || "beginner",
        fileUrl: resourceToEdit.fileUrl || "",
        contentEn: resourceToEdit.contentEn || "",
        contentAr: resourceToEdit.contentAr || "",
        isPublished: resourceToEdit.isPublished ?? true,
      });
    } else {
      setFormData({
        titleEn: "",
        titleAr: "",
        slug: "",
        category: "grammar",
        skillLevel: "beginner",
        fileUrl: "",
        contentEn: "",
        contentAr: "",
        isPublished: true,
      });
    }
    setErrorMessage(null);
  }, [resourceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.titleEn.trim()) {
      setErrorMessage("English resource title is required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await saveLearningResourceAction({
        id: resourceToEdit?.id,
        slug: formData.slug.trim() || undefined,
        titleEn: formData.titleEn.trim(),
        titleAr: formData.titleAr.trim() || null,
        category: formData.category,
        skillLevel: formData.skillLevel,
        fileUrl: formData.fileUrl.trim() || null,
        contentEn: formData.contentEn.trim() || null,
        contentAr: formData.contentAr.trim() || null,
        isPublished: formData.isPublished,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to save learning resource.");
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
      aria-labelledby="resource-form-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
              <BookOpen className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 id="resource-form-modal-title" className="text-base font-bold text-[var(--text-primary)]">
                {isEditing ? "Edit Learning Resource" : "Register Arabic Learning Resource"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Curate grammar treatises, morphology tables, and vocabulary downloads.
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
                Resource Title (English) <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="e.g. Concise Introduction to Arabic Nominal Sentences"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Resource Title (Arabic)
              </label>
              <Input
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                placeholder="مثال: المدخل الوجيز إلى الجملة الاسمية"
                dir="rtl"
              />
            </div>
          </div>

          {/* Category & Skill Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Linguistic Discipline (Category)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full h-9 px-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Proficiency Tier (Skill Level)
              </label>
              <select
                value={formData.skillLevel}
                onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value as any })}
                className="w-full h-9 px-3 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              >
                {SKILL_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Download File URL & Custom Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Download Document URL (PDF)
              </label>
              <Input
                type="url"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                placeholder="https://example.com/resources/jumla-ismiyya.pdf"
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

          {/* Pedagogical Notes / Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Study Guide / Pedagogical Summary (English)
            </label>
            <textarea
              rows={3}
              value={formData.contentEn}
              onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
              placeholder="Summary of grammatical rules, Mubarakfuri notes, or reading instructions..."
              className="w-full p-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Arabic Pedagogical Text (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.contentAr}
              onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
              placeholder="القواعد والشواهد النحوية..."
              dir="rtl"
              className="w-full p-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-arabic focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
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
              <span>Publish Resource to Public Learning Hub</span>
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
              {isEditing ? "Save Changes" : "Save Resource"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
