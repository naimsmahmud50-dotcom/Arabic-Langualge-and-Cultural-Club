/**
 * DEVELOPER NOTE:
 * @file src/app/admin/gallery/AdminGalleryClient.tsx
 * @description Administrative Photo Gallery & Media Archive Client Console (Phase 5).
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * CORE CAPABILITIES:
 * - Search, filter, and management of curated photo albums and contained media assets.
 * - Comprehensive status filtering: All, Published, Draft, and Archived.
 * - One-click album archive and unarchive lifecycle actions.
 * - Multi-attribute search (title, Arabic title, slug, location, date notes).
 * - Client-side pagination with clean controls.
 * - Integrates AlbumFormModal, MediaAssetModal, and AdminConfirmModal.
 * - Enforces Strix Security: Unpublished and archived albums are isolated from public views.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Badge, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { AdminConfirmModal } from "@/components/admin";
import { AlbumFormModal, AlbumRecord as ModalAlbumRecord } from "./AlbumFormModal";
import { MediaAssetModal } from "./MediaAssetModal";
import { deleteGalleryAlbumAction, toggleGalleryAlbumArchiveAction } from "@/lib/actions/content-cms";
import { 
  Images, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Camera, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Eye, 
  ExternalLink,
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export interface MediaItem {
  id: string;
  albumId: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  mediaType: "image" | "video";
  videoUrl?: string | null;
  captionEn?: string | null;
  captionAr?: string | null;
  altText?: string | null;
  credit?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface AlbumRecord {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  coverImageUrl?: string | null;
  eventDate?: string | null;
  dateNotes?: string | null;
  academicYear: string;
  category: string;
  relatedEventId?: string | null;
  relatedEventTitle?: string | null;
  photographerCredit?: string | null;
  location?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  isArchived: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  mediaCount: number;
  assets?: MediaItem[];
}

interface AdminGalleryClientProps {
  initialAlbums: AlbumRecord[];
  academicYears: string[];
  eventsList: Array<{ id: string; titleEn: string }>;
  albumAssetsMap: Record<string, MediaItem[]>;
}

const ITEMS_PER_PAGE = 15;

export function AdminGalleryClient({
  initialAlbums,
  academicYears,
  eventsList,
  albumAssetsMap,
}: AdminGalleryClientProps) {
  const router = useRouter();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [albumToEdit, setAlbumToEdit] = useState<ModalAlbumRecord | null>(null);

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedAlbumForMedia, setSelectedAlbumForMedia] = useState<AlbumRecord | null>(null);

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

  // Filtered Albums
  const filteredAlbums = initialAlbums.filter((alb) => {
    const matchesYear = yearFilter === "all" || alb.academicYear === yearFilter;
    const matchesCategory = categoryFilter === "all" || alb.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === "published") {
      matchesStatus = alb.isPublished && !alb.isArchived;
    } else if (statusFilter === "draft") {
      matchesStatus = !alb.isPublished && !alb.isArchived;
    } else if (statusFilter === "archived") {
      matchesStatus = alb.isArchived;
    }

    const s = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      alb.titleEn.toLowerCase().includes(s) ||
      (alb.titleAr && alb.titleAr.includes(s)) ||
      alb.slug.toLowerCase().includes(s) ||
      (alb.location && alb.location.toLowerCase().includes(s)) ||
      (alb.dateNotes && alb.dateNotes.toLowerCase().includes(s));

    return matchesYear && matchesCategory && matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAlbums.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);
  const paginatedAlbums = filteredAlbums.slice((validPage - 1) * ITEMS_PER_PAGE, validPage * ITEMS_PER_PAGE);

  // Handlers
  const handleOpenCreateAlbum = () => {
    setAlbumToEdit(null);
    setIsAlbumModalOpen(true);
  };

  const handleOpenEditAlbum = (alb: AlbumRecord) => {
    setAlbumToEdit(alb);
    setIsAlbumModalOpen(true);
  };

  const handleOpenMediaAssets = (alb: AlbumRecord) => {
    const assets = albumAssetsMap[alb.id] || [];
    setSelectedAlbumForMedia({
      ...alb,
      assets,
    });
    setIsMediaModalOpen(true);
  };

  const handleToggleArchive = async (alb: AlbumRecord) => {
    const targetStatus = !alb.isArchived;
    const actionLabel = targetStatus ? "archive" : "unarchive";
    
    setConfirmModal({
      isOpen: true,
      title: `${targetStatus ? "Archive" : "Unarchive"} Album`,
      message: `Are you sure you want to ${actionLabel} "${alb.titleEn}"? ${
        targetStatus 
          ? "Archived albums are removed from the public website but remain intact in the administrative records." 
          : "Unarchiving will restore this album according to its current publication setting."
      }`,
      isDestructive: false,
      confirmLabel: targetStatus ? "Archive Album" : "Restore Album",
      onConfirm: async () => {
        await toggleGalleryAlbumArchiveAction(alb.id, targetStatus);
        router.refresh();
      },
    });
  };

  const handlePromptDeleteAlbum = (alb: AlbumRecord) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Photo Album",
      message: `Are you sure you want to permanently delete the album "${alb.titleEn}"? This action will cascade to all contained media assets and cannot be undone.`,
      isDestructive: true,
      confirmLabel: "Permanently Delete",
      onConfirm: async () => {
        await deleteGalleryAlbumAction(alb.id);
        router.refresh();
      },
    });
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Photo Albums & Media Collections
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Curate visual albums, manage event photography, and upload video assets ({initialAlbums.length} total collections).
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={handleOpenCreateAlbum}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Create New Album
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[var(--bg-surface-elevated)]/60 p-3 rounded-[8px] border border-[var(--border-color)]">
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search albums by title or location..."
            className="pl-8 text-xs h-8"
          />
        </div>

        {/* Academic Year */}
        <div>
          <select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
          >
            <option value="all">All Academic Years</option>
            {academicYears.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
          >
            <option value="all">All Categories</option>
            <option value="cultural">Cultural Festivities</option>
            <option value="debates">Debates</option>
            <option value="symposia">Academic Symposia</option>
            <option value="calligraphy">Calligraphy Arts</option>
            <option value="workshops">Workshops</option>
            <option value="ceremonies">Ceremonies</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-8 px-2.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>
      </div>

      {/* Albums Table Card */}
      <Card className="border-[var(--border-color)] overflow-hidden">
        {paginatedAlbums.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collection / Title</TableHead>
                  <TableHead>Academic Term</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Event Link</TableHead>
                  <TableHead>Assets</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAlbums.map((alb) => (
                  <TableRow key={alb.id} className="hover:bg-[var(--bg-surface-hover)]/40 transition-colors">
                    {/* Cover & Title */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-[4px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] overflow-hidden shrink-0 flex items-center justify-center">
                          {alb.coverImageUrl ? (
                            <img
                              src={alb.coverImageUrl}
                              alt={alb.titleEn}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Images className="w-4 h-4 text-[var(--text-muted)]" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
                            {alb.titleEn}
                          </p>
                          {alb.titleAr && (
                            <p className="text-2xs text-[var(--text-secondary)] font-arabic line-clamp-1" dir="rtl">
                              {alb.titleAr}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-2xs text-[var(--text-muted)] font-mono">
                              /{alb.slug}
                            </span>
                            {alb.dateNotes && (
                              <span className="text-2xs text-[var(--text-muted)] italic line-clamp-1">
                                ({alb.dateNotes})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Academic Year */}
                    <TableCell className="text-xs font-medium text-[var(--text-secondary)]">
                      {alb.academicYear}
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      <Badge variant="neutral" size="sm" className="capitalize text-2xs">
                        {alb.category}
                      </Badge>
                    </TableCell>

                    {/* Related Event */}
                    <TableCell className="text-xs text-[var(--text-secondary)]">
                      {alb.relatedEventTitle ? (
                        <span className="text-2xs font-medium text-[var(--brand-accent)] line-clamp-1">
                          {alb.relatedEventTitle}
                        </span>
                      ) : (
                        <span className="text-2xs text-[var(--text-muted)]">Independent</span>
                      )}
                    </TableCell>

                    {/* Media Assets Count */}
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleOpenMediaAssets(alb)}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-2xs font-semibold text-[var(--text-primary)] transition-colors"
                      >
                        <Camera className="w-3 h-3 text-[var(--brand-accent)]" />
                        <span>{alb.mediaCount} assets</span>
                      </button>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {alb.isArchived ? (
                        <Badge variant="neutral" size="sm" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-2xs">
                          Archived
                        </Badge>
                      ) : alb.isPublished ? (
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
                          onClick={() => handleOpenMediaAssets(alb)}
                          title="Manage media assets"
                          className="h-7 w-7 p-0"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditAlbum(alb)}
                          title="Edit album metadata"
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleArchive(alb)}
                          title={alb.isArchived ? "Restore / unarchive album" : "Archive album"}
                          className={`h-7 w-7 p-0 ${alb.isArchived ? "text-amber-600" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                        >
                          {alb.isArchived ? (
                            <ArchiveRestore className="w-3.5 h-3.5" />
                          ) : (
                            <Archive className="w-3.5 h-3.5" />
                          )}
                        </Button>

                        {!alb.isArchived && alb.isPublished && (
                          <Link
                            href={`/gallery/${alb.slug}`}
                            target="_blank"
                            className="h-7 w-7 inline-flex items-center justify-center rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                            title="View public gallery page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePromptDeleteAlbum(alb)}
                          title="Delete album record"
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] text-xs text-[var(--text-secondary)]">
                <div>
                  Showing {((validPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(validPage * ITEMS_PER_PAGE, filteredAlbums.length)} of {filteredAlbums.length} collections
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={validPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Previous
                  </Button>
                  <span className="font-medium text-[var(--text-primary)]">
                    Page {validPage} of {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={validPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 p-6">
            <EmptyState
              title="No Photo Albums Found"
              description={
                searchTerm || yearFilter !== "all" || categoryFilter !== "all" || statusFilter !== "all"
                  ? "No albums match your search or filter criteria. Clear filters or create a new collection."
                  : "The media archive is currently empty. Start curating visual collections for the club."
              }
              action={
                <Button variant="accent" size="sm" onClick={handleOpenCreateAlbum}>
                  Create Inaugural Album
                </Button>
              }
            />
          </div>
        )}
      </Card>

      {/* MODALS */}
      {/* 1. Album Form Modal */}
      <AlbumFormModal
        isOpen={isAlbumModalOpen}
        onClose={() => setIsAlbumModalOpen(false)}
        onSuccess={() => router.refresh()}
        albumToEdit={albumToEdit}
        academicYears={academicYears}
        eventsList={eventsList}
      />

      {/* 2. Media Asset Modal */}
      <MediaAssetModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
        album={selectedAlbumForMedia}
      />

      {/* 3. Confirm Delete / Lifecycle Modal */}
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
