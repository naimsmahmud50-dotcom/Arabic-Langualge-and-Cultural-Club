/**
 * @file src/app/admin/resources/AdminResourcesClient.tsx
 * @description Administrative Arabic Learning Resources Management Client (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Provides search, discipline filtering, proficiency tier selection, and download metrics.
 * - Integrates ResourceFormModal and AdminConfirmModal.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { AdminConfirmModal } from "@/components/admin";
import { ResourceFormModal } from "./ResourceFormModal";
import { deleteLearningResourceAction } from "@/lib/actions/content-cms";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Download, 
  FileText, 
  ExternalLink 
} from "lucide-react";

interface ResourceRecord {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  category: "grammar" | "morphology" | "rhetoric" | "vocabulary" | "literature" | "reading" | "general";
  skillLevel: "beginner" | "intermediate" | "advanced";
  fileUrl?: string | null;
  contentEn?: string | null;
  contentAr?: string | null;
  isPublished: boolean;
  downloadCount: number;
  createdAt: Date | string;
}

interface AdminResourcesClientProps {
  initialResources: ResourceRecord[];
}

export function AdminResourcesClient({ initialResources }: AdminResourcesClientProps) {
  const router = useRouter();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<ResourceRecord | null>(null);

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

  // Filter Logic
  const filteredItems = initialResources.filter((item) => {
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesSkill = skillFilter === "all" || item.skillLevel === skillFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && item.isPublished) ||
      (statusFilter === "draft" && !item.isPublished);

    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      item.titleEn.toLowerCase().includes(s) ||
      (item.titleAr && item.titleAr.includes(s)) ||
      item.slug.toLowerCase().includes(s);

    return matchesCategory && matchesSkill && matchesStatus && matchesSearch;
  });

  // Handlers
  const handleOpenCreate = () => {
    setResourceToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: ResourceRecord) => {
    setResourceToEdit(item);
    setIsFormModalOpen(true);
  };

  const handlePromptDelete = (item: ResourceRecord) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Learning Resource",
      message: `Are you sure you want to permanently delete "${item.titleEn}"? Students and members will no longer be able to access or download this study guide.`,
      isDestructive: true,
      confirmLabel: "Permanently Delete",
      onConfirm: async () => {
        await deleteLearningResourceAction(item.id);
        router.refresh();
      },
    });
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Arabic Learning Resources & Treatises
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Manage grammar guides, morphology charts, and vocabulary manuals ({initialResources.length} total treatises).
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Learning Resource
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[var(--bg-surface-elevated)]/60 p-3 rounded-[8px] border border-[var(--border-color)]">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search treatises..."
            className="pl-8 text-xs h-8"
          />
        </div>

        {/* Category */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
          >
            <option value="all">All Disciplines</option>
            <option value="grammar">Grammar (Nahw)</option>
            <option value="morphology">Morphology (Sarf)</option>
            <option value="rhetoric">Rhetoric (Balaghah)</option>
            <option value="vocabulary">Vocabulary (Mufradat)</option>
            <option value="literature">Literature (Adab)</option>
            <option value="reading">Reading (Qira'ah)</option>
          </select>
        </div>

        {/* Skill Level */}
        <div>
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
          >
            <option value="all">All Skill Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-[var(--border-color)] overflow-hidden">
        {filteredItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Treatise / Title</TableHead>
                <TableHead>Discipline</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-[var(--bg-surface-hover)]/40 transition-colors">
                  {/* Title & Slug */}
                  <TableCell>
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-[4px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
                          {item.titleEn}
                        </p>
                        {item.titleAr && (
                          <p className="text-2xs text-[var(--text-secondary)] font-arabic line-clamp-1" dir="rtl">
                            {item.titleAr}
                          </p>
                        )}
                        <span className="text-2xs text-[var(--text-muted)] font-mono">
                          /{item.slug}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge variant="neutral" size="sm" className="capitalize text-2xs">
                      {item.category}
                    </Badge>
                  </TableCell>

                  {/* Skill Level */}
                  <TableCell>
                    <Badge 
                      variant={item.skillLevel === "advanced" ? "accent" : item.skillLevel === "intermediate" ? "neutral" : "outline"} 
                      size="sm" 
                      className="capitalize text-2xs"
                    >
                      {item.skillLevel}
                    </Badge>
                  </TableCell>

                  {/* Download Counter */}
                  <TableCell className="text-xs font-mono text-[var(--text-secondary)]">
                    <span className="inline-flex items-center gap-1">
                      <Download className="w-3 h-3 text-[var(--text-muted)]" />
                      {item.downloadCount} downloads
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {item.isPublished ? (
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
                      {item.fileUrl && (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-7 w-7 inline-flex items-center justify-center rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                          title="Download document"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit resource"
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePromptDelete(item)}
                        title="Delete resource"
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
              title="No Learning Resources Found"
              description={
                searchTerm || categoryFilter !== "all" || skillFilter !== "all" || statusFilter !== "all"
                  ? "No educational materials match your criteria. Adjust filters or upload a new treatise."
                  : "The learning resource directory is currently empty. Click below to add the first study guide."
              }
              action={
                <Button variant="accent" size="sm" onClick={handleOpenCreate}>
                  Add First Study Guide
                </Button>
              }
            />
          </div>
        )}
      </Card>

      {/* MODALS */}
      <ResourceFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => router.refresh()}
        resourceToEdit={resourceToEdit}
      />

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
