/**
 * @file src/app/admin/applications/ApplicationReviewModal.tsx
 * @description Modal Dialog for Administrative Review and Decision on Admissions Dossiers.
 * 
 * ARCHITECTURE & SECURITY:
 * - Allows authorized committee reviewers to examine student academic credentials,
 *   motivation statement, and Arabic language proficiency.
 * - Submits decisions via `reviewMembershipApplicationAction` with RBAC verification.
 * - Records decision and notes to immutable audit trail.
 * - Human Vibe: authentic academic design, zero AI emojis, Lucide SVG icons.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use client";

import React, { useState, useTransition } from "react";
import { Modal, Button, Badge } from "@/components/ui";
import { reviewMembershipApplicationAction } from "@/lib/actions/membership-application";
import { 
  ShieldCheck, 
  User, 
  GraduationCap, 
  Mail, 
  Phone, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw,
  AlertCircle,
  FileText,
  CornerDownRight
} from "lucide-react";

export interface ApplicationDossier {
  id: string;
  referenceNo: string;
  applicantName: string;
  applicantNameAr?: string | null;
  email: string;
  phone: string;
  studentId?: string | null;
  department?: string | null;
  faculty?: string | null;
  academicLevel?: string | null;
  category: string;
  arabicProficiency: string;
  motivation: string;
  consentAgreed: boolean;
  directoryConsent: boolean;
  status: "pending" | "under_review" | "approved" | "rejected" | "withdrawn";
  reviewerNotes?: string | null;
  reviewedById?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ApplicationReviewModalProps {
  application: ApplicationDossier | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationReviewModal({
  application,
  isOpen,
  onClose,
  onSuccess,
}: ApplicationReviewModalProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<"under_review" | "approved" | "rejected">(
    application?.status === "approved" || application?.status === "rejected" || application?.status === "under_review"
      ? application.status
      : "under_review"
  );
  const [reviewerNotes, setReviewerNotes] = useState(application?.reviewerNotes || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state if application prop changes
  React.useEffect(() => {
    if (application) {
      if (application.status === "approved" || application.status === "rejected" || application.status === "under_review") {
        setSelectedStatus(application.status);
      } else {
        setSelectedStatus("under_review");
      }
      setReviewerNotes(application.reviewerNotes || "");
      setErrorMsg(null);
    }
  }, [application]);

  if (!application) return null;

  const handleSubmitDecision = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await reviewMembershipApplicationAction({
        applicationId: application.id,
        status: selectedStatus,
        reviewerNotes: reviewerNotes.trim() || undefined,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to submit review decision.");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Admissions Dossier Review"
      description={`Reference: ${application.referenceNo} — Submitted on ${new Date(application.createdAt).toLocaleDateString()}`}
      maxWidth="xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Dossier Header Info */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Applicant Legal & Arabic Name
            </div>
            <div className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 mt-0.5">
              <span>{application.applicantName}</span>
              {application.applicantNameAr && (
                <span className="font-serif text-[#173D32] dark:text-[#B18A4A]" dir="rtl">
                  ({application.applicantNameAr})
                </span>
              )}
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono">
                <Mail className="w-3 h-3 text-stone-400" />
                {application.email}
              </span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3 h-3 text-stone-400" />
                {application.phone}
              </span>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Current Dossier Status
            </div>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                application.status === "approved"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : application.status === "rejected"
                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                  : application.status === "under_review"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                  : application.status === "withdrawn"
                  ? "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              }`}>
                {application.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Profile */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#173D32] dark:text-[#B18A4A] flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Academic & Linguistic Profile
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800">
              <div className="text-stone-500 mb-0.5">Student ID</div>
              <div className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                {application.studentId || "Not Provided"}
              </div>
            </div>
            <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800">
              <div className="text-stone-500 mb-0.5">Department</div>
              <div className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                {application.department || "General"}
              </div>
            </div>
            <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800">
              <div className="text-stone-500 mb-0.5">Academic Level</div>
              <div className="font-semibold text-stone-800 dark:text-stone-200">
                {application.academicLevel || "Undergraduate"}
              </div>
            </div>
            <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800">
              <div className="text-stone-500 mb-0.5">Arabic Level</div>
              <div className="font-semibold capitalize text-[#173D32] dark:text-[#B18A4A]">
                {application.arabicProficiency}
              </div>
            </div>
          </div>
        </div>

        {/* Statement of Intent */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-stone-400" />
            Statement of Intent / Motivation (بيان الدافع)
          </h4>
          <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
            {application.motivation}
          </div>
        </div>

        {/* Consents Recorded */}
        <div className="p-3 rounded-lg bg-stone-100/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/80 flex flex-wrap items-center justify-between text-xs text-stone-600 dark:text-stone-400 gap-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Charter Agreement: <span className="font-semibold">Confirmed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-3.5 h-3.5 ${application.directoryConsent ? "text-emerald-600" : "text-stone-400"}`} />
            Public Directory Consent: <span className="font-semibold">{application.directoryConsent ? "Granted" : "Withheld"}</span>
          </div>
        </div>

        {/* Decision Submission Form */}
        <form onSubmit={handleSubmitDecision} className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#B18A4A]" />
            Admissions Committee Adjudication
          </h4>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-700 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Review Action Decision *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedStatus("under_review")}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  selectedStatus === "under_review"
                    ? "bg-blue-50 border-blue-600 text-blue-700 dark:bg-blue-950/50 dark:border-blue-500 dark:text-blue-300 shadow-sm"
                    : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Under Review
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("approved")}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  selectedStatus === "approved"
                    ? "bg-emerald-50 border-emerald-600 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-500 dark:text-emerald-300 shadow-sm"
                    : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Approve Admission
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus("rejected")}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  selectedStatus === "rejected"
                    ? "bg-rose-50 border-rose-600 text-rose-700 dark:bg-rose-950/50 dark:border-rose-500 dark:text-rose-300 shadow-sm"
                    : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50"
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                Decline Application
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Reviewer Notes / Instructions for Applicant (Optional)
            </label>
            <textarea
              rows={3}
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="e.g. Approved for Intermediate track. Orientation invitation issued via email."
              className="w-full p-3 rounded-lg text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#173D32]"
            />
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              This note will be visible to the applicant when they check their status, and logged to the permanent audit trail.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={`text-xs font-semibold text-white px-5 ${
                selectedStatus === "approved"
                  ? "bg-emerald-700 hover:bg-emerald-800"
                  : selectedStatus === "rejected"
                  ? "bg-rose-700 hover:bg-rose-800"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              {isPending ? "Recording Decision..." : "Confirm & Save Decision"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
