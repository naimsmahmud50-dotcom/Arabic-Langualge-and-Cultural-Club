/**
 * @file src/app/admin/inquiries/AdminInquiriesClient.tsx
 * @description Interactive Client Inbox for Secretariat Correspondence & Inquiry Triage.
 * 
 * ARCHITECTURE & ROLE:
 * - Filterable inbox displaying public inquiries submitted to the Secretariat.
 * - Supports filtering by status tabs (unread, read, replied, archived) and department portfolio.
 * - Provides real-time search across reference numbers, sender names, emails, and subjects.
 * - Manages modal lifecycle for inspecting correspondence dossiers.
 * 
 * HUMAN VIBE POLICY:
 * - Strictly zero AI emojis. Uses clean institutional typography and Lucide SVG icons.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge, Button, EmptyState } from "@/components/ui";
import { InquiryDetailModal, InquiryDossier } from "./InquiryDetailModal";
import { 
  Search, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Archive, 
  Eye, 
  RefreshCw, 
  Filter,
  Inbox
} from "lucide-react";

interface AdminInquiriesClientProps {
  initialInquiries: InquiryDossier[];
}

export function AdminInquiriesClient({ initialInquiries }: AdminInquiriesClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryDossier | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Status counts for tab badges
  const counts = useMemo(() => {
    return {
      all: initialInquiries.length,
      unread: initialInquiries.filter(i => i.status === "unread").length,
      read: initialInquiries.filter(i => i.status === "read").length,
      replied: initialInquiries.filter(i => i.status === "replied").length,
      archived: initialInquiries.filter(i => i.status === "archived").length,
    };
  }, [initialInquiries]);

  // Filter inquiries based on tab, department, and search
  const filteredInquiries = useMemo(() => {
    return initialInquiries.filter((item) => {
      // Status filter
      if (activeTab !== "all" && item.status !== activeTab) {
        return false;
      }

      // Department filter
      if (departmentFilter !== "all" && item.department !== departmentFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRef = item.referenceNo.toLowerCase().includes(q);
        const matchesName = item.fullName.toLowerCase().includes(q);
        const matchesEmail = item.email.toLowerCase().includes(q);
        const matchesSubject = item.subject.toLowerCase().includes(q);

        if (!matchesRef && !matchesName && !matchesEmail && !matchesSubject) {
          return false;
        }
      }

      return true;
    });
  }, [initialInquiries, activeTab, departmentFilter, searchQuery]);

  const handleOpenDetail = (item: InquiryDossier) => {
    setSelectedInquiry(item);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    router.refresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Unread
          </span>
        );
      case "read":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            Reviewed
          </span>
        );
      case "replied":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Replied
          </span>
        );
      case "archived":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            <Archive className="w-3 h-3 text-stone-500" />
            Archived
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar: Status Tabs & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
          {[
            { id: "all", label: "All Inquiries", count: counts.all },
            { id: "unread", label: "Unread", count: counts.unread },
            { id: "read", label: "Reviewed", count: counts.read },
            { id: "replied", label: "Replied", count: counts.replied },
            { id: "archived", label: "Archived", count: counts.archived },
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

        {/* Department Filter & Search Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-[#173D32]"
          >
            <option value="all">All Departments</option>
            <option value="general">General Secretariat</option>
            <option value="academic">Academic & Arabic Learning</option>
            <option value="debate">Debate & Oratory</option>
            <option value="membership">Membership Admissions</option>
            <option value="media">Media & Publications</option>
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search reference, sender, subject..."
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
            title="Refresh inbox"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync</span>
          </Button>
        </div>
      </div>

      {/* Inquiries Table */}
      <Card className="border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm">
        {filteredInquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/75 dark:bg-stone-900/50 text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Reference & Date</th>
                  <th className="py-3 px-4">Sender Profile</th>
                  <th className="py-3 px-4">Portfolio</th>
                  <th className="py-3 px-4">Subject Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Triage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {filteredInquiries.map((inquiry) => (
                  <tr 
                    key={inquiry.id} 
                    className={`hover:bg-stone-50/60 dark:hover:bg-stone-900/60 transition-colors ${
                      inquiry.status === "unread" ? "bg-amber-50/30 dark:bg-amber-950/10 font-medium" : ""
                    }`}
                  >
                    {/* Reference & Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-stone-900 dark:text-stone-100">
                        {inquiry.referenceNo}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                        {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </div>
                    </td>

                    {/* Sender Profile */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-stone-900 dark:text-stone-100">
                        {inquiry.fullName}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                        {inquiry.email}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="neutral" size="sm" className="capitalize">
                        {inquiry.department}
                      </Badge>
                    </td>

                    {/* Subject */}
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <div className="text-stone-900 dark:text-stone-100 font-semibold truncate">
                        {inquiry.subject}
                      </div>
                      <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {inquiry.message}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(inquiry.status)}
                    </td>

                    {/* Triage Action Button */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDetail(inquiry)}
                        className="text-xs bg-white dark:bg-stone-900 hover:border-[#173D32] dark:hover:border-[#B18A4A] inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>Open Dossier</span>
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
              title={searchQuery ? "No Matching Inquiries Found" : "No Inquiries in this Queue"}
              description={
                searchQuery
                  ? `No correspondence matched "${searchQuery}". Try a different keyword.`
                  : activeTab === "all"
                  ? "The Secretariat inbox is clear. No public inquiries have been recorded."
                  : `There are currently no inquiries in '${activeTab}' state.`
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

      {/* Inquiry Detail Modal */}
      <InquiryDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inquiry={selectedInquiry}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
