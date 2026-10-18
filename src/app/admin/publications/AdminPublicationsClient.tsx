/**
 * @file src/app/admin/publications/AdminPublicationsClient.tsx
 * @description Administrative Publications & Roll of Honor Dual-Domain Console (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Dual-tab architecture:
 *   1. Official Publications (Magazines, Research Journals, Annual Reports)
 *   2. Institutional Roll of Honor (Tournament Championships & Academic Accolades)
 * - Integrates PublicationFormModal, AchievementFormModal, and AdminConfirmModal.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { AdminConfirmModal } from "@/components/admin";
import { PublicationFormModal } from "./PublicationFormModal";
import { AchievementFormModal } from "./AchievementFormModal";
import { 
  deletePublicationAction, 
  deleteAchievementAction 
} from "@/lib/actions/content-cms";
import { 
  Book, 
  Trophy, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  FileText, 
  Calendar, 
  ExternalLink 
} from "lucide-react";

interface PublicationRecord {
  id: string;
  slug: string;
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
  createdAt: Date | string;
}

interface AchievementRecord {
  id: string;
  titleEn: string;
  titleAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  category: string;
  dateAchieved?: string | null;
  certificateUrl?: string | null;
  isPublished: boolean;
  createdAt: Date | string;
}

interface AdminPublicationsClientProps {
  initialPublications: PublicationRecord[];
  initialAchievements: AchievementRecord[];
}

export function AdminPublicationsClient({
  initialPublications,
  initialAchievements,
}: AdminPublicationsClientProps) {
  const router = useRouter();

  // Active Tab: "publications" | "achievements"
  const [activeTab, setActiveTab] = useState<"publications" | "achievements">("publications");

  // Tab 1 (Publications) Filters
  const [pubSearch, setPubSearch] = useState("");
  const [pubTypeFilter, setPubTypeFilter] = useState("all");
  const [pubStatusFilter, setPubStatusFilter] = useState("all");

  // Tab 2 (Achievements) Filters
  const [achSearch, setAchSearch] = useState("");
  const [achCategoryFilter, setAchCategoryFilter] = useState("all");
  const [achStatusFilter, setAchStatusFilter] = useState("all");

  // Modals state
  const [isPubModalOpen, setIsPubModalOpen] = useState(false);
  const [pubToEdit, setPubToEdit] = useState<PublicationRecord | null>(null);

  const [isAchModalOpen, setIsAchModalOpen] = useState(false);
  const [achToEdit, setAchToEdit] = useState<AchievementRecord | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    confirmLabel?: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  // Filtered Publications
  const filteredPublications = initialPublications.filter((pub) => {
    const matchesType = pubTypeFilter === "all" || pub.publicationType === pubTypeFilter;
    const matchesStatus =
      pubStatusFilter === "all" ||
      (pubStatusFilter === "published" && pub.isPublished) ||
      (pubStatusFilter === "draft" && !pub.isPublished);

    const s = pubSearch.toLowerCase();
    const matchesSearch =
      !pubSearch.trim() ||
      pub.titleEn.toLowerCase().includes(s) ||
      (pub.titleAr && pub.titleAr.includes(s)) ||
      pub.slug.toLowerCase().includes(s) ||
      (pub.issueNo && pub.issueNo.toLowerCase().includes(s));

    return matchesType && matchesStatus && matchesSearch;
  });

  // Filtered Achievements
  const filteredAchievements = initialAchievements.filter((ach) => {
    const matchesCat = achCategoryFilter === "all" || ach.category === achCategoryFilter;
    const matchesStatus =
      achStatusFilter === "all" ||
      (achStatusFilter === "published" && ach.isPublished) ||
      (achStatusFilter === "draft" && !ach.isPublished);

    const s = achSearch.toLowerCase();
    const matchesSearch =
      !achSearch.trim() ||
      ach.titleEn.toLowerCase().includes(s) ||
      (ach.titleAr && ach.titleAr.includes(s)) ||
      (ach.descriptionEn && ach.descriptionEn.toLowerCase().includes(s));

    return matchesCat && matchesStatus && matchesSearch;
  });

  // Publication Handlers
  const handleOpenCreatePub = () => {
    setPubToEdit(null);
    setIsPubModalOpen(true);
  };

  const handleOpenEditPub = (pub: PublicationRecord) => {
    setPubToEdit(pub);
    setIsPubModalOpen(true);
  };

  const handlePromptDeletePub = (pub: PublicationRecord) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Publication Issue",
      message: `Are you sure you want to permanently delete "${pub.titleEn}"? Readers will no longer be able to download this document from public publications.`,
      isDestructive: true,
      confirmLabel: "Permanently Delete",
      onConfirm: async () => {
        await deletePublicationAction(pub.id);
        router.refresh();
      },
    });
  };

  // Achievement Handlers
  const handleOpenCreateAch = () => {
    setAchToEdit(null);
    setIsAchModalOpen(true);
  };

  const handleOpenEditAch = (ach: AchievementRecord) => {
    setAchToEdit(ach);
    setIsAchModalOpen(true);
  };

  const handlePromptDeleteAch = (ach: AchievementRecord) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Accolade Record",
      message: `Are you sure you want to permanently remove "${ach.titleEn}" from the verified Roll of Honor?`,
      isDestructive: true,
      confirmLabel: "Permanently Delete",
      onConfirm: async () => {
        await deleteAchievementAction(ach.id);
        router.refresh();
      },
    });
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Publications & Institutional Honors
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Curate official periodicals, research journals, and competitive championship records.
          </p>
        </div>

        {/* Tab Toggle Switch */}
        <div className="flex items-center gap-2 bg-[var(--bg-surface-elevated)] p-1 rounded-[6px] border border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => setActiveTab("publications")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 ${
              activeTab === "publications"
                ? "bg-[var(--brand-primary)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Book className="w-3.5 h-3.5" />
            <span>Publications ({initialPublications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("achievements")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-[4px] transition-colors flex items-center gap-1.5 ${
              activeTab === "achievements"
                ? "bg-[var(--brand-primary)] text-white shadow-xs"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Roll of Honor ({initialAchievements.length})</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: OFFICIAL PUBLICATIONS                                         */}
      {/* ==================================================================== */}
      {activeTab === "publications" && (
        <div className="space-y-4">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-2xl">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={pubSearch}
                  onChange={(e) => setPubSearch(e.target.value)}
                  placeholder="Search publications..."
                  className="pl-8 text-xs h-8"
                />
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={pubTypeFilter}
                  onChange={(e) => setPubTypeFilter(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                >
                  <option value="all">All Types</option>
                  <option value="magazine">Magazine (Majallah)</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="journal">Research Journal</option>
                  <option value="report">Annual Report</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={pubStatusFilter}
                  onChange={(e) => setPubStatusFilter(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts Only</option>
                </select>
              </div>
            </div>

            <Button
              variant="accent"
              size="sm"
              onClick={handleOpenCreatePub}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Publication
            </Button>
          </div>

          {/* Publications Table */}
          <Card className="border-[var(--border-color)] overflow-hidden">
            {filteredPublications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Publication / Issue</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Edition</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPublications.map((pub) => (
                    <TableRow key={pub.id} className="hover:bg-[var(--bg-surface-hover)]/40 transition-colors">
                      {/* Cover & Title */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded-[4px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] overflow-hidden shrink-0 flex items-center justify-center">
                            {pub.coverImageUrl ? (
                              <img
                                src={pub.coverImageUrl}
                                alt={pub.titleEn}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Book className="w-4 h-4 text-[var(--text-muted)]" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
                              {pub.titleEn}
                            </p>
                            {pub.titleAr && (
                              <p className="text-2xs text-[var(--text-secondary)] font-arabic line-clamp-1" dir="rtl">
                                {pub.titleAr}
                              </p>
                            )}
                            <span className="text-2xs text-[var(--text-muted)] font-mono">
                              /{pub.slug}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Publication Type */}
                      <TableCell>
                        <Badge variant="neutral" size="sm" className="capitalize text-2xs">
                          {pub.publicationType}
                        </Badge>
                      </TableCell>

                      {/* Issue No */}
                      <TableCell className="text-xs text-[var(--text-secondary)]">
                        {pub.issueNo || "—"}
                      </TableCell>

                      {/* Release Date */}
                      <TableCell className="text-xs font-mono text-[var(--text-muted)]">
                        {pub.publicationDate || "—"}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {pub.isPublished ? (
                          <Badge variant="accent" size="sm" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-2xs">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm" className="text-2xs">
                            Draft
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {pub.fileUrl && (
                            <a
                              href={pub.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="h-7 w-7 inline-flex items-center justify-center rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditPub(pub)}
                            title="Edit publication"
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePromptDeletePub(pub)}
                            title="Delete publication"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 p-6">
                <EmptyState
                  title="No Publications Found"
                  description={
                    pubSearch || pubTypeFilter !== "all" || pubStatusFilter !== "all"
                      ? "No publications match your filter criteria. Clear filters or add a new issue."
                      : "The official publications catalog is currently empty. Click below to add the first periodical."
                  }
                  action={
                    <Button variant="accent" size="sm" onClick={handleOpenCreatePub}>
                      Add First Periodical
                    </Button>
                  }
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: ROLL OF HONOR & ACCOLADES                                     */}
      {/* ==================================================================== */}
      {activeTab === "achievements" && (
        <div className="space-y-4">
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-2xl">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={achSearch}
                  onChange={(e) => setAchSearch(e.target.value)}
                  placeholder="Search accolades..."
                  className="pl-8 text-xs h-8"
                />
              </div>

              {/* Category */}
              <div>
                <select
                  value={achCategoryFilter}
                  onChange={(e) => setAchCategoryFilter(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                >
                  <option value="all">All Categories</option>
                  <option value="competition">Debates & Competitions</option>
                  <option value="academic">Academic Research</option>
                  <option value="calligraphy">Calligraphy Arts</option>
                  <option value="institutional">Institutional Honors</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <select
                  value={achStatusFilter}
                  onChange={(e) => setAchStatusFilter(e.target.value)}
                  className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Drafts Only</option>
                </select>
              </div>
            </div>

            <Button
              variant="accent"
              size="sm"
              onClick={handleOpenCreateAch}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Register Accolade
            </Button>
          </div>

          {/* Achievements Table */}
          <Card className="border-[var(--border-color)] overflow-hidden">
            {filteredAchievements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Accolade / Honor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date Conferred</TableHead>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAchievements.map((ach) => (
                    <TableRow key={ach.id} className="hover:bg-[var(--bg-surface-hover)]/40 transition-colors">
                      {/* Title & Description */}
                      <TableCell>
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-[4px] bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
                              {ach.titleEn}
                            </p>
                            {ach.titleAr && (
                              <p className="text-2xs text-[var(--text-secondary)] font-arabic line-clamp-1" dir="rtl">
                                {ach.titleAr}
                              </p>
                            )}
                            {ach.descriptionEn && (
                              <p className="text-2xs text-[var(--text-muted)] line-clamp-1">
                                {ach.descriptionEn}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Badge variant="neutral" size="sm" className="capitalize text-2xs">
                          {ach.category}
                        </Badge>
                      </TableCell>

                      {/* Date Achieved */}
                      <TableCell className="text-xs font-mono text-[var(--text-muted)]">
                        {ach.dateAchieved || "—"}
                      </TableCell>

                      {/* Certificate Link */}
                      <TableCell>
                        {ach.certificateUrl ? (
                          <a
                            href={ach.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-2xs font-semibold text-[var(--brand-accent)] hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> View Proof
                          </a>
                        ) : (
                          <span className="text-2xs text-[var(--text-muted)]">No File</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {ach.isPublished ? (
                          <Badge variant="accent" size="sm" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-2xs">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm" className="text-2xs">
                            Draft
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditAch(ach)}
                            title="Edit accolade"
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePromptDeleteAch(ach)}
                            title="Delete accolade"
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 p-6">
                <EmptyState
                  title="No Accolades Found"
                  description={
                    achSearch || achCategoryFilter !== "all" || achStatusFilter !== "all"
                      ? "No achievements match your filter criteria. Adjust filters or register a new distinction."
                      : "The verified Roll of Honor is currently empty. Click below to register the club's tournament championships."
                  }
                  action={
                    <Button variant="accent" size="sm" onClick={handleOpenCreateAch}>
                      Register First Accolade
                    </Button>
                  }
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Publication Form Modal */}
      <PublicationFormModal
        isOpen={isPubModalOpen}
        onClose={() => setIsPubModalOpen(false)}
        onSuccess={() => router.refresh()}
        publicationToEdit={pubToEdit}
      />

      {/* 2. Achievement Form Modal */}
      <AchievementFormModal
        isOpen={isAchModalOpen}
        onClose={() => setIsAchModalOpen(false)}
        onSuccess={() => router.refresh()}
        achievementToEdit={achToEdit}
      />

      {/* 3. Confirm Delete Modal */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
      />
    </div>
  );
}
