/**
 * @file src/app/admin/news/AdminNewsClient.tsx
 * @description Administrative News, Bulletins & Announcements Management Client (Feature 017).
 * 
 * DEVELOPER USAGE NOTE:
 * - Provides search, category filter, draft/published status toggling, and priority pinning.
 * - Integrates AnnouncementFormModal and AdminConfirmModal.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { AdminConfirmModal } from "@/components/admin";
import { AnnouncementFormModal } from "./AnnouncementFormModal";
import { 
  deleteAnnouncementAction, 
  toggleAnnouncementPinAction 
} from "@/lib/actions/content-cms";
import { 
  Newspaper, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Pin, 
  ExternalLink, 
  User, 
  Calendar 
} from "lucide-react";
import Link from "next/link";

interface AnnouncementRecord {
  id: string;
  slug: string;
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
  publishedAt: Date | string;
  createdAt: Date | string;
}

interface AdminNewsClientProps {
  initialAnnouncements: AnnouncementRecord[];
}

export function AdminNewsClient({ initialAnnouncements }: AdminNewsClientProps) {
  const router = useRouter();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [announcementToEdit, setAnnouncementToEdit] = useState<AnnouncementRecord | null>(null);

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

  // Filter logic
  const filteredItems = initialAnnouncements.filter((item) => {
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      item.titleEn.toLowerCase().includes(s) ||
      (item.titleAr && item.titleAr.includes(s)) ||
      item.slug.toLowerCase().includes(s) ||
      (item.authorName && item.authorName.toLowerCase().includes(s));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Handlers
  const handleOpenCreate = () => {
    setAnnouncementToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: AnnouncementRecord) => {
    setAnnouncementToEdit(item);
    setIsFormModalOpen(true);
  };

  const handleTogglePin = async (item: AnnouncementRecord) => {
    await toggleAnnouncementPinAction(item.id, !item.isPinned);
    router.refresh();
  };

  const handlePromptDelete = (item: AnnouncementRecord) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Announcement",
      message: `Are you sure you want to permanently delete "${item.titleEn}"? This bulletin will be removed from public listings and archives immediately.`,
      isDestructive: true,
      confirmLabel: "Permanently Delete",
      onConfirm: async () => {
        await deleteAnnouncementAction(item.id);
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
            News & Editorial Bulletins
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Manage institutional notices, academic press releases, and priority announcements ({initialAnnouncements.length} total records).
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={handleOpenCreate}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Author Announcement
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[var(--bg-surface-elevated)]/60 p-3 rounded-[8px] border border-[var(--border-color)]">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search headline or author..."
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
            <option value="all">All Categories</option>
            <option value="notice">Official Notice</option>
            <option value="news">Club News</option>
            <option value="press">Press Release</option>
            <option value="academic">Academic Advisory</option>
            <option value="achievement">Accolades & Distinctions</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
          >
            <option value="all">All Publication Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-[var(--border-color)] overflow-hidden">
        {filteredItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Headline / Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date Published</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-[var(--bg-surface-hover)]/40 transition-colors">
                  {/* Title & Pin Indicator */}
                  <TableCell>
                    <div className="flex items-start gap-2.5">
                      {item.isPinned && (
                        <div title="Pinned to top of announcements" className="shrink-0 mt-0.5">
                          <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        </div>
                      )}
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

                  {/* Author */}
                  <TableCell className="text-xs text-[var(--text-secondary)]">
                    {item.authorName || "Secretariat"}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-xs font-mono text-[var(--text-muted)]">
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {item.status === "published" ? (
                      <Badge variant="accent" size="sm" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-2xs">
                        Published
                      </Badge>
                    ) : item.status === "draft" ? (
                      <Badge variant="neutral" size="sm" className="text-2xs">
                        Draft
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm" className="text-2xs text-[var(--text-muted)]">
                        Archived
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePin(item)}
                        title={item.isPinned ? "Unpin from top" : "Pin to top"}
                        className={`h-7 w-7 p-0 ${item.isPinned ? "text-amber-500" : "text-[var(--text-muted)]"}`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit bulletin"
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>

                      <Link
                        href={`/news/${item.slug}`}
                        target="_blank"
                        className="h-7 w-7 inline-flex items-center justify-center rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                        title="View public article"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePromptDelete(item)}
                        title="Delete announcement"
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
              title="No Announcements Found"
              description={
                searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                  ? "No bulletins match your filter criteria. Adjust filters or author a new announcement."
                  : "The official news bulletin is currently empty. Click below to publish the first notice."
              }
              action={
                <Button variant="accent" size="sm" onClick={handleOpenCreate}>
                  Author First Bulletin
                </Button>
              }
            />
          </div>
        )}
      </Card>

      {/* MODALS */}
      <AnnouncementFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={() => router.refresh()}
        announcementToEdit={announcementToEdit}
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
