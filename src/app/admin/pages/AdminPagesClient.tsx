/**
 * @file src/app/admin/pages/AdminPagesClient.tsx
 * @description Interactive client console for Website Pages & Sections CMS (Feature 015).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages CMS editable pages (About, History, Policies, etc.) and their nested sections.
 * - Allows in-line editing of page metadata (title, SEO description, publication state).
 * - Coordinates PageSectionModal for granular section editing and AdminConfirmModal for deletions.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Edit, 
  Plus, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Save,
  Globe
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  Badge, 
  Button 
} from "@/components/ui";
import { 
  AdminDataTable, 
  AdminFilterBar, 
  AdminConfirmModal, 
  AdminEmptyState 
} from "@/components/admin";
import { PageSectionModal, PageSectionData } from "./PageSectionModal";
import { savePageMetadataAction, deletePageSectionAction } from "@/lib/actions/pages";

export interface PageRecord {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  metaDescriptionEn?: string | null;
  metaDescriptionAr?: string | null;
  isPublished: boolean;
  updatedAt: Date;
  sectionCount?: number;
  sections?: {
    id: string;
    pageId: string;
    sectionKey: string;
    contentEn?: string | null;
    contentAr?: string | null;
    sortOrder: number;
    updatedAt: Date;
  }[];
}

export interface AdminPagesClientProps {
  initialPages: PageRecord[];
}

export function AdminPagesClient({ initialPages }: AdminPagesClientProps) {
  const [pages, setPages] = useState<PageRecord[]>(initialPages);
  const [selectedPage, setSelectedPage] = useState<PageRecord>(initialPages[0] || null);
  const [search, setSearch] = useState("");

  // Modals state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<PageSectionData | null>(null);

  const [sectionToDelete, setSectionToDelete] = useState<{ id: string; key: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Page Metadata inline edit state
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editTitleEn, setEditTitleEn] = useState("");
  const [editTitleAr, setEditTitleAr] = useState("");
  const [editMetaDescEn, setEditMetaDescEn] = useState("");
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [isSavingMeta, setIsSavingMeta] = useState(false);
  const [metaMessage, setMetaMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const startEditMetadata = (page: PageRecord) => {
    setEditTitleEn(page.titleEn);
    setEditTitleAr(page.titleAr || "");
    setEditMetaDescEn(page.metaDescriptionEn || "");
    setEditIsPublished(page.isPublished);
    setIsEditingMetadata(true);
    setMetaMessage(null);
  };

  const handleSaveMetadata = async () => {
    if (!selectedPage) return;
    setIsSavingMeta(true);
    setMetaMessage(null);

    const res = await savePageMetadataAction({
      id: selectedPage.id,
      slug: selectedPage.slug,
      titleEn: editTitleEn.trim(),
      titleAr: editTitleAr.trim() || null,
      metaDescriptionEn: editMetaDescEn.trim() || null,
      isPublished: editIsPublished,
    });

    setIsSavingMeta(false);

    if (res.success) {
      setMetaMessage({ type: "success", text: "Page metadata updated successfully." });
      // Update local state
      const updated = {
        ...selectedPage,
        titleEn: editTitleEn.trim(),
        titleAr: editTitleAr.trim() || null,
        metaDescriptionEn: editMetaDescEn.trim() || null,
        isPublished: editIsPublished,
      };
      setSelectedPage(updated);
      setPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setIsEditingMetadata(false);
    } else {
      setMetaMessage({ type: "error", text: res.error || "Failed to update page." });
    }
  };

  const handleDeleteSectionConfirm = async () => {
    if (!sectionToDelete || !selectedPage) return;
    setIsDeleting(true);

    const res = await deletePageSectionAction(sectionToDelete.id, selectedPage.slug);
    setIsDeleting(false);

    if (res.success) {
      // Remove from selected page sections
      const updatedSections = (selectedPage.sections || []).filter((s) => s.id !== sectionToDelete.id);
      const updatedPage = {
        ...selectedPage,
        sections: updatedSections,
        sectionCount: updatedSections.length,
      };
      setSelectedPage(updatedPage);
      setPages((prev) => prev.map((p) => (p.id === updatedPage.id ? updatedPage : p)));
      setIsDeleteModalOpen(false);
      setSectionToDelete(null);
    }
  };

  const filteredPages = pages.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      p.titleEn.toLowerCase().includes(s) ||
      p.slug.toLowerCase().includes(s) ||
      (p.titleAr && p.titleAr.includes(s))
    );
  });

  return (
    <div className="space-y-6">
      {/* Search & Top Action Bar */}
      <AdminFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter editable pages by slug or title..."
        resultCount={filteredPages.length}
        totalCount={pages.length}
      />

      {/* Two-Column Layout: Page Selector & Section Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pages List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
            Institutional Pages ({filteredPages.length})
          </div>

          <div className="space-y-2">
            {filteredPages.map((page) => {
              const isSelected = selectedPage?.id === page.id;
              return (
                <div
                  key={page.id}
                  onClick={() => {
                    setSelectedPage(page);
                    setIsEditingMetadata(false);
                    setMetaMessage(null);
                  }}
                  className={`p-3.5 rounded-[8px] border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[var(--brand-primary)] bg-[var(--bg-surface-elevated)] shadow-xs"
                      : "border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[var(--brand-accent)]">
                      /{page.slug === "home" ? "" : page.slug}
                    </span>
                    <Badge variant={page.isPublished ? "accent" : "neutral"} size="sm" className="text-[10px] py-0 px-1.5">
                      {page.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>

                  <h4 className="text-xs font-bold text-[var(--text-primary)]">
                    {page.titleEn}
                  </h4>

                  {page.titleAr && (
                    <div className="font-arabic text-xs text-[var(--brand-accent)] mt-0.5 truncate" dir="rtl">
                      {page.titleAr}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1 font-medium">
                      <Layers className="w-3 h-3" /> {page.sectionCount ?? page.sections?.length ?? 0} sections
                    </span>
                    <span className="font-mono text-[10px]">
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Page Detail & Sections (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPage ? (
            <>
              {/* Page Metadata Header Card */}
              <Card className="border-[var(--border-color)] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] font-bold">
                        /{selectedPage.slug === "home" ? "" : selectedPage.slug}
                      </span>
                      <h2 className="text-base font-bold text-[var(--text-primary)]">
                        {selectedPage.titleEn}
                      </h2>
                    </div>
                    {selectedPage.titleAr && (
                      <p className="font-arabic text-xs text-[var(--brand-accent)] mt-0.5" dir="rtl">
                        {selectedPage.titleAr}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/${selectedPage.slug === "home" ? "" : selectedPage.slug}`}
                      target="_blank"
                    >
                      <Button variant="outline" size="sm" className="text-xs">
                        <Globe className="w-3.5 h-3.5 mr-1" />
                        Live View
                      </Button>
                    </Link>

                    <Button
                      variant={isEditingMetadata ? "ghost" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (isEditingMetadata) setIsEditingMetadata(false);
                        else startEditMetadata(selectedPage);
                      }}
                      className="text-xs"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      {isEditingMetadata ? "Cancel" : "Edit Metadata"}
                    </Button>
                  </div>
                </div>

                {/* Inline Metadata Edit Form */}
                {isEditingMetadata && (
                  <div className="p-4 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] space-y-3.5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-[var(--text-primary)] mb-1">
                          Page Title (English)
                        </label>
                        <input
                          type="text"
                          value={editTitleEn}
                          onChange={(e) => setEditTitleEn(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[var(--text-primary)] mb-1">
                          عنوان الصفحة (عربي)
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={editTitleAr}
                          onChange={(e) => setEditTitleAr(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-arabic text-xs focus:ring-1 focus:ring-[var(--brand-accent)]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-[var(--text-primary)] mb-1 text-xs">
                        SEO Meta Description
                      </label>
                      <textarea
                        rows={2}
                        value={editMetaDescEn}
                        onChange={(e) => setEditMetaDescEn(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-[5px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs focus:ring-1 focus:ring-[var(--brand-accent)]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                      <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editIsPublished}
                          onChange={(e) => setEditIsPublished(e.target.checked)}
                          className="rounded border-[var(--border-color)] text-[var(--brand-primary)] focus:ring-[var(--brand-accent)]"
                        />
                        <span>Published to public website</span>
                      </label>

                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleSaveMetadata}
                        isLoading={isSavingMeta}
                        className="text-xs"
                      >
                        <Save className="w-3.5 h-3.5 mr-1" />
                        Save Metadata
                      </Button>
                    </div>
                  </div>
                )}

                {metaMessage && (
                  <div
                    className={`p-2.5 rounded-[5px] text-xs flex items-center gap-2 ${
                      metaMessage.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200"
                        : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{metaMessage.text}</span>
                  </div>
                )}

                {selectedPage.metaDescriptionEn && !isEditingMetadata && (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                    "{selectedPage.metaDescriptionEn}"
                  </p>
                )}
              </Card>

              {/* Sections Table & Manager */}
              <Card className="border-[var(--border-color)] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                      Narrative Sections ({selectedPage.sections?.length || 0})
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Bilingual content blocks rendered in order on /{selectedPage.slug}.
                    </p>
                  </div>

                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => {
                      setActiveSection(null);
                      setIsSectionModalOpen(true);
                    }}
                    className="text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Section
                  </Button>
                </div>

                {selectedPage.sections && selectedPage.sections.length > 0 ? (
                  <AdminDataTable
                    columns={[
                      {
                        key: "sortOrder",
                        header: "#",
                        className: "w-10 text-center font-mono text-xs text-[var(--text-muted)]",
                      },
                      {
                        key: "sectionKey",
                        header: "Section Key",
                        render: (sec) => (
                          <div>
                            <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                              {sec.sectionKey}
                            </span>
                            <span className="block text-[10px] text-[var(--text-muted)] truncate max-w-xs">
                              {sec.contentEn ? sec.contentEn.substring(0, 60) + "..." : "No text"}
                            </span>
                          </div>
                        ),
                      },
                      {
                        key: "updatedAt",
                        header: "Last Modified",
                        render: (sec) => (
                          <span className="text-[11px] font-mono text-[var(--text-muted)]">
                            {new Date(sec.updatedAt).toLocaleDateString()}
                          </span>
                        ),
                      },
                      {
                        key: "actions",
                        header: "Actions",
                        align: "right",
                        render: (sec) => (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setActiveSection({
                                  id: sec.id,
                                  pageId: selectedPage.id,
                                  pageSlug: selectedPage.slug,
                                  sectionKey: sec.sectionKey,
                                  contentEn: sec.contentEn,
                                  contentAr: sec.contentAr,
                                  sortOrder: sec.sortOrder,
                                });
                                setIsSectionModalOpen(true);
                              }}
                              className="text-xs"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>

                            <button
                              type="button"
                              onClick={() => {
                                setSectionToDelete({ id: sec.id, key: sec.sectionKey });
                                setIsDeleteModalOpen(true);
                              }}
                              title="Delete section"
                              className="p-1.5 rounded-[4px] text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    data={selectedPage.sections}
                    keyExtractor={(sec) => sec.id}
                  />
                ) : (
                  <AdminEmptyState
                    icon={FileText}
                    title="No Sections Cataloged"
                    description={`Page /${selectedPage.slug} currently has no narrative sections. Click below to add the first section.`}
                    actionLabel="Add First Section"
                    onAction={() => {
                      setActiveSection(null);
                      setIsSectionModalOpen(true);
                    }}
                  />
                )}
              </Card>
            </>
          ) : (
            <AdminEmptyState
              icon={FileText}
              title="Select a Page"
              description="Choose an institutional page from the list to review and modify its sections."
            />
          )}
        </div>
      </div>

      {/* Section Create/Edit Modal */}
      {selectedPage && (
        <PageSectionModal
          isOpen={isSectionModalOpen}
          onClose={() => setIsSectionModalOpen(false)}
          onSuccess={() => {
            // Reload page or trigger revalidation
            window.location.reload();
          }}
          section={activeSection}
          pageId={selectedPage.id}
          pageSlug={selectedPage.slug}
        />
      )}

      {/* Section Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSectionToDelete(null);
        }}
        onConfirm={handleDeleteSectionConfirm}
        isLoading={isDeleting}
        isDestructive={true}
        title="Delete Page Section"
        message={`Are you sure you want to permanently delete the section "${sectionToDelete?.key}" from /${selectedPage?.slug}? This will immediately remove it from public rendering.`}
        confirmLabel="Delete Section"
      />
    </div>
  );
}
