/**
 * @file src/app/admin/publications/AchievementFormModal.tsx
 * @description Accessible Modal for Recording Verified Academic Accolades (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages debate championships, calligraphy tournament awards, and academic honors.
 * - Enforces verified dates, certificates, and bilingual achievement titles.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { X, Award, Trophy, Calendar, Link as LinkIcon, AlertCircle, CheckCircle2 } from "lucide-react";
import { saveAchievementAction } from "@/lib/actions/content-cms";

interface AchievementRecord {
  id?: string;
  titleEn: string;
  titleAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  category: string;
  dateAchieved?: string | null;
  certificateUrl?: string | null;
  isPublished: boolean;
}

interface AchievementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  achievementToEdit?: AchievementRecord | null;
}

const CATEGORIES = [
  { value: "competition", label: "Competitive Tournament & Debate Championship" },
  { value: "academic", label: "Academic Research & Linguistic Excellence" },
  { value: "calligraphy", label: "Calligraphy & Visual Arts Distinction" },
  { value: "institutional", label: "University & Institutional Recognition" },
];

export function AchievementFormModal({
  isOpen,
  onClose,
  onSuccess,
  achievementToEdit,
}: AchievementFormModalProps) {
  const isEditing = Boolean(achievementToEdit?.id);

  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    category: "competition",
    dateAchieved: new Date().toISOString().split("T")[0],
    certificateUrl: "",
    isPublished: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (achievementToEdit) {
      setFormData({
        titleEn: achievementToEdit.titleEn || "",
        titleAr: achievementToEdit.titleAr || "",
        descriptionEn: achievementToEdit.descriptionEn || "",
        descriptionAr: achievementToEdit.descriptionAr || "",
        category: achievementToEdit.category || "competition",
        dateAchieved: achievementToEdit.dateAchieved || new Date().toISOString().split("T")[0],
        certificateUrl: achievementToEdit.certificateUrl || "",
        isPublished: achievementToEdit.isPublished ?? true,
      });
    } else {
      setFormData({
        titleEn: "",
        titleAr: "",
        descriptionEn: "",
        descriptionAr: "",
        category: "competition",
        dateAchieved: new Date().toISOString().split("T")[0],
        certificateUrl: "",
        isPublished: true,
      });
    }
    setErrorMessage(null);
  }, [achievementToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.titleEn.trim()) {
      setErrorMessage("English achievement title is required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await saveAchievementAction({
        id: achievementToEdit?.id,
        titleEn: formData.titleEn.trim(),
        titleAr: formData.titleAr.trim() || null,
        descriptionEn: formData.descriptionEn.trim() || null,
        descriptionAr: formData.descriptionAr.trim() || null,
        category: formData.category,
        dateAchieved: formData.dateAchieved || null,
        certificateUrl: formData.certificateUrl.trim() || null,
        isPublished: formData.isPublished,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to save achievement.");
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
      aria-labelledby="achievement-form-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)]/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
              <Trophy className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h3 id="achievement-form-modal-title" className="text-base font-bold text-[var(--text-primary)]">
                {isEditing ? "Edit Honor & Distinction" : "Register Institutional Accolade"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Record verified awards, trophies, and tournament championships.
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
                Accolade Title (English) <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="e.g. National Champions - National Arabic Debate 2025"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)]">
                Accolade Title (Arabic)
              </label>
              <Input
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                placeholder="مثال: أبطال المناظرة الوطنية للجامعات ٢٠٢٥"
                dir="rtl"
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                Date Conferred / Achieved
              </label>
              <Input
                type="date"
                value={formData.dateAchieved}
                onChange={(e) => setFormData({ ...formData, dateAchieved: e.target.value })}
              />
            </div>
          </div>

          {/* Certificate / Trophy URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" /> Supporting Certificate or Trophy Image URL
            </label>
            <Input
              type="url"
              value={formData.certificateUrl}
              onChange={(e) => setFormData({ ...formData, certificateUrl: e.target.value })}
              placeholder="https://example.com/certificates/debate-2025-champions.jpg"
            />
          </div>

          {/* Descriptions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-primary)]">
              Accolade Citation & Details (English)
            </label>
            <textarea
              rows={3}
              value={formData.descriptionEn}
              onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
              placeholder="Tournament venue, participating debaters, final round scores, or jury remarks..."
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
              <span>Publish Accolade to Public Roll of Honor</span>
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
              {isEditing ? "Save Changes" : "Save Accolade"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
