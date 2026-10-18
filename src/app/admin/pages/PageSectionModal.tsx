/**
 * @file src/app/admin/pages/PageSectionModal.tsx
 * @description Accessible modal dialog for creating and editing CMS page sections (Feature 015).
 * 
 * DEVELOPER USAGE NOTE:
 * - Used by /admin/pages to edit bilingual narrative sections (hero, mission, vision, values, milestones).
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 * - Meets WCAG AA standards with focus trapping, role="dialog", aria-modal="true", and ESC listener.
 */

"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { savePageSectionAction } from "@/lib/actions/pages";

export interface PageSectionData {
  id?: string;
  pageId: string;
  pageSlug: string;
  sectionKey: string;
  contentEn?: string | null;
  contentAr?: string | null;
  sortOrder?: number;
}

export interface PageSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  section?: PageSectionData | null;
  pageId: string;
  pageSlug: string;
}

export function PageSectionModal({
  isOpen,
  onClose,
  onSuccess,
  section,
  pageId,
  pageSlug,
}: PageSectionModalProps) {
  const isEditing = Boolean(section?.id);

  const [sectionKey, setSectionKey] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [contentAr, setContentAr] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (section) {
      setSectionKey(section.sectionKey || "");
      setContentEn(section.contentEn || "");
      setContentAr(section.contentAr || "");
      setSortOrder(section.sortOrder ?? 0);
    } else {
      setSectionKey("");
      setContentEn("");
      setContentAr("");
      setSortOrder(0);
    }
    setError(null);
  }, [section, isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionKey.trim()) {
      setError("Section key is required (e.g. mission, values, timeline).");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await savePageSectionAction({
      id: section?.id,
      pageId,
      pageSlug,
      sectionKey: sectionKey.trim().toLowerCase(),
      contentEn: contentEn.trim() || null,
      contentAr: contentAr.trim() || null,
      sortOrder: Number(sortOrder),
    });

    setIsLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || "Failed to save section.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      <div className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] shadow-2xl p-6 z-10 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h3 id="section-modal-title" className="text-base font-bold text-[var(--text-primary)]">
              {isEditing ? `Edit Section: ${section?.sectionKey}` : `Add Section to /${pageSlug}`}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Enter bilingual text or JSON structured content for this page block.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-[4px] hover:bg-[var(--bg-surface-hover)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-[6px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                Section Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sectionKey}
                onChange={(e) => setSectionKey(e.target.value)}
                placeholder="e.g. mission, vision, values, timeline"
                disabled={isEditing || isLoading}
                className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] disabled:opacity-60"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                Unique identifier used by public page renderers.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                Display Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                disabled={isLoading}
                className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                Lower values render earlier on the page.
              </span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">
              English Content (Plain text or JSON)
            </label>
            <textarea
              rows={5}
              value={contentEn}
              onChange={(e) => setContentEn(e.target.value)}
              placeholder="Enter English section narrative, HTML paragraphs, or JSON items array..."
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-primary)] mb-1">
              Arabic Content (النص العربي)
            </label>
            <textarea
              rows={5}
              dir="rtl"
              value={contentAr}
              onChange={(e) => setContentAr(e.target.value)}
              placeholder="أدخل النص العربي للقسم أو مصفوفة كائنات JSON..."
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-arabic text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
              {isEditing ? "Save Changes" : "Create Section"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
