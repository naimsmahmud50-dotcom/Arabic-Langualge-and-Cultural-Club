/**
 * ==============================================================================
 * PAGE COMPONENT: Executive Leadership & Historical Committees Archive
 * ==============================================================================
 * @file src/app/(public)/leadership/page.tsx
 * @route /leadership
 * @access Public
 * @cms_source Database tables: `committee_terms`, `committee_assignments`, `members`
 * 
 * DEVELOPER ONBOARDING NOTE:
 * ------------------------------------------------------------------------------
 * This page fulfills one of the core constitutional principles of the club:
 * "Permanent Historical Preservation".
 * 
 * CORE ARCHITECTURAL RULES:
 * 1. Historical Term Preservation: Past committees (e.g. 2022–23, 2023–24) are
 *    PERMANENTLY preserved. New leadership transitions create new terms rather
 *    than overwriting past records.
 * 2. Multi-Term Officeholder Support: The schema and UI dynamically surface members
 *    who have served across multiple academic terms (e.g., General Secretary in 2022,
 *    Cultural Secretary in 2023, President in 2024).
 * 3. Privacy Projection: Committee queries strictly omit personal telephone numbers,
 *    private emails, and student IDs.
 * 4. Elegant Neutral Avatar Fallback: Missing portraits render dignified monogram
 *    badges with Antique Brass borders.
 * ------------------------------------------------------------------------------
 */

import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button, HeritageDivider } from "@/components/ui";
import { 
  getCommitteeTerms, 
  getCommitteeMembersByTerm, 
  getMembersCommitteeHistoryBatch 
} from "@/lib/db/queries";
import { 
  Shield, 
  Users, 
  Award, 
  Calendar, 
  CheckCircle2, 
  History, 
  BookOpen, 
  ArrowRight,
  Sparkles
} from "lucide-react";

export const revalidate = 60; // Incremental Static Regeneration every 60s

export const metadata: Metadata = {
  title: "Executive Leadership & Historical Committees | Arabic Language & Cultural Club",
  description: "Preserving the permanent roll of honor for all past and present governing councils and committee officeholders of the Arabic Language & Cultural Club.",
  openGraph: {
    title: "Leadership & Committees Archive — Arabic Language & Cultural Club",
    description: "Inspect active leadership councils and browse term-by-term historical committee records.",
  },
};

interface LeadershipPageProps {
  searchParams: Promise<{ term?: string }>;
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default async function LeadershipPage({ searchParams }: LeadershipPageProps) {
  const { term: termParam } = await searchParams;

  const terms = await getCommitteeTerms().catch(() => []);
  const currentTerm = terms.find((t) => t.isCurrent) || terms[0];
  const activeTerm = terms.find((t) => t.id === termParam) || currentTerm;

  // Fetch committee officers for the selected term
  const rawMembers = activeTerm 
    ? await getCommitteeMembersByTerm(activeTerm.id).catch(() => []) 
    : [];

  // Single batched query for multi-term service history across all members
  const memberIds = rawMembers.map((m) => m.memberId);
  const allHistories = memberIds.length > 0
    ? await getMembersCommitteeHistoryBatch(memberIds).catch(() => [])
    : [];

  const historyByMember = new Map<string, string[]>();
  for (const h of allHistories) {
    if (!h.memberId) continue;
    const list = historyByMember.get(h.memberId) || [];
    if (h.academicYear) list.push(h.academicYear);
    historyByMember.set(h.memberId, list);
  }

  const membersWithHistory = rawMembers.map((m) => {
    const termsServed = historyByMember.get(m.memberId) || [];
    return {
      ...m,
      termsServed,
      totalTermsCount: termsServed.length,
    };
  });

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Leadership & Committees", href: "/leadership" },
  ];

  if (!activeTerm) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)]">
        <PageHeader
          title="Executive Leadership"
          titleAr="الهيئات الإدارية واللجان التنفيذية"
          description="Governing councils and committee records."
          badge="Archival Notice"
          breadcrumbs={breadcrumbs}
        />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <EmptyState
            icon={<History className="w-12 h-12 text-[var(--brand-accent)]" />}
            title="Committee Records Under Archival Compilation"
            description="The Archival Preservation Committee is preparing the executive council registry. Please check back shortly."
            actionLabel="Return to Founders Archive"
            actionHref="/founders"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      {/* 1. Header with Breadcrumbs & Heritage Subtitle */}
      <PageHeader
        title="Executive Leadership & Committee Archive"
        titleAr="الهيئات الإدارية الحالية والسابقة"
        description="Preserving the permanent roll of honor for all past and present governing councils. Under constitutional article IV, every administration remains an immutable part of club history."
        badge="Governance Archive"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12 lg:space-y-16">

        {/* 2. Term Switcher / Historical Navigation Toolbar */}
        <section className="bg-[var(--bg-surface)] p-4 sm:p-6 md:p-8 rounded-[8px] border border-[var(--border-color)] shadow-sm space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[var(--brand-accent)]">
                  Academic Term Selector
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  (Constitutional Term-by-Term Preservation)
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text-primary)] leading-tight">
                Browse Governing Councils
              </h2>
            </div>

            <Badge variant={activeTerm.isCurrent ? "primary" : "accent"} size="md" className="self-start sm:self-auto">
              {activeTerm.isCurrent ? "Active Governing Council (المجلس الحالي)" : "Historical Archive (سابق)"}
            </Badge>
          </div>

          {/* Academic Term Selection Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {terms.map((t) => {
              const isSelected = activeTerm?.id === t.id;
              return (
                <Link
                  key={t.id}
                  href={`/leadership?term=${t.id}`}
                  className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-[6px] text-xs font-semibold tracking-wide transition-all border flex items-center gap-2 shrink-0 whitespace-nowrap min-h-[44px] ${
                    isSelected
                      ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-xs"
                      : "bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand-accent)]"
                  }`}
                >
                  <span className="font-bold">{t.academicYear}</span>
                  <span className="opacity-80">— {t.titleEn}</span>
                  {t.isCurrent && (
                    <span className="px-1.5 py-0.5 rounded-[3px] bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                      Current
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Active Term Summary Card */}
          <div className="pt-4 border-t border-[var(--border-color)] grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">
                {activeTerm.titleEn}
              </h3>
              {activeTerm.titleAr && (
                <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                  {activeTerm.titleAr}
                </p>
              )}
              {activeTerm.summaryEn && (
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed pt-1">
                  {activeTerm.summaryEn}
                </p>
              )}
            </div>

            <div className="space-y-2 bg-[var(--bg-surface-elevated)] p-4 rounded-[6px] border border-[var(--border-color)] text-xs">
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>Term Duration:</span>
                <span className="font-mono text-[var(--text-primary)] font-medium">
                  {activeTerm.startDate} → {activeTerm.endDate || "Present"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>Roster Count:</span>
                <span className="font-bold text-[var(--brand-primary)]">
                  {membersWithHistory.length} Appointed Officers
                </span>
              </div>
              <div className="flex items-center justify-between text-[var(--text-muted)]">
                <span>Archival Integrity:</span>
                <span className="text-[var(--brand-accent)] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Preserved
                </span>
              </div>
            </div>
          </div>
        </section>

        <HeritageDivider />

        {/* 3. Executive Committee Officers Roster */}
        <section className="space-y-8" id="officers">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                Executive Council Appointments ({activeTerm.academicYear})
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Ranked according to institutional order of precedence.
              </p>
            </div>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Constitutional Order of Precedence
            </span>
          </div>

          {membersWithHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {membersWithHistory.map((officer, idx) => (
                <Card 
                  key={officer.assignmentId} 
                  hoverElevate 
                  className="border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden flex flex-col justify-between shadow-sm"
                >
                  <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {/* Header: Position Badge & Rank Precedence */}
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={officer.rankOrder <= 2 ? "primary" : "neutral"} size="sm">
                        {officer.positionTitleEn}
                      </Badge>
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        Rank #{officer.rankOrder}
                      </span>
                    </div>

                    {/* Officer Identity & Avatar */}
                    <div className="flex items-start gap-3.5 pt-1">
                      <div className="w-14 h-14 rounded-[8px] bg-[var(--bg-surface-elevated)] text-[var(--brand-primary)] flex items-center justify-center font-serif text-lg font-bold border-2 border-[var(--brand-accent)] shrink-0 shadow-xs">
                        {officer.photoUrl ? (
                          <img 
                            src={officer.photoUrl} 
                            alt={officer.fullNameEn} 
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover rounded-[6px]" 
                          />
                        ) : (
                          <span>{getInitials(officer.fullNameEn)}</span>
                        )}
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-base font-bold text-[var(--text-primary)] leading-tight truncate">
                          {officer.fullNameEn}
                        </h4>
                        {officer.fullNameAr && (
                          <p className="font-arabic text-xs text-[var(--brand-accent)] font-semibold" dir="rtl">
                            {officer.fullNameAr}
                          </p>
                        )}
                        {officer.positionTitleAr && (
                          <p className="font-arabic text-[11px] text-[var(--text-secondary)]" dir="rtl">
                            {officer.positionTitleAr}
                          </p>
                        )}
                        <p className="text-[10px] text-[var(--text-muted)] font-mono">
                          ID: {officer.membershipId}
                        </p>
                      </div>
                    </div>

                    {/* Role Description / Intellectual Mandate */}
                    {officer.roleDescription && (
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-2 border-t border-[var(--border-subtle)]">
                        {officer.roleDescription}
                      </p>
                    )}

                    {/* Multi-Term Service Badge (Demonstrates Multi-Term Service) */}
                    {officer.totalTermsCount > 1 && (
                      <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[var(--brand-accent)] font-medium">
                        <Award className="w-3.5 h-3.5 shrink-0" />
                        <span>Served {officer.totalTermsCount} Terms: {officer.termsServed.join(", ")}</span>
                      </div>
                    )}
                  </CardContent>

                  {/* Card Footer */}
                  <div className="px-6 py-3 bg-[var(--bg-surface-elevated)] border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                      Executive Office
                    </span>
                    <span className="font-medium text-[var(--brand-primary)]">
                      {activeTerm.academicYear}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={<Users className="w-10 h-10 text-[var(--brand-accent)]" />}
                title="Historical Roster Under Archival Transcription"
                description={`Officeholder records for term ${activeTerm.academicYear} are currently being transcribed from physical assembly archives.`}
              />
            </div>
          )}
        </section>

        {/* 4. Cross-Link Navigation Banner */}
        <section className="bg-[var(--bg-surface)] p-8 rounded-[8px] border border-[var(--border-color)] shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">
                Connect With Our Living Institution
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-xl">
                Every executive committee functions in tandem with our verified fellows. Browse our public member directory or explore founding conveners and historical milestones.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link href="/founders">
                <Button variant="outline" size="sm" leftIcon={<Users className="w-3.5 h-3.5" />}>
                  Founders Archive
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="outline" size="sm" leftIcon={<History className="w-3.5 h-3.5" />}>
                  Milestones Timeline
                </Button>
              </Link>
              <Link href="/members">
                <Button variant="accent" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Member Directory
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
