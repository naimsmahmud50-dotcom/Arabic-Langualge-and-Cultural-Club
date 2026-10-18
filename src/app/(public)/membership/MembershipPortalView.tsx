/**
 * @file src/app/(public)/membership/MembershipPortalView.tsx
 * @description Interactive Client Portal View for Membership Admissions & Status Tracking.
 * 
 * ARCHITECTURE & ROLE:
 * - Provides seamless switching between Admissions Application Dossier and Dual-Factor Status Tracker.
 * - Displays institutional eligibility guidelines, member privileges, and admissions cycle timelines.
 * - Meets Requirements REQ-PUB-13, SPEC-APP-01 through SPEC-APP-06.
 * 
 * HUMAN VIBE POLICY:
 * - Clean academic typography, zero AI emojis, Lucide SVG iconography.
 * 
 * @author Arabic Language & Cultural Club Engineering Secretariat
 */

"use client";

import React, { useState } from "react";
import { MembershipApplicationForm } from "./MembershipApplicationForm";
import { ApplicationStatusTracker } from "./ApplicationStatusTracker";
import { Card, CardContent, Badge, ClubLogo } from "@/components/ui";
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  BookOpen, 
  Award, 
  Users, 
  GraduationCap, 
  Sparkles 
} from "lucide-react";

export function MembershipPortalView() {
  const [activeTab, setActiveTab] = useState<"apply" | "track">("apply");

  return (
    <div className="space-y-12">
      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("apply")}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === "apply"
                ? "bg-[#173D32] text-white shadow-md"
                : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Submit Admissions Application</span>
            <span className="hidden sm:inline text-[11px] opacity-75 font-serif">(طلب العضوية)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              activeTab === "track"
                ? "bg-[#173D32] text-white shadow-md"
                : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Track Application Status</span>
            <span className="hidden sm:inline text-[11px] opacity-75 font-serif">(متابعة الطلب)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Active Workflow Tab View */}
        <div className="lg:col-span-2">
          {activeTab === "apply" ? (
            <MembershipApplicationForm />
          ) : (
            <ApplicationStatusTracker />
          )}
        </div>

        {/* Informational Sidebar: Privileges & Academic Guidelines */}
        <div className="space-y-6">
          {/* Official Collegiate Seal Card */}
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center space-y-3 shadow-xs">
            <ClubLogo variant="crest" size="lg" className="mx-auto filter drop-shadow-xs" />
            <div>
              <h4 className="font-serif font-bold text-sm text-[var(--text-primary)]">
                Official Society Fellowship
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Kabi Nazrul Government College, Dhaka
              </p>
              <p className="font-arabic text-[11px] text-[var(--brand-accent)] mt-1" dir="rtl">
                نادي اللغة والثقافة العربية
              </p>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <Card className="border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 backdrop-blur-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200 dark:border-stone-800">
                <GraduationCap className="w-5 h-5 text-[#B18A4A]" />
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                  Eligibility Criteria
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#173D32] dark:text-[#B18A4A] shrink-0 mt-0.5" />
                  <span>Enrolled undergraduate or postgraduate student in good academic standing.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#173D32] dark:text-[#B18A4A] shrink-0 mt-0.5" />
                  <span>Commitment to cultural respect, academic fellowship, and the club constitution.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#173D32] dark:text-[#B18A4A] shrink-0 mt-0.5" />
                  <span>Open to all linguistic proficiencies, from absolute beginners to fluent speakers.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Member Privileges */}
          <Card className="border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/60">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200 dark:border-stone-800">
                <Award className="w-5 h-5 text-[#B18A4A]" />
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                  Member Privileges
                </h3>
              </div>
              <ul className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B18A4A] shrink-0 mt-0.5" />
                  <span>Official institutional fellowship credential and voting rights in general assemblies.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B18A4A] shrink-0 mt-0.5" />
                  <span>Priority registration for masterclasses, syntax symposiums, and cultural tours.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B18A4A] shrink-0 mt-0.5" />
                  <span>Publishing eligibility in the official academic newsletter and literary journals.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#B18A4A] shrink-0 mt-0.5" />
                  <span>Access to specialized Arabic library manuscripts and pedagogical resources.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Admissions Cycle & Timeline */}
          <Card className="border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#173D32] dark:text-[#B18A4A]">
                <Clock className="w-4 h-4" />
                Admissions Review Timeline
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                The Admissions Committee convenes bi-weekly to review submitted dossiers. Applicants typically receive official notification within 7 to 10 academic days.
              </p>
            </CardContent>
          </Card>

          {/* Privacy & Governance Notice */}
          <div className="p-4 rounded-xl bg-stone-100/70 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60 text-stone-500 dark:text-stone-400 text-xs flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#173D32] dark:text-[#B18A4A] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                Institutional Privacy Protocol
              </span>
              <p className="leading-relaxed">
                Applicant information is held in strict confidence by the Executive Secretariat and used solely for admissions vetting in accordance with university data governance policies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
