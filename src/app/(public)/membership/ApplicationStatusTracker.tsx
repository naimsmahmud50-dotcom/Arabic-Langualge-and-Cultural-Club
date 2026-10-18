/**
 * @file src/app/(public)/membership/ApplicationStatusTracker.tsx
 * @description Secure Applicant Self-Service Status Tracker & Withdrawal Portal.
 * 
 * ARCHITECTURE & SECURITY GUARANTEES:
 * - Dual-factor lookup: requires BOTH reference number (e.g., APP-2026-XXXX) AND registered email.
 * - Anti-Enumeration: returns generic not-found without revealing if email or ref exists independently.
 * - Allows self-service withdrawal for dossiers currently in 'pending' status.
 * - Strictly zero AI emojis; uses Lucide icons and academic typography.
 * 
 * REQUIREMENTS COVERED:
 * - REQ-PUB-13: Membership status tracking workflow.
 * - SPEC-APP-03: Privacy-preserving status tracker with self-service withdrawal.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, Badge, Button, Input } from "@/components/ui";
import { 
  trackApplicationStatusAction, 
  withdrawApplicationAction, 
  StatusTrackingResult 
} from "@/lib/actions/membership-application";
import { 
  Search, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  CornerDownRight, 
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from "lucide-react";

export function ApplicationStatusTracker() {
  const [isPending, startTransition] = useTransition();
  const [isWithdrawing, startWithdrawTransition] = useTransition();
  const [referenceNo, setReferenceNo] = useState("");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<StatusTrackingResult["application"] | null>(null);
  const [hasQueried, setHasQueried] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setWithdrawSuccessMsg(null);
    setShowWithdrawConfirm(false);

    if (!referenceNo.trim() || !email.trim()) {
      setErrorMsg("Please provide both your Reference Number and registered Email address.");
      return;
    }

    startTransition(async () => {
      const res = await trackApplicationStatusAction({ referenceNo, email });
      setHasQueried(true);
      if (res.success && res.application) {
        setStatusResult(res.application);
      } else {
        setStatusResult(null);
        setErrorMsg(res.error || "Application not found.");
      }
    });
  };

  const handleWithdraw = () => {
    setErrorMsg(null);
    startWithdrawTransition(async () => {
      const res = await withdrawApplicationAction({ referenceNo, email });
      if (res.success) {
        setWithdrawSuccessMsg(res.message || "Your application has been successfully withdrawn.");
        setShowWithdrawConfirm(false);
        // Refresh local status
        if (statusResult) {
          setStatusResult({
            ...statusResult,
            status: "withdrawn",
            updatedAt: new Date(),
          });
        }
      } else {
        setErrorMsg(res.error || "Failed to withdraw application.");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Admitted / Approved
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Under Committee Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Declined
          </span>
        );
      case "withdrawn":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-300 dark:bg-stone-900 dark:text-stone-300 dark:border-stone-700">
            <RotateCcw className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400" />
            Voluntarily Withdrawn
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Received / Intake Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Lookup Form Card */}
      <Card className="border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm shadow-sm">
        <CardContent className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-200 dark:border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-[#173D32]/10 dark:bg-[#173D32]/30 flex items-center justify-center text-[#173D32] dark:text-[#B18A4A]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
                Track Application Status
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Enter your unique reference number and registered email to view the official review status.
              </p>
            </div>
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Reference Number *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. APP-2026-XXXXXX"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value.toUpperCase())}
                  className="font-mono uppercase text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                  Registered Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="applicant@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm"
                  required
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-700 dark:text-rose-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {withdrawSuccessMsg && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{withdrawSuccessMsg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-[#173D32] hover:bg-[#122e26] text-white flex items-center gap-2 text-xs font-medium px-5 py-2 rounded-lg"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking Records...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Check Status
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Result Display */}
      {statusResult && (
        <Card className="border-2 border-[#B18A4A]/30 dark:border-[#B18A4A]/20 bg-stone-50/80 dark:bg-stone-900/80 shadow-md">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
              <div>
                <span className="text-[11px] font-mono tracking-wider text-stone-500 uppercase">Dossier Reference</span>
                <h4 className="font-mono text-xl font-bold text-[#173D32] dark:text-[#B18A4A]">
                  {statusResult.referenceNo}
                </h4>
              </div>
              <div>{getStatusBadge(statusResult.status)}</div>
            </div>

            {/* Applicant Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="text-stone-500 dark:text-stone-400 mb-1">Applicant Name</div>
                <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center justify-between">
                  <span>{statusResult.applicantName}</span>
                  {statusResult.applicantNameAr && (
                    <span className="font-serif text-[#173D32] dark:text-[#B18A4A]" dir="rtl">
                      {statusResult.applicantNameAr}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="text-stone-500 dark:text-stone-400 mb-1">Submitted On</div>
                <div className="font-semibold text-stone-900 dark:text-stone-100">
                  {new Date(statusResult.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Contextual Status Guidance */}
            <div className="p-4 rounded-xl bg-white dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-800 dark:text-stone-200">
                <ShieldCheck className="w-4 h-4 text-[#B18A4A]" />
                Institutional Status Overview
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                {statusResult.status === "pending" && (
                  "Your application has been safely logged in the Club registry. The Admissions Committee reviews dossiers on a bi-weekly cycle. No further action is required from you at this time."
                )}
                {statusResult.status === "under_review" && (
                  "Your dossier is actively under examination by the Executive Admissions Committee. Committee members are evaluating your academic background and Arabic learning background."
                )}
                {statusResult.status === "approved" && (
                  "Congratulations! Your application for club membership has been approved by the Executive Committee. You will receive an official welcome packet via email with your Club Orientation schedule."
                )}
                {statusResult.status === "rejected" && (
                  "Following committee evaluation, we are unable to accept your membership application at this time. Thank you for your interest in the Arabic Language & Cultural Club."
                )}
                {statusResult.status === "withdrawn" && (
                  "This application was formally withdrawn by the applicant. You are welcome to submit a fresh application in a subsequent admissions round."
                )}
              </p>
            </div>

            {/* Official Reviewer Notes if present */}
            {statusResult.reviewerNotes && (
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <CornerDownRight className="w-3.5 h-3.5" />
                  Official Secretariat / Committee Note
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-400/90 leading-relaxed italic">
                  "{statusResult.reviewerNotes}"
                </p>
              </div>
            )}

            {/* Self-Service Withdrawal Action (Only permitted if status is 'pending') */}
            {statusResult.status === "pending" && (
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
                {!showWithdrawConfirm ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      Changed your mind or need to submit new information?
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowWithdrawConfirm(true)}
                      className="text-xs text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300"
                    >
                      Withdraw Application
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-rose-800 dark:text-rose-300">
                        <span className="font-semibold block mb-0.5">Confirm Application Withdrawal</span>
                        Are you sure you wish to withdraw this membership application? This action cannot be undone, though you may submit a new application later.
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowWithdrawConfirm(false)}
                        className="text-xs"
                      >
                        Keep Application
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isWithdrawing}
                        onClick={handleWithdraw}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
                      >
                        {isWithdrawing ? "Processing..." : "Confirm Withdrawal"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty / Not Found Guidance */}
      {hasQueried && !statusResult && !isPending && (
        <div className="p-6 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-stone-400 mx-auto" />
          <h5 className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            Dossier Not Found
          </h5>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
            Please ensure you have entered the exact Reference Number received on your confirmation voucher (e.g. APP-2026-XXXX) and the matching email address. If you recently applied, please allow a moment for synchronization.
          </p>
        </div>
      )}
    </div>
  );
}
