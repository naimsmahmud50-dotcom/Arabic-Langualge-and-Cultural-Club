/**
 * DEVELOPER NOTE:
 * File: src/app/admin/pages/PageSectionModal.tsx
 * Module: Page Section CMS Modal Editor (Feature 015 & Phase 2 Enhancement)
 * Purpose: Provides structured form fields, live preview, and raw JSON editor
 *          for bilingual CMS sections (/about, /history, /policies, etc.).
 * Key Architectural Upgrades:
 * - Structured fields per section: Heading, Subtitle, Badge, Body, Quote, Items, Documents, Buttons.
 * - Bilingual tabs with full RTL support (dir="rtl", font-arabic) for Arabic content.
 * - Repeatable rows for cards, values, milestones, and pillars.
 * - Live Preview panel showing accurate institutional heritage rendering before save.
 * - Optional Advanced JSON mode with real-time JSON syntax validation.
 * - Strictly human vibe: zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  X, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Eye, 
  Code, 
  FileText, 
  Quote, 
  Layers, 
  CheckCircle2, 
  Download, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Compass,
  BookOpen,
  Target,
  HeartHandshake,
  ShieldCheck,
  Award,
  Scroll,
  Calendar,
  Sparkles
} from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";
import { savePageSectionAction } from "@/lib/actions/pages";
import { 
  safeParseSectionJson, 
  serializeSectionJson, 
  type SectionContentData, 
  type SectionContentItem,
  type SectionQuote 
} from "@/lib/schemas/sections";

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

const AVAILABLE_ICONS = [
  "BookOpen",
  "ShieldCheck",
  "HeartHandshake",
  "Compass",
  "Award",
  "Target",
  "Scroll",
  "Calendar",
  "CheckCircle2",
];

export function PageSectionModal({
  isOpen,
  onClose,
  onSuccess,
  section,
  pageId,
  pageSlug,
}: PageSectionModalProps) {
  const isEditing = Boolean(section?.id);

  // Metadata
  const [sectionKey, setSectionKey] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  // Active view: 'form' | 'preview' | 'json'
  const [activeView, setActiveView] = useState<"form" | "preview" | "json">("form");

  // Active language tab: 'en' | 'ar'
  const [langTab, setLangTab] = useState<"en" | "ar">("en");

  // Structured bilingual data
  const [enData, setEnData] = useState<SectionContentData>(() => safeParseSectionJson(null));
  const [arData, setArData] = useState<SectionContentData>(() => safeParseSectionJson(null));

  // Raw JSON state (for advanced mode)
  const [rawJsonEn, setRawJsonEn] = useState("");
  const [rawJsonAr, setRawJsonAr] = useState("");
  const [jsonErrorEn, setJsonErrorEn] = useState<string | null>(null);
  const [jsonErrorAr, setJsonErrorAr] = useState<string | null>(null);

  // Active collapsible sections within form view
  const [showQuoteSection, setShowQuoteSection] = useState(false);
  const [showItemsSection, setShowItemsSection] = useState(false);
  const [showDocSection, setShowDocSection] = useState(false);

  // Submission state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form state when opening modal
  useEffect(() => {
    if (section && isOpen) {
      setSectionKey(section.sectionKey || "");
      setSortOrder(section.sortOrder ?? 0);

      const parsedEn = safeParseSectionJson(section.contentEn);
      const parsedAr = safeParseSectionJson(section.contentAr);

      setEnData(parsedEn);
      setArData(parsedAr);

      setRawJsonEn(serializeSectionJson(parsedEn));
      setRawJsonAr(serializeSectionJson(parsedAr));

      setShowQuoteSection(Boolean(parsedEn.quote?.text || parsedAr.quote?.text));
      setShowItemsSection(Boolean((parsedEn.items && parsedEn.items.length > 0) || (parsedAr.items && parsedAr.items.length > 0)));
      setShowDocSection(Boolean(parsedEn.documentUrl || parsedAr.documentUrl || parsedEn.buttonText || parsedAr.buttonText));
    } else if (isOpen) {
      setSectionKey("");
      setSortOrder(0);
      const emptyEn = safeParseSectionJson(null);
      const emptyAr = safeParseSectionJson(null);
      setEnData(emptyEn);
      setArData(emptyAr);
      setRawJsonEn(serializeSectionJson(emptyEn));
      setRawJsonAr(serializeSectionJson(emptyAr));
      setShowQuoteSection(false);
      setShowItemsSection(false);
      setShowDocSection(false);
    }
    setActiveView("form");
    setLangTab("en");
    setError(null);
    setJsonErrorEn(null);
    setJsonErrorAr(null);
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

  // Synchronize when switching to raw JSON mode
  const handleViewChange = (newView: "form" | "preview" | "json") => {
    if (newView === "json") {
      setRawJsonEn(serializeSectionJson(enData));
      setRawJsonAr(serializeSectionJson(arData));
      setJsonErrorEn(null);
      setJsonErrorAr(null);
    } else if (activeView === "json") {
      // Validate and parse raw JSON before returning to form or preview
      try {
        const parsedEn = JSON.parse(rawJsonEn);
        setEnData(safeParseSectionJson(rawJsonEn));
        setJsonErrorEn(null);
      } catch (err: any) {
        setJsonErrorEn("Invalid English JSON: " + err.message);
        return;
      }

      try {
        const parsedAr = JSON.parse(rawJsonAr);
        setArData(safeParseSectionJson(rawJsonAr));
        setJsonErrorAr(null);
      } catch (err: any) {
        setJsonErrorAr("Invalid Arabic JSON: " + err.message);
        return;
      }
    }
    setActiveView(newView);
  };

  // Structured field update helpers
  const updateEnField = <K extends keyof SectionContentData>(key: K, value: SectionContentData[K]) => {
    setEnData((prev) => ({ ...prev, [key]: value }));
  };

  const updateArField = <K extends keyof SectionContentData>(key: K, value: SectionContentData[K]) => {
    setArData((prev) => ({ ...prev, [key]: value }));
  };

  // Items helpers
  const handleAddItem = () => {
    const newItem: SectionContentItem = {
      id: `item_${Date.now()}`,
      title: "",
      arabicTitle: "",
      description: "",
      arabicDescription: "",
      badge: "",
      year: "",
      iconName: "BookOpen",
      citation: "",
      isVerified: true,
    };
    setEnData((prev) => ({ ...prev, items: [...(prev.items || []), newItem] }));
    setArData((prev) => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const handleRemoveItem = (index: number) => {
    setEnData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, idx) => idx !== index),
    }));
    setArData((prev) => ({
      ...prev,
      items: (prev.items || []).filter((_, idx) => idx !== index),
    }));
  };

  const handleUpdateItem = (index: number, field: keyof SectionContentItem, value: any, targetLang: "en" | "ar") => {
    if (targetLang === "en") {
      setEnData((prev) => {
        const items = [...(prev.items || [])];
        if (items[index]) {
          items[index] = { ...items[index], [field]: value };
        }
        return { ...prev, items };
      });
    } else {
      setArData((prev) => {
        const items = [...(prev.items || [])];
        if (items[index]) {
          items[index] = { ...items[index], [field]: value };
        }
        return { ...prev, items };
      });
    }
  };

  if (!isOpen) return null;

  // Handle Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionKey.trim()) {
      setError("Section key is required (e.g. mission, values, milestones).");
      return;
    }

    let finalEnJson = "";
    let finalArJson = "";

    if (activeView === "json") {
      // Validate JSON
      try {
        JSON.parse(rawJsonEn);
        finalEnJson = rawJsonEn;
      } catch (err: any) {
        setError("Invalid English JSON: " + err.message);
        return;
      }
      try {
        JSON.parse(rawJsonAr);
        finalArJson = rawJsonAr;
      } catch (err: any) {
        setError("Invalid Arabic JSON: " + err.message);
        return;
      }
    } else {
      finalEnJson = serializeSectionJson(enData);
      finalArJson = serializeSectionJson(arData);
    }

    setIsLoading(true);
    setError(null);

    const res = await savePageSectionAction({
      id: section?.id,
      pageId,
      pageSlug,
      sectionKey: sectionKey.trim().toLowerCase(),
      contentEn: finalEnJson,
      contentAr: finalArJson,
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

  const currentData = langTab === "en" ? enData : arData;
  const isArabic = langTab === "ar";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="fixed inset-0" onClick={() => !isLoading && onClose()} />

      <div className="relative w-full max-w-4xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] shadow-2xl p-5 sm:p-6 z-10 space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 id="section-modal-title" className="text-base font-bold text-[var(--text-primary)]">
                {isEditing ? `Edit Section: ${section?.sectionKey}` : `Add Section to /${pageSlug}`}
              </h3>
              <Badge variant="accent" size="sm" className="font-mono text-[10px]">
                /{pageSlug}
              </Badge>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Structured bilingual CMS editor for institutional content. Changes appear on the public page immediately.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher: Form | Live Preview | Raw JSON */}
            <div className="flex items-center bg-[var(--bg-surface-elevated)] p-1 rounded-[6px] border border-[var(--border-color)] text-xs">
              <button
                type="button"
                onClick={() => handleViewChange("form")}
                className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors ${
                  activeView === "form"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                Form Editor
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("preview")}
                className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors flex items-center gap-1 ${
                  activeView === "preview"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("json")}
                className={`px-2.5 py-1 rounded-[4px] font-medium transition-colors flex items-center gap-1 ${
                  activeView === "json"
                    ? "bg-[var(--brand-primary)] text-white shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Raw JSON
              </button>
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
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3 rounded-[6px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Metadata Bar: Section Key & Sort Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3.5 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                Section Identifier (Key) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={sectionKey}
                onChange={(e) => setSectionKey(e.target.value)}
                placeholder="e.g. mission, vision, values, pillars, constitution, intro, milestones"
                disabled={isEditing || isLoading}
                className="w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono text-xs focus:ring-1 focus:ring-[var(--brand-accent)] disabled:opacity-60"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                Required unique key used by the public page template to target this content block.
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
                className="w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono text-xs focus:ring-1 focus:ring-[var(--brand-accent)]"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                Order relative to other sections (1, 2, 3...).
              </span>
            </div>
          </div>

          {/* VIEW 1: STRUCTURED FORM EDITOR */}
          {activeView === "form" && (
            <div className="space-y-4">
              {/* Language Selector Bar */}
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    Content Language:
                  </span>
                  <div className="inline-flex rounded-[6px] border border-[var(--border-color)] p-0.5 bg-[var(--bg-surface-elevated)]">
                    <button
                      type="button"
                      onClick={() => setLangTab("en")}
                      className={`px-3 py-1 rounded-[4px] text-xs font-semibold transition-colors ${
                        langTab === "en"
                          ? "bg-[var(--brand-accent)] text-white shadow-xs"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      English Content
                    </button>
                    <button
                      type="button"
                      onClick={() => setLangTab("ar")}
                      className={`px-3 py-1 rounded-[4px] text-xs font-semibold font-arabic transition-colors ${
                        langTab === "ar"
                          ? "bg-[var(--brand-accent)] text-white shadow-xs"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      }`}
                      dir="rtl"
                    >
                      المحتوى العربي
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-[var(--text-muted)]">
                  {langTab === "en" ? "Editing English fields" : "تحرير الحقول العربية (RTL)"}
                </div>
              </div>

              {/* Core Narrative Block */}
              <div className="p-4 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                    Narrative & Headings ({langTab.toUpperCase()})
                  </h4>
                  <Badge variant="accent" size="sm">Primary Content</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      {isArabic ? "عنوان القسم الرئيسي (Heading)" : "Section Heading"}
                    </label>
                    <input
                      type="text"
                      dir={isArabic ? "rtl" : "ltr"}
                      value={currentData.heading || ""}
                      onChange={(e) => isArabic ? updateArField("heading", e.target.value) : updateEnField("heading", e.target.value)}
                      placeholder={isArabic ? "مثال: رسالتنا المؤسسية" : "e.g. Institutional Mission"}
                      disabled={isLoading}
                      className={`w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)] ${isArabic ? "font-arabic" : ""}`}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--text-primary)] mb-1">
                      {isArabic ? "العنوان الفرعي (Subtitle / Subheading)" : "Subtitle / Subheading"}
                    </label>
                    <input
                      type="text"
                      dir={isArabic ? "rtl" : "ltr"}
                      value={currentData.subheading || currentData.subtitle || ""}
                      onChange={(e) => {
                        if (isArabic) {
                          updateArField("subheading", e.target.value);
                          updateArField("subtitle", e.target.value);
                        } else {
                          updateEnField("subheading", e.target.value);
                          updateEnField("subtitle", e.target.value);
                        }
                      }}
                      placeholder={isArabic ? "مثال: رعاية الفصاحة وبناء الملكة اللغوية" : "e.g. Cultivating linguistic rigor and classical fluency"}
                      disabled={isLoading}
                      className={`w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)] ${isArabic ? "font-arabic" : ""}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    {isArabic ? "شارة التصنيف أو الوسام (Badge / Tag)" : "Badge / Tag"}
                  </label>
                  <input
                    type="text"
                    dir={isArabic ? "rtl" : "ltr"}
                    value={currentData.badge || ""}
                    onChange={(e) => isArabic ? updateArField("badge", e.target.value) : updateEnField("badge", e.target.value)}
                    placeholder={isArabic ? "مثال: رسالتنا أو الميثاق الأساسي" : "e.g. Our Mission, Archival Policy, Guiding Philosophy"}
                    disabled={isLoading}
                    className={`w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)] ${isArabic ? "font-arabic" : ""}`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--text-primary)] mb-1">
                    {isArabic ? "النص التأسيسي والفقرات (Body Paragraphs)" : "Body Paragraphs / Main Narrative"}
                  </label>
                  <textarea
                    rows={4}
                    dir={isArabic ? "rtl" : "ltr"}
                    value={currentData.body || ""}
                    onChange={(e) => isArabic ? updateArField("body", e.target.value) : updateEnField("body", e.target.value)}
                    placeholder={isArabic ? "أدخل نص القسم بالتفصيل..." : "Enter comprehensive section narrative and paragraphs..."}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs leading-relaxed focus:ring-1 focus:ring-[var(--brand-accent)] ${isArabic ? "font-arabic text-sm" : ""}`}
                  />
                </div>
              </div>

              {/* Optional Components Toggle Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowQuoteSection(!showQuoteSection)}
                  className={`px-3 py-1.5 rounded-[5px] border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    showQuoteSection
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                      : "border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                  }`}
                >
                  <Quote className="w-3.5 h-3.5" />
                  {showQuoteSection ? "Hide Quotation Block" : "+ Add Quotation / Adab Block"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowItemsSection(!showItemsSection)}
                  className={`px-3 py-1.5 rounded-[5px] border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    showItemsSection
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                      : "border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  {showItemsSection ? "Hide Repeatable Cards / Milestones" : "+ Add Repeatable Cards / Milestones"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowDocSection(!showDocSection)}
                  className={`px-3 py-1.5 rounded-[5px] border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    showDocSection
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                      : "border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  {showDocSection ? "Hide Document / Action Block" : "+ Add Document / CTA Button"}
                </button>
              </div>

              {/* Quotation / Adab Block */}
              {showQuoteSection && (
                <div className="p-4 rounded-[6px] border border-[var(--brand-accent)]/30 bg-[var(--bg-surface-elevated)] space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[var(--brand-accent)] uppercase tracking-wider flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5" />
                      Classical Quotation / Institutional Adab ({langTab.toUpperCase()})
                    </h4>
                    <span className="text-[10px] text-[var(--text-muted)]">Rendered in prominent italic serif style</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        {isArabic ? "نص الاقتباس أو الحديث أو الحكمة" : "Quote Text"}
                      </label>
                      <textarea
                        rows={2}
                        dir={isArabic ? "rtl" : "ltr"}
                        value={currentData.quote?.text || ""}
                        onChange={(e) => {
                          const quote: SectionQuote = {
                            text: e.target.value,
                            attribution: currentData.quote?.attribution,
                            arabicText: currentData.quote?.arabicText,
                          };
                          if (isArabic) updateArField("quote", quote);
                          else updateEnField("quote", quote);
                        }}
                        placeholder={isArabic ? "«إِنَّ مِنَ البَيَانِ لَسِحْرًا»" : "e.g. Eloquence is the illumination of truth."}
                        className={`w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)] ${isArabic ? "font-arabic text-sm" : ""}`}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        {isArabic ? "نسبة القول / المصدر / الإسناد" : "Attribution / Scholar / Citation"}
                      </label>
                      <input
                        type="text"
                        dir={isArabic ? "rtl" : "ltr"}
                        value={currentData.quote?.attribution || ""}
                        onChange={(e) => {
                          const quote: SectionQuote = {
                            text: currentData.quote?.text || "",
                            attribution: e.target.value,
                            arabicText: currentData.quote?.arabicText,
                          };
                          if (isArabic) updateArField("quote", quote);
                          else updateEnField("quote", quote);
                        }}
                        placeholder={isArabic ? "الحديث النبوي الشريف في الفصاحة والبلاغة" : "e.g. Founding Assembly Charter, 2022"}
                        className={`w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)] ${isArabic ? "font-arabic" : ""}`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Repeatable Cards / Milestones / Pillars / Values */}
              {showItemsSection && (
                <div className="p-4 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        Repeatable Items & Cards ({(currentData.items || []).length} items)
                      </h4>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Used for Core Values cards, Academic Pillars, Milestones timeline nodes, and Key Metrics.
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="accent"
                      size="sm"
                      onClick={handleAddItem}
                      className="text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  {(!currentData.items || currentData.items.length === 0) ? (
                    <div className="p-6 text-center border border-dashed border-[var(--border-color)] rounded-[6px] text-xs text-[var(--text-muted)]">
                      No repeatable items cataloged. Click "Add Item" above to create value cards or milestones.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentData.items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="p-3.5 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                            <span className="font-mono text-xs font-bold text-[var(--brand-accent)]">
                              Item #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                                {isArabic ? "العنوان أو السنة أو الركيزة" : "Title / Year / Heading"}
                              </label>
                              <input
                                type="text"
                                dir={isArabic ? "rtl" : "ltr"}
                                value={item.title || ""}
                                onChange={(e) => handleUpdateItem(idx, "title", e.target.value, langTab)}
                                placeholder={isArabic ? "مثال: علوم اللغة العربية أو 2022" : "e.g. Classical Linguistics or 2022"}
                                className={`w-full px-2.5 py-1.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)] ${isArabic ? "font-arabic" : ""}`}
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                                Badge / Category
                              </label>
                              <input
                                type="text"
                                dir={isArabic ? "rtl" : "ltr"}
                                value={item.badge || ""}
                                onChange={(e) => handleUpdateItem(idx, "badge", e.target.value, langTab)}
                                placeholder="e.g. Inception, Pillar 01"
                                className="w-full px-2.5 py-1.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                                Year / Timeline Date
                              </label>
                              <input
                                type="text"
                                value={item.year || ""}
                                onChange={(e) => handleUpdateItem(idx, "year", e.target.value, langTab)}
                                placeholder="e.g. 2022"
                                className="w-full px-2.5 py-1.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono text-xs focus:ring-1 focus:ring-[var(--brand-accent)]"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                                Icon Style
                              </label>
                              <select
                                value={item.iconName || "BookOpen"}
                                onChange={(e) => handleUpdateItem(idx, "iconName", e.target.value, langTab)}
                                className="w-full px-2.5 py-1.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)]"
                              >
                                {AVAILABLE_ICONS.map((ic) => (
                                  <option key={ic} value={ic}>
                                    {ic}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block font-semibold text-[var(--text-primary)] mb-1">
                                Citation / Ref
                              </label>
                              <input
                                type="text"
                                value={item.citation || ""}
                                onChange={(e) => handleUpdateItem(idx, "citation", e.target.value, langTab)}
                                placeholder="e.g. Ref: FCA-2020-01"
                                className="w-full px-2.5 py-1.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono text-xs focus:ring-1 focus:ring-[var(--brand-accent)]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-semibold text-[var(--text-primary)] mb-1">
                              {isArabic ? "الوصف التفصيلي (Description)" : "Description / Narrative"}
                            </label>
                            <textarea
                              rows={2}
                              dir={isArabic ? "rtl" : "ltr"}
                              value={item.description || ""}
                              onChange={(e) => handleUpdateItem(idx, "description", e.target.value, langTab)}
                              placeholder={isArabic ? "وصف العنصر أو المحطة التاريخية..." : "Item description, curriculum details, or milestone narrative..."}
                              className={`w-full px-2.5 py-1.5 rounded-[4px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)] ${isArabic ? "font-arabic" : ""}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Document Download & CTA Action Block */}
              {showDocSection && (
                <div className="p-4 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-3.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)] flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      Document Download & Action Button ({langTab.toUpperCase()})
                    </h4>
                    <span className="text-[10px] text-[var(--text-muted)]">Used for Constitution, Policies & Guidelines</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        Document Display Title
                      </label>
                      <input
                        type="text"
                        dir={isArabic ? "rtl" : "ltr"}
                        value={currentData.documentTitle || ""}
                        onChange={(e) => isArabic ? updateArField("documentTitle", e.target.value) : updateEnField("documentTitle", e.target.value)}
                        placeholder="e.g. Official Club Constitution & Bylaws"
                        className={`w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)] ${isArabic ? "font-arabic" : ""}`}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        File Size Indicator
                      </label>
                      <input
                        type="text"
                        value={currentData.documentSize || ""}
                        onChange={(e) => isArabic ? updateArField("documentSize", e.target.value) : updateEnField("documentSize", e.target.value)}
                        placeholder="e.g. 2.4 MB (PDF)"
                        className="w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        Document URL / Download Path
                      </label>
                      <input
                        type="text"
                        value={currentData.documentUrl || ""}
                        onChange={(e) => isArabic ? updateArField("documentUrl", e.target.value) : updateEnField("documentUrl", e.target.value)}
                        placeholder="e.g. /assets/docs/club-constitution.pdf"
                        className="w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] font-mono text-xs focus:ring-1 focus:ring-[var(--brand-accent)]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1">
                        Button Label / Action Text
                      </label>
                      <input
                        type="text"
                        dir={isArabic ? "rtl" : "ltr"}
                        value={currentData.buttonText || ""}
                        onChange={(e) => isArabic ? updateArField("buttonText", e.target.value) : updateEnField("buttonText", e.target.value)}
                        placeholder={isArabic ? "تحميل الدستور الرسمي" : "Download Constitution"}
                        className={`w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)] ${isArabic ? "font-arabic" : ""}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: LIVE PREVIEW PANEL */}
          {activeView === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    Preview Language:
                  </span>
                  <div className="inline-flex rounded-[6px] border border-[var(--border-color)] p-0.5 bg-[var(--bg-surface-elevated)]">
                    <button
                      type="button"
                      onClick={() => setLangTab("en")}
                      className={`px-3 py-1 rounded-[4px] text-xs font-semibold ${
                        langTab === "en" ? "bg-[var(--brand-accent)] text-white" : "text-[var(--text-muted)]"
                      }`}
                    >
                      English Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => setLangTab("ar")}
                      className={`px-3 py-1 rounded-[4px] text-xs font-semibold font-arabic ${
                        langTab === "ar" ? "bg-[var(--brand-accent)] text-white" : "text-[var(--text-muted)]"
                      }`}
                      dir="rtl"
                    >
                      معاينة عربية
                    </button>
                  </div>
                </div>
                <Badge variant="accent" size="sm">Authentic Heritage Simulation</Badge>
              </div>

              {/* Simulated Public Card */}
              <div 
                className="p-6 sm:p-8 rounded-[8px] border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-6 shadow-sm"
                dir={isArabic ? "rtl" : "ltr"}
              >
                <div className="space-y-2">
                  {currentData.badge && (
                    <Badge variant="accent" size="sm">
                      {currentData.badge}
                    </Badge>
                  )}
                  <h2 className={`text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] ${isArabic ? "font-arabic" : ""}`}>
                    {currentData.heading || (isArabic ? "عنوان القسم التجريبي" : "Section Heading Demo")}
                  </h2>
                  {(currentData.subheading || currentData.subtitle) && (
                    <p className={`text-sm text-[var(--brand-accent)] font-medium ${isArabic ? "font-arabic" : "italic font-serif"}`}>
                      {currentData.subheading || currentData.subtitle}
                    </p>
                  )}
                  {currentData.body && (
                    <p className={`text-sm text-[var(--text-secondary)] leading-relaxed pt-2 ${isArabic ? "font-arabic text-sm" : ""}`}>
                      {currentData.body}
                    </p>
                  )}
                </div>

                {/* Quote in Preview */}
                {currentData.quote?.text && (
                  <div className="p-4 rounded-[6px] bg-[var(--bg-surface-elevated)] border-l-4 border-[var(--brand-accent)] space-y-1">
                    <blockquote className={`text-base font-serif italic text-[var(--brand-accent)] ${isArabic ? "font-arabic" : ""}`}>
                      «{currentData.quote.text}»
                    </blockquote>
                    {currentData.quote.attribution && (
                      <p className="text-xs text-[var(--text-muted)]">
                        — {currentData.quote.attribution}
                      </p>
                    )}
                  </div>
                )}

                {/* Items in Preview */}
                {currentData.items && currentData.items.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {currentData.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface-elevated)] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif font-bold text-xs text-[var(--brand-accent)]">
                            {item.year || `0${idx + 1}`}
                          </span>
                          {item.badge && (
                            <Badge variant="accent" size="sm">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <h4 className={`text-sm font-bold text-[var(--text-primary)] ${isArabic ? "font-arabic" : ""}`}>
                          {item.title}
                        </h4>
                        <p className={`text-xs text-[var(--text-secondary)] leading-relaxed ${isArabic ? "font-arabic" : ""}`}>
                          {item.description}
                        </p>
                        {item.citation && (
                          <span className="text-[10px] font-mono text-[var(--text-muted)] block pt-1 border-t border-[var(--border-subtle)]">
                            Citation: {item.citation}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Document Card in Preview */}
                {currentData.documentUrl && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">
                          {currentData.documentTitle || "Official Archival Document"}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {currentData.documentSize || "PDF Document"}
                        </p>
                      </div>
                    </div>

                    <Button variant="accent" size="sm" className="text-xs shrink-0">
                      <Download className="w-3.5 h-3.5 mr-1" />
                      {currentData.buttonText || "Download Document"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: RAW JSON ADVANCED EDITOR */}
          {activeView === "json" && (
            <div className="space-y-4">
              <div className="p-3 rounded-[6px] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold">Advanced Developer Mode:</span> Direct JSON manipulation. Any valid JSON keys (heading, subheading, badge, body, quote, items, stats, documentUrl) will be saved and parsed by public page renderers.
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[var(--text-primary)]">
                      English JSON (content_en)
                    </label>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">application/json</span>
                  </div>
                  <textarea
                    rows={14}
                    value={rawJsonEn}
                    onChange={(e) => {
                      setRawJsonEn(e.target.value);
                      try {
                        JSON.parse(e.target.value);
                        setJsonErrorEn(null);
                      } catch (err: any) {
                        setJsonErrorEn(err.message);
                      }
                    }}
                    className={`w-full p-3 rounded-[6px] border font-mono text-xs bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] ${
                      jsonErrorEn ? "border-red-500" : "border-[var(--border-color)]"
                    }`}
                  />
                  {jsonErrorEn && (
                    <p className="text-[11px] text-red-500 font-mono">
                      Syntax Error: {jsonErrorEn}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[var(--text-primary)]">
                      Arabic JSON (content_ar)
                    </label>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">application/json</span>
                  </div>
                  <textarea
                    rows={14}
                    value={rawJsonAr}
                    onChange={(e) => {
                      setRawJsonAr(e.target.value);
                      try {
                        JSON.parse(e.target.value);
                        setJsonErrorAr(null);
                      } catch (err: any) {
                        setJsonErrorAr(err.message);
                      }
                    }}
                    className={`w-full p-3 rounded-[6px] border font-mono text-xs bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] ${
                      jsonErrorAr ? "border-red-500" : "border-[var(--border-color)]"
                    }`}
                  />
                  {jsonErrorAr && (
                    <p className="text-[11px] text-red-500 font-mono">
                      Syntax Error: {jsonErrorAr}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
            <div className="text-[11px] text-[var(--text-muted)]">
              {isEditing ? `Modifying section ID: ${section?.id}` : `Creating new section on page ID: ${pageId}`}
            </div>

            <div className="flex items-center gap-2.5">
              <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                size="sm" 
                isLoading={isLoading}
                disabled={Boolean(jsonErrorEn || jsonErrorAr)}
              >
                {isEditing ? "Save & Revalidate Page" : "Create Section"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
