/**
 * @file src/app/admin/members/AdminMembersClient.tsx
 * @description Interactive client console for Member Records & Privacy Consent Management (Feature 015).
 * 
 * DEVELOPER USAGE NOTE:
 * - Internal membership repository with private contact visibility controls.
 * - Strix Privacy & Security Guarantee:
 *   - Only members with isPublic === true are published on the public /members directory.
 *   - Sensitive PII (phone, studentId, email) is displayed only to authorized administrators.
 * - Coordinates MemberFormModal, AdminDataTable, AdminFilterBar, and AdminPagination.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  UserCheck, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Shield, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  ExternalLink,
  Lock,
  UserX
} from "lucide-react";
import { 
  Card, 
  Badge, 
  Button 
} from "@/components/ui";
import { 
  AdminDataTable, 
  AdminFilterBar, 
  AdminPagination, 
  AdminConfirmModal, 
  AdminEmptyState 
} from "@/components/admin";
import { MemberFormModal, MemberFormData } from "./MemberFormModal";
import { 
  updateMemberVisibilityAction, 
  updateMemberStatusAction, 
  deleteMemberAction 
} from "@/lib/actions/members";

export interface MemberRecord {
  id: string;
  membershipId: string;
  fullNameEn: string;
  fullNameAr?: string | null;
  photoUrl?: string | null;
  email: string;
  phone?: string | null;
  studentId?: string | null;
  status: "active" | "alumni" | "honorary" | "suspended";
  isPublic: boolean;
  bioEn?: string | null;
  bioAr?: string | null;
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminMembersClientProps {
  initialMembers: MemberRecord[];
  initialTotal: number;
}

export function AdminMembersClient({ initialMembers, initialTotal }: AdminMembersClientProps) {
  const [members, setMembers] = useState<MemberRecord[]>(initialMembers);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMember, setActiveMember] = useState<MemberFormData | null>(null);

  const [memberToDelete, setMemberToDelete] = useState<MemberRecord | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick visibility toggle
  const handleToggleVisibility = async (member: MemberRecord) => {
    const nextPublic = !member.isPublic;
    const res = await updateMemberVisibilityAction(member.id, nextPublic);
    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, isPublic: nextPublic } : m))
      );
    }
  };

  // Quick status update
  const handleStatusChange = async (member: MemberRecord, nextStatus: any) => {
    const res = await updateMemberStatusAction(member.id, nextStatus);
    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, status: nextStatus } : m))
      );
    }
  };

  // Delete confirm
  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);

    const res = await deleteMemberAction(memberToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  };

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    // Status tab
    if (activeTab !== "all" && m.status !== activeTab) return false;

    // Visibility filter
    if (visibilityFilter === "public" && !m.isPublic) return false;
    if (visibilityFilter === "private" && m.isPublic) return false;

    // Search
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      m.fullNameEn.toLowerCase().includes(s) ||
      (m.fullNameAr && m.fullNameAr.includes(s)) ||
      m.membershipId.toLowerCase().includes(s) ||
      m.email.toLowerCase().includes(s) ||
      (m.studentId && m.studentId.toLowerCase().includes(s))
    );
  });

  // Client-side pagination
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Counts for tabs
  const activeCount = members.filter((m) => m.status === "active").length;
  const alumniCount = members.filter((m) => m.status === "alumni").length;
  const suspendedCount = members.filter((m) => m.status === "suspended").length;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Member Records & Verification Console
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Manage student fellows, enrollment credentials, and public directory consent.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/members" target="_blank">
            <Button variant="outline" size="sm" className="text-xs">
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              Public Directory View
            </Button>
          </Link>

          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              setActiveMember(null);
              setIsModalOpen(true);
            }}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Register Fellow
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <AdminFilterBar
        statusTabs={[
          { id: "all", label: "All Members", count: members.length },
          { id: "active", label: "Active Fellows", count: activeCount },
          { id: "alumni", label: "Alumni", count: alumniCount },
          { id: "suspended", label: "Suspended", count: suspendedCount },
        ]}
        activeStatusTab={activeTab}
        onStatusTabChange={(tab) => {
          setActiveTab(tab);
          setCurrentPage(1);
        }}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search fellows by name, email, student ID, or ref..."
        dropdownFilters={[
          {
            id: "visibility",
            label: "Directory Visibility",
            currentValue: visibilityFilter,
            onChange: (val) => {
              setVisibilityFilter(val);
              setCurrentPage(1);
            },
            options: [
              { value: "all", label: "All Visibility (Public & Private)" },
              { value: "public", label: "Public Directory Only" },
              { value: "private", label: "Private / Redacted Only" },
            ],
          },
        ]}
        resultCount={filteredMembers.length}
        totalCount={members.length}
      />

      {/* Members Data Table */}
      <Card className="border-[var(--border-color)]">
        <AdminDataTable
          columns={[
            {
              key: "membershipId",
              header: "Member ID",
              className: "w-28 font-mono text-xs font-bold text-[var(--brand-accent)]",
            },
            {
              key: "identity",
              header: "Fellow Identity",
              render: (m) => (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[4px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold text-xs font-mono shrink-0">
                    {m.fullNameEn.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      {m.fullNameEn}
                    </div>
                    {m.fullNameAr && (
                      <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">
                        {m.fullNameAr}
                      </div>
                    )}
                    {m.studentId && (
                      <div className="text-[10px] font-mono text-[var(--text-muted)]">
                        Std ID: {m.studentId}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: "contacts",
              header: "Private Contacts (Confidential)",
              render: (m) => (
                <div className="space-y-0.5 text-[11px] text-[var(--text-muted)] font-mono">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[var(--text-muted)]" />
                    <span>{m.email}</span>
                  </div>
                  {m.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[var(--text-muted)]" />
                      <span>{m.phone}</span>
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (m) => (
                <select
                  value={m.status}
                  onChange={(e) => handleStatusChange(m, e.target.value)}
                  className="px-2 py-1 text-xs rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="alumni">Alumni</option>
                  <option value="honorary">Honorary</option>
                  <option value="suspended">Suspended</option>
                </select>
              ),
            },
            {
              key: "isPublic",
              header: "Directory Visibility",
              render: (m) => (
                <button
                  type="button"
                  onClick={() => handleToggleVisibility(m)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold hover:bg-[var(--bg-surface-hover)] transition-colors"
                  title={m.isPublic ? "Click to make private" : "Click to display in public directory"}
                >
                  {m.isPublic ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-400">Public</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-[var(--text-muted)]" />
                      <span className="text-[var(--text-muted)]">Private</span>
                    </>
                  )}
                </button>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              align: "right",
              render: (m) => (
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveMember(m);
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
                      setMemberToDelete(m);
                      setIsDeleteModalOpen(true);
                    }}
                    title="Delete member record"
                    className="p-1.5 rounded-[4px] text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
          data={paginatedMembers}
          keyExtractor={(m) => m.id}
          emptyTitle="No Members Found"
          emptyDescription="There are currently no member records matching your filter parameters."
          emptyActionLabel="Register New Fellow"
          onEmptyAction={() => {
            setActiveMember(null);
            setIsModalOpen(true);
          }}
        />

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[var(--border-subtle)]">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredMembers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      {/* Member Form Modal */}
      <MemberFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => window.location.reload()}
        member={activeMember}
      />

      {/* Delete Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        isDestructive={true}
        title="Delete Member Profile"
        message={`Are you sure you want to delete the member record for "${memberToDelete?.fullNameEn}" (${memberToDelete?.membershipId})? This action will permanently remove their profile and credentials.`}
        confirmLabel="Delete Member"
      />
    </div>
  );
}
