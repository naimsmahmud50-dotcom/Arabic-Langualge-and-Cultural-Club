/**
 * @file src/app/admin/applications/AdminApplicationsClient.tsx
 * @description Interactive Client Queue for Admissions Review, Filtering, and Adjudication.
 * 
 * ARCHITECTURE & ROLE:
 * - Renders filterable queue of student admissions applications.
 * - Supports instant search by reference number, name, email, student ID, and department.
 * - Manages modal lifecycle for detailed dossier review and status updates.
 * - Meets Requirement REQ-ADM-06 and SPEC-APP-04.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge, Button, Input, EmptyState } from "@/components/ui";
import { ApplicationReviewModal, ApplicationDossier } from "./ApplicationReviewModal";
import { 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  Eye, 
  GraduationCap, 
  Mail, 
  UserPlus, 
  ShieldCheck,
  RefreshCw
} from "lucide-react";

interface AdminApplicationsClientProps {
  initialApplications: ApplicationDossier[];
}

export function AdminApplicationsClient({ initialApplications }: AdminApplicationsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDossier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status counts for tab badges
  const counts = useMemo(() => {
    return {
      all: initialApplications.length,
      pending: initialApplications.filter(a => a.status === "pending").length,
      under_review: initialApplications.filter(a => a.status === "under_review").length,
      approved: initialApplications.filter(a => a.status === "approved").length,
      rejected: initialApplications.filter(a => a.status === "rejected").length,
      withdrawn: initialApplications.filter(a => a.status === "withdrawn").length,
    };
  }, [initialApplications]);

  // Filtered applications based on activeTab and searchQuery
  const filteredApplications = useMemo(() => {
    return initialApplications.filter((app) => {
      // Status filter
      if (activeTab !== "all" && app.status !== activeTab) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = app.referenceNo.toLowerCase().includes(q);
        const matchesName = app.applicantName.toLowerCase().includes(q) || (app.applicantNameAr && app.applicantNameAr.includes(q));
        const matchesEmail = app.email.toLowerCase().includes(q);
        const matchesStudentId = app.studentId && app.studentId.toLowerCase().includes(q);
        const matchesDept = app.department && app.department.toLowerCase().includes(q);

        if (!matchesRef && !matchesName && !matchesEmail && !matchesStudentId && !matchesDept) {
          return false;
        }
      }

      return true;
    });
  }, [initialApplications, activeTab, searchQuery]);

  const handleOpenReview = (app: ApplicationDossier) => {
    setSelectedApplication(app);
    setIsModalOpen(true);
  };

  const handleReviewSuccess = () => {
    router.refresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Approved
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Under Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Declined
          </span>
        );
      case "withdrawn":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            <RotateCcw className="w-3 h-3 text-stone-500" />
            Withdrawn
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Pending Intake
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar: Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
          {[
            { id: "all", label: "All", count: counts.all },
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "under_review", label: "Under Review", count: counts.under_review },
            { id: "approved", label: "Approved", count: counts.approved },
            { id: "rejected", label: "Declined", count: counts.rejected },
            { id: "withdrawn", label: "Withdrawn", count: counts.withdrawn },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-stone-800 text-[#173D32] dark:text-[#B18A4A] shadow-sm font-bold"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.id
                  ? "bg-[#173D32]/10 dark:bg-[#B18A4A]/20 text-[#173D32] dark:text-[#B18A4A]"
                  : "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search reference, name, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#173D32]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.refresh()}
            className="text-xs shrink-0 flex items-center gap-1.5"
            title="Refresh queue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync</span>
          </Button>
        </div>
      </div>

      {/* Applications Data Table */}
      <Card className="border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
        {filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/75 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Reference & Date</th>
                  <th className="py-3 px-4">Applicant Dossier</th>
                  <th className="py-3 px-4">Academic Placement</th>
                  <th className="py-3 px-4">Linguistic Level</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Adjudication</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {filteredApplications.map((app) => (
                  <tr 
                    key={app.id} 
                    className="hover:bg-stone-50/60 dark:hover:bg-stone-900/60 transition-colors"
                  >
                    {/* Reference & Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-stone-900 dark:text-stone-100">
                        {app.referenceNo}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {new Date(app.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                    </td>

                    {/* Applicant Profile */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                        <span>{app.applicantName}</span>
                        {app.applicantNameAr && (
                          <span className="font-serif text-[#173D32] dark:text-[#B18A4A]" dir="rtl">
                            ({app.applicantNameAr})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>{app.email}</span>
                        <span>•</span>
                        <span>{app.phone}</span>
                      </div>
                    </td>

                    {/* Academic Placement */}
                    <td className="py-3.5 px-4">
                      <div className="text-stone-800 dark:text-stone-200 font-semibold">
                        {app.department || "General Admissions"}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                        {app.studentId ? (
                          <span className="font-mono">ID: {app.studentId}</span>
                        ) : (
                          <span>{app.academicLevel || "Undergraduate"}</span>
                        )}
                      </div>
                    </td>

                    {/* Linguistic Level */}
                    <td className="py-3.5 px-4">
                      <Badge variant="neutral" size="sm" className="capitalize">
                        {app.arabicProficiency}
                      </Badge>
                      <div className="text-[10px] text-stone-400 capitalize mt-1">
                        {app.category.replace("_", " ")}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(app.status)}
                    </td>

                    {/* Adjudication Action Button */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReview(app)}
                        className="text-xs bg-white dark:bg-stone-900 hover:border-[#173D32] dark:hover:border-[#B18A4A] inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>Review Dossier</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title={searchQuery ? "No Matching Applications Found" : "No Applications in this Queue"}
              description={
                searchQuery
                  ? `No applications matched the search term "${searchQuery}". Try searching with a different keyword.`
                  : activeTab === "all"
                  ? "No prospective student membership applications have been submitted yet."
                  : `There are currently no applications with status "${activeTab}".`
              }
              action={
                searchQuery ? (
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                ) : undefined
              }
            />
          </div>
        )}
      </Card>

      {/* Review Dossier Modal */}
      <ApplicationReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        application={selectedApplication}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
