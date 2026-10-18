/**
 * @file src/app/admin/founders/AdminFoundersClient.tsx
 * @description Interactive client console for Founders & Originators CMS (Feature 015).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages verified founding committee profiles and patron scholars.
 * - Allows searching, filtering by publication state, creating new profiles, and editing.
 * - Coordinates FounderFormModal for creation/updates and AdminConfirmModal for deletions.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight,
  ExternalLink 
} from "lucide-react";
import { 
  Card, 
  Badge, 
  Button 
} from "@/components/ui";
import { 
  AdminDataTable, 
  AdminFilterBar, 
  AdminConfirmModal, 
  AdminEmptyState 
} from "@/components/admin";
import { FounderFormModal, FounderFormData } from "./FounderFormModal";
import { deleteFounderAction, toggleFounderPublishAction } from "@/lib/actions/founders";

export interface FounderRecord {
  id: string;
  nameEn: string;
  nameAr?: string | null;
  portraitUrl?: string | null;
  roleTitleEn: string;
  roleTitleAr?: string | null;
  bioEn?: string | null;
  bioAr?: string | null;
  foundingYear?: number | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminFoundersClientProps {
  initialFounders: FounderRecord[];
}

export function AdminFoundersClient({ initialFounders }: AdminFoundersClientProps) {
  const [founders, setFounders] = useState<FounderRecord[]>(initialFounders);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFounder, setActiveFounder] = useState<FounderFormData | null>(null);

  const [founderToDelete, setFounderToDelete] = useState<FounderRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status toggle handler
  const handleTogglePublish = async (founder: FounderRecord) => {
    const nextStatus = !founder.isPublished;
    const res = await toggleFounderPublishAction(founder.id, nextStatus);
    if (res.success) {
      setFounders((prev) =>
        prev.map((f) => (f.id === founder.id ? { ...f, isPublished: nextStatus } : f))
      );
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!founderToDelete) return;
    setIsDeleting(true);

    const res = await deleteFounderAction(founderToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      setFounders((prev) => prev.filter((f) => f.id !== founderToDelete.id));
      setIsDeleteModalOpen(false);
      setFounderToDelete(null);
    }
  };

  const filteredFounders = founders.filter((f) => {
    // Tab filter
    if (activeTab === "published" && !f.isPublished) return false;
    if (activeTab === "draft" && f.isPublished) return false;

    // Search filter
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      f.nameEn.toLowerCase().includes(s) ||
      (f.nameAr && f.nameAr.includes(s)) ||
      f.roleTitleEn.toLowerCase().includes(s) ||
      (f.foundingYear && f.foundingYear.toString().includes(s))
    );
  });

  const publishedCount = founders.filter((f) => f.isPublished).length;
  const draftCount = founders.filter((f) => !f.isPublished).length;

  return (
    <div className="space-y-6">
      {/* Top Action Bar with Link to Public Memorial Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Verified Founder Profiles
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Authenticate founding scholars and convening members for the historical record.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/founders" target="_blank">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Public Memorial Page
            </Button>
          </Link>

          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              setActiveFounder(null);
              setIsModalOpen(true);
            }}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Register Founder
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <AdminFilterBar
        statusTabs={[
          { id: "all", label: "All Founders", count: founders.length },
          { id: "published", label: "Published", count: publishedCount },
          { id: "draft", label: "Draft / Private", count: draftCount },
        ]}
        activeStatusTab={activeTab}
        onStatusTabChange={setActiveTab}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search founders by name, designation, or year..."
        resultCount={filteredFounders.length}
        totalCount={founders.length}
      />

      {/* Founders Data Table */}
      <Card className="border-[var(--border-color)]">
        <AdminDataTable
          columns={[
            {
              key: "name",
              header: "Founder Identity",
              render: (f) => (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold text-xs shrink-0 border border-[var(--border-subtle)] font-mono">
                    {f.nameEn.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      {f.nameEn}
                    </div>
                    {f.nameAr && (
                      <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">
                        {f.nameAr}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "roleTitleEn",
              header: "Designation & Inception",
              render: (f) => (
                <div>
                  <div className="font-semibold text-xs text-[var(--text-primary)]">
                    {f.roleTitleEn}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] font-mono">
                    Year: {f.foundingYear || "Inception"} • Order: {f.sortOrder}
                  </div>
                </div>
              ),
            },
            {
              key: "isPublished",
              header: "State",
              render: (f) => (
                <Badge variant={f.isPublished ? "accent" : "neutral"} size="sm">
                  {f.isPublished ? "Published" : "Draft"}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              align: "right",
              render: (f) => (
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublish(f)}
                    title={f.isPublished ? "Unpublish founder" : "Publish founder"}
                    className="text-xs"
                  >
                    {f.isPublished ? (
                      <ToggleRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-1" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-[var(--text-muted)] mr-1" />
                    )}
                    {f.isPublished ? "Public" : "Draft"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveFounder(f);
                      setIsModalOpen(true);
                    }}
                    className="text-xs"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setFounderToDelete(f);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete founder record"
                    className="p-1.5 rounded-[4px] text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
          data={filteredFounders}
          keyExtractor={(f) => f.id}
          emptyTitle="No Founders Cataloged"
          emptyDescription="There are currently no founder profiles matching your selected filter."
          emptyActionLabel="Register First Founder"
          onEmptyAction={() => {
            setActiveFounder(null);
            setIsModalOpen(true);
          }}
        />
      </Card>

      {/* Founder Create/Edit Modal */}
      <FounderFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
        founder={activeFounder}
      />

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setFounderToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        isDestructive={true}
        title="Delete Founder Profile"
        message={`Are you sure you want to permanently delete the profile for "${founderToDelete?.nameEn}"? This historical record will be removed from database and public memorial archives.`}
        confirmLabel="Delete Profile"
      />
    </div>
  );
}
