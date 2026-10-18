/**
 * @file src/app/admin/committees/AdminCommitteesClient.tsx
 * @description Interactive client console for Committee Terms & Historical Preservation (Feature 015).
 * 
 * DEVELOPER USAGE NOTE:
 * - Manages governing terms (active vs archived) and executive council appointments.
 * - Enforces the Preservation Rule: All previous terms are preserved; selecting a term
 *   displays its exact historical officer roster without data loss.
 * - Coordinates CommitteeTermModal, AssignMemberModal, and AdminConfirmModal.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography and Lucide SVG icons.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Users2, 
  Plus, 
  Edit, 
  Trash2, 
  ShieldCheck, 
  ExternalLink, 
  UserPlus, 
  UserMinus,
  CheckCircle2,
  CalendarDays,
  ShieldAlert,
  ArrowRight
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
import { CommitteeTermModal, CommitteeTermFormData } from "./CommitteeTermModal";
import { AssignMemberModal, MemberOption } from "./AssignMemberModal";
import { deleteCommitteeTermAction, removeCommitteeMemberAction } from "@/lib/actions/committees";

export interface CommitteeTermRecord {
  id: string;
  academicYear: string;
  titleEn: string;
  titleAr?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  summaryEn?: string | null;
  summaryAr?: string | null;
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommitteeAssignmentRecord {
  id: string;
  termId: string;
  memberId: string;
  positionTitleEn: string;
  positionTitleAr?: string | null;
  rankOrder: number;
  roleDescription?: string | null;
  createdAt: Date;
  memberNameEn: string;
  memberNameAr?: string | null;
  memberPhotoUrl?: string | null;
  memberEmail: string;
  memberStudentId?: string | null;
  membershipId: string;
}

export interface AdminCommitteesClientProps {
  initialTerms: CommitteeTermRecord[];
  initialAssignments: Record<string, CommitteeAssignmentRecord[]>;
  availableMembers: MemberOption[];
}

export function AdminCommitteesClient({
  initialTerms,
  initialAssignments,
  availableMembers,
}: AdminCommitteesClientProps) {
  const [terms, setTerms] = useState<CommitteeTermRecord[]>(initialTerms);
  const [assignmentsMap, setAssignmentsMap] = useState<Record<string, CommitteeAssignmentRecord[]>>(initialAssignments);
  const [selectedTermId, setSelectedTermId] = useState<string>(
    initialTerms.find((t) => t.isCurrent)?.id || initialTerms[0]?.id || ""
  );

  const selectedTerm = terms.find((t) => t.id === selectedTermId) || terms[0] || null;
  const currentAssignments = (selectedTerm ? assignmentsMap[selectedTerm.id] : []) || [];

  // Modals
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [activeTermForEdit, setActiveTermForEdit] = useState<CommitteeTermFormData | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Term delete modal
  const [termToDelete, setTermToDelete] = useState<CommitteeTermRecord | null>(null);
  const [isDeleteTermModalOpen, setIsDeleteTermModalOpen] = useState(false);
  const [isDeletingTerm, setIsDeletingTerm] = useState(false);
  const [termDeleteError, setTermDeleteError] = useState<string | null>(null);

  // Officer remove modal
  const [assignmentToRemove, setAssignmentToRemove] = useState<{ id: string; name: string } | null>(null);
  const [isRemoveOfficerModalOpen, setIsRemoveOfficerModalOpen] = useState(false);
  const [isRemovingOfficer, setIsRemovingOfficer] = useState(false);

  // Term delete confirm
  const handleDeleteTermConfirm = async () => {
    if (!termToDelete) return;
    setIsDeletingTerm(true);
    setTermDeleteError(null);

    const res = await deleteCommitteeTermAction(termToDelete.id);
    setIsDeletingTerm(false);

    if (res.success) {
      setTerms((prev) => prev.filter((t) => t.id !== termToDelete.id));
      setIsDeleteTermModalOpen(false);
      setTermToDelete(null);
      if (selectedTermId === termToDelete.id) {
        const remaining = terms.filter((t) => t.id !== termToDelete.id);
        setSelectedTermId(remaining[0]?.id || "");
      }
    } else {
      setTermDeleteError(res.error || "Failed to delete committee term.");
    }
  };

  // Officer remove confirm
  const handleRemoveOfficerConfirm = async () => {
    if (!assignmentToRemove || !selectedTerm) return;
    setIsRemovingOfficer(true);

    const res = await removeCommitteeMemberAction(assignmentToRemove.id, selectedTerm.id);
    setIsRemovingOfficer(false);

    if (res.success) {
      setAssignmentsMap((prev) => ({
        ...prev,
        [selectedTerm.id]: (prev[selectedTerm.id] || []).filter((a) => a.id !== assignmentToRemove.id),
      }));
      setTerms((prev) =>
        prev.map((t) =>
          t.id === selectedTerm.id
            ? { ...t, memberCount: Math.max(0, (t.memberCount || 1) - 1) }
            : t
        )
      );
      setIsRemoveOfficerModalOpen(false);
      setAssignmentToRemove(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Academic Terms & Governing Councils
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Preserve past leadership records while managing current executive officer portfolios.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {selectedTerm && (
            <Link href={`/leadership?term=${selectedTerm.id}`} target="_blank">
              <Button variant="outline" size="sm" className="text-xs">
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Public Leadership View
              </Button>
            </Link>
          )}

          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              setActiveTermForEdit(null);
              setIsTermModalOpen(true);
            }}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Create Governing Term
          </Button>
        </div>
      </div>

      {/* Terms Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {terms.map((term) => {
          const isSelected = selectedTerm?.id === term.id;
          return (
            <div
              key={term.id}
              onClick={() => setSelectedTermId(term.id)}
              className={`p-4 rounded-[8px] border transition-all cursor-pointer ${
                isSelected
                  ? "border-[var(--brand-primary)] bg-[var(--bg-surface-elevated)] shadow-xs ring-1 ring-[var(--brand-primary)]"
                  : "border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[var(--brand-accent)]">
                  {term.academicYear}
                </span>
                <Badge variant={term.isCurrent ? "accent" : "neutral"} size="sm" className="text-[10px] py-0 px-1.5">
                  {term.isCurrent ? "Active Term" : "Archived"}
                </Badge>
              </div>

              <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                {term.titleEn}
              </h4>

              {term.titleAr && (
                <div className="font-arabic text-xs text-[var(--brand-accent)] truncate mt-0.5" dir="rtl">
                  {term.titleAr}
                </div>
              )}

              <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
                  <Users2 className="w-3 h-3" /> {term.memberCount ?? currentAssignments.length} officers
                </span>
                <span className="font-mono text-[10px]">
                  {term.startDate ? new Date(term.startDate).getFullYear() : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Term Detail & Officer Assignments Roster */}
      {selectedTerm ? (
        <Card className="border-[var(--border-color)] p-6 space-y-5">
          {/* Term Header & Operations */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <Badge variant={selectedTerm.isCurrent ? "accent" : "neutral"} size="sm">
                  {selectedTerm.isCurrent ? "Active Term (الحالي)" : "Historical Archive (سابق)"}
                </Badge>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {selectedTerm.titleEn} ({selectedTerm.academicYear})
                </h3>
              </div>
              {selectedTerm.titleAr && (
                <p className="font-arabic text-xs text-[var(--brand-accent)] mt-1" dir="rtl">
                  {selectedTerm.titleAr}
                </p>
              )}
              <div className="text-xs text-[var(--text-muted)] font-mono mt-1">
                Tenure: {selectedTerm.startDate} to {selectedTerm.endDate || "Present"}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTermForEdit({
                    id: selectedTerm.id,
                    academicYear: selectedTerm.academicYear,
                    titleEn: selectedTerm.titleEn,
                    titleAr: selectedTerm.titleAr,
                    startDate: selectedTerm.startDate,
                    endDate: selectedTerm.endDate,
                    isCurrent: selectedTerm.isCurrent,
                    summaryEn: selectedTerm.summaryEn,
                    summaryAr: selectedTerm.summaryAr,
                  });
                  setIsTermModalOpen(true);
                }}
                className="text-xs"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                Edit Term
              </Button>

              <Button
                variant="accent"
                size="sm"
                onClick={() => setIsAssignModalOpen(true)}
                className="text-xs"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                Appoint Officer
              </Button>

              {!selectedTerm.isCurrent && (
                <button
                  type="button"
                  onClick={() => {
                    setTermToDelete(selectedTerm);
                    setIsDeleteTermModalOpen(true);
                    setTermDeleteError(null);
                  }}
                  title="Delete historical term"
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-[4px] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Officer Assignments Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brand-accent)]">
                Council Roster ({currentAssignments.length} Officers)
              </h4>
              <span className="text-xs text-[var(--text-muted)]">
                Sorted by seniority rank order
              </span>
            </div>

            {currentAssignments.length > 0 ? (
              <AdminDataTable
                columns={[
                  {
                    key: "rankOrder",
                    header: "Rank",
                    className: "w-14 text-center font-mono font-bold text-xs text-[var(--brand-accent)]",
                  },
                  {
                    key: "member",
                    header: "Appointed Fellow",
                    render: (a) => (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[4px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold text-xs font-mono shrink-0">
                          {a.memberNameEn.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[var(--text-primary)]">
                            {a.memberNameEn}
                          </div>
                          {a.memberNameAr && (
                            <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">
                              {a.memberNameAr}
                            </div>
                          )}
                          <div className="text-[10px] font-mono text-[var(--text-muted)]">
                            ID: {a.membershipId} {a.memberStudentId ? `• Std: ${a.memberStudentId}` : ""}
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: "position",
                    header: "Executive Portfolio",
                    render: (a) => (
                      <div>
                        <div className="font-semibold text-xs text-[var(--text-primary)]">
                          {a.positionTitleEn}
                        </div>
                        {a.positionTitleAr && (
                          <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">
                            {a.positionTitleAr}
                          </div>
                        )}
                        {a.roleDescription && (
                          <div className="text-[10px] text-[var(--text-muted)] truncate max-w-xs mt-0.5">
                            {a.roleDescription}
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "actions",
                    header: "Actions",
                    align: "right",
                    render: (a) => (
                      <button
                        type="button"
                        onClick={() => {
                          setAssignmentToRemove({ id: a.id, name: `${a.memberNameEn} (${a.positionTitleEn})` });
                          setIsRemoveOfficerModalOpen(true);
                        }}
                        title="Remove officer from this term"
                        className="p-1.5 rounded-[4px] text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    ),
                  },
                ]}
                data={currentAssignments}
                keyExtractor={(a) => a.id}
              />
            ) : (
              <AdminEmptyState
                icon={Users2}
                title="No Officers Appointed"
                description={`No executive members have been assigned to ${selectedTerm.titleEn} yet. Appoint fellow members to populate this council.`}
                actionLabel="Appoint First Officer"
                onAction={() => setIsAssignModalOpen(true)}
              />
            )}
          </div>
        </Card>
      ) : (
        <AdminEmptyState
          icon={Users2}
          title="No Governing Terms Configured"
          description="Create your first academic governing term to establish the executive council."
          actionLabel="Create Academic Term"
          onAction={() => {
            setActiveTermForEdit(null);
            setIsTermModalOpen(true);
          }}
        />
      )}

      {/* Term Modal */}
      <CommitteeTermModal
        isOpen={isTermModalOpen}
        onClose={() => setIsTermModalOpen(false)}
        onSuccess={() => window.location.reload()}
        term={activeTermForEdit}
      />

      {/* Assign Member Modal */}
      {selectedTerm && (
        <AssignMemberModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={() => window.location.reload()}
          termId={selectedTerm.id}
          termAcademicYear={selectedTerm.academicYear}
          availableMembers={availableMembers}
        />
      )}

      {/* Delete Term Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isDeleteTermModalOpen}
        onClose={() => {
          setIsDeleteTermModalOpen(false);
          setTermToDelete(null);
          setTermDeleteError(null);
        }}
        onConfirm={handleDeleteTermConfirm}
        isLoading={isDeletingTerm}
        isDestructive={true}
        title="Delete Governing Term"
        message={`Are you sure you want to permanently delete the term "${termToDelete?.academicYear}"? All associated officer assignments will also be deleted.`}
        confirmLabel="Delete Term"
      />

      {/* Remove Officer Confirmation Modal */}
      <AdminConfirmModal
        isOpen={isRemoveOfficerModalOpen}
        onClose={() => {
          setIsRemoveOfficerModalOpen(false);
          setAssignmentToRemove(null);
        }}
        onConfirm={handleRemoveOfficerConfirm}
        isLoading={isRemovingOfficer}
        isDestructive={true}
        title="Remove Officer Assignment"
        message={`Are you sure you want to unassign ${assignmentToRemove?.name} from this term? The member will remain in the club roster.`}
        confirmLabel="Unassign Officer"
      />
    </div>
  );
}
