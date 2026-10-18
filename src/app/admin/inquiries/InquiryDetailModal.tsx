/**
 * @file src/app/admin/inquiries/InquiryDetailModal.tsx
 * @description Modal Dialog for Administrative Inspection & Triage of Contact Inquiries.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows Secretariat officers to read incoming inquiry dossiers, inspect delivery status,
 *   update resolution status (unread -> read -> replied -> archived), and record internal notes.
 * - Submits status changes via Next.js Server Action `updateInquiryStatusAction()`.
 * - Records action into immutable audit trail.
 * 
 * HUMAN VIBE POLICY:
 * - Strictly zero AI emojis. Clean academic typography and Lucide SVG icons.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use client";

import React, { useState, useTransition } from "react";
import { Modal, Button, Badge } from "@/components/ui";
import { updateInquiryStatusAction } from "@/lib/actions/contact-inquiry";
import { 
  Mail, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Archive, 
  CornerDownRight, 
  AlertCircle,
  ShieldCheck,
  Send
} from "lucide-react";

export interface InquiryDossier {
  id: string;
  referenceNo: string;
  fullName: string;
  email: string;
  department: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  deliveryStatus: "stored_locally" | "delivered_smtp" | "delivery_failed";
  ipAddress?: string | null;
  adminNotes?: string | null;
  repliedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface InquiryDetailModalProps {
  inquiry: InquiryDossier | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InquiryDetailModal({
  inquiry,
  isOpen,
  onClose,
  onSuccess,
}: InquiryDetailModalProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedStatus, setSelectedStatus] = useState<"unread" | "read" | "replied" | "archived">(
    inquiry?.status || "read"
  );
  const [adminNotes, setAdminNotes] = useState(inquiry?.adminNotes || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (inquiry) {
      // If currently unread, suggest transitioning to read
      setSelectedStatus(inquiry.status === "unread" ? "read" : inquiry.status);
      setAdminNotes(inquiry.adminNotes || "");
      setErrorMsg(null);
    }
  }, [inquiry]);

  if (!inquiry) return null;

  const handleSubmitStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await updateInquiryStatusAction({
        inquiryId: inquiry.id,
        status: selectedStatus,
        adminNotes: adminNotes.trim() || undefined,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.error || "Failed to update inquiry status.");
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Correspondence Dossier"
      description={`Reference: ${inquiry.referenceNo} — Department: ${inquiry.department.toUpperCase()}`}
      maxWidth="lg"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* Header Info Banner */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Sender Details
            </div>
            <div className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              {inquiry.fullName}
            </div>
            <div className="text-xs font-mono text-[#173D32] dark:text-[#B18A4A] mt-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <a href={`mailto:${inquiry.email}`} className="hover:underline">
                {inquiry.email}
              </a>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Transmission Timestamp
            </div>
            <div className="text-xs text-stone-800 dark:text-stone-200 font-medium mt-0.5">
              {new Date(inquiry.createdAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
            <div className="mt-1.5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                inquiry.deliveryStatus === "delivered_smtp"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
              }`}>
                {inquiry.deliveryStatus === "delivered_smtp" ? "SMTP Confirmed" : "Stored in Secretariat Database"}
              </span>
            </div>
          </div>
        </div>

        {/* Subject & Message Content */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 block mb-0.5">
              Subject Title
            </span>
            <div className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
              {inquiry.subject}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block">
              Inquiry Body
            </span>
            <div className="p-4 rounded-xl bg-stone-50/90 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
              {inquiry.message}
            </div>
          </div>
        </div>

        {/* Status Transition & Admin Notes Form */}
        <form onSubmit={handleSubmitStatus} className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#B18A4A]" />
            Secretariat Resolution & Processing
          </h4>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-700 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Status Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Update Processing Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "unread", label: "Mark Unread", color: "amber" },
                { id: "read", label: "Mark Read", color: "blue" },
                { id: "replied", label: "Mark Replied", color: "emerald" },
                { id: "archived", label: "Archive", color: "stone" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedStatus(s.id as any)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                    selectedStatus === s.id
                      ? "bg-[#173D32] border-[#173D32] text-white shadow-sm"
                      : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Admin Internal Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Secretariat Internal Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Replied via email on Oct 18 regarding debate schedule. Assigned to VP."
              className="w-full p-3 rounded-lg text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#173D32]"
            />
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Internal notes are only visible to administrators and are recorded in the audit log.
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
              className="bg-[#173D32] hover:bg-[#122e26] text-white text-xs font-semibold px-5"
            >
              {isPending ? "Updating..." : "Save Processing State"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
