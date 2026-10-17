/**
 * @file src/app/(public)/leadership/page.tsx
 * @route /leadership
 * @description Executive Leadership and Historical Committees Archive.
 * 
 * ARCHITECTURE & ROLE:
 * - Displays active governing committee and all former historical committee rosters.
 * - Crucial institutional rule: Historical committees are permanently preserved when a new
 *   executive council is appointed.
 * - Queries `getCommitteeTerms()` and `getCommitteeMembersByTerm(selectedTermId)`.
 * - Meets Requirement SPEC-LDR-01 through SPEC-LDR-06.
 * 
 * PRIVACY SAFEGUARDS:
 * - Committee member projections strictly omit private emails, phone numbers, and student IDs.
 */

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button } from "@/components/ui";
import { getCommitteeTerms, getCommitteeMembersByTerm } from "@/lib/db/queries";
import { Shield, Users, Award, Calendar, CheckCircle2 } from "lucide-react";

export const revalidate = 60;

interface LeadershipPageProps {
  searchParams: Promise<{ term?: string }>;
}

export default async function LeadershipPage({ searchParams }: LeadershipPageProps) {
  const { term: termParam } = await searchParams;
  
  const terms = await getCommitteeTerms().catch(() => []);
  const currentTerm = terms.find((t) => t.isCurrent) || terms[0];
  const activeTerm = terms.find((t) => t.id === termParam) || currentTerm;

  const members = activeTerm 
    ? await getCommitteeMembersByTerm(activeTerm.id).catch(() => []) 
    : [];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Leadership & Committees", href: "/leadership" },
  ];

  return (
    <div>
      <PageHeader
        title="Executive Leadership & Historical Committees"
        titleAr="الهيئات الإدارية الحالية والسابقة"
        description="Preserving the permanent roll of honor for all past and present governing councils of the Arabic Language & Cultural Club."
        badge="Governance Archive"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        {/* Term Switcher / Historical Navigation */}
        <div className="bg-[var(--bg-surface-elevated)] p-6 rounded-[6px] border border-[var(--border-color)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-sm uppercase tracking-wider font-bold text-[var(--brand-accent)]">
                Select Academic Term
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Switch between active governing leadership and former committee archives.
              </p>
            </div>
            {activeTerm && (
              <Badge variant={activeTerm.isCurrent ? "accent" : "neutral"} size="md">
                {activeTerm.isCurrent ? "Active Term (الحالي)" : "Historical Archive (سابق)"}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {terms.map((t) => {
              const isSelected = activeTerm?.id === t.id;
              return (
                <Link
                  key={t.id}
                  href={`/leadership?term=${t.id}`}
                  className={`px-4 py-2 rounded-[5px] text-xs font-semibold tracking-wide transition-all border ${
                    isSelected
                      ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-xs"
                      : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand-accent)]"
                  }`}
                >
                  <span className="font-bold">{t.academicYear}</span> — {t.titleEn}
                  {t.isCurrent && " (Current)"}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Active Selected Term Summary */}
        {activeTerm && (
          <div className="border-l-4 border-[var(--brand-accent)] pl-4 py-1 space-y-1">
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">
              {activeTerm.titleEn} ({activeTerm.academicYear})
            </h3>
            {activeTerm.titleAr && (
              <p className="font-arabic text-lg text-[var(--brand-accent)]" dir="rtl">
                {activeTerm.titleAr}
              </p>
            )}
            {activeTerm.summaryEn && (
              <p className="text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed pt-1">
                {activeTerm.summaryEn}
              </p>
            )}
          </div>
        )}

        {/* Committee Roster Grid */}
        {members.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((assignment) => (
              <Card key={assignment.assignmentId} hoverElevate className="border-[var(--border-color)]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    {/* Member Avatar */}
                    <div className="w-16 h-16 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-bold text-xl border border-[var(--border-color)] shrink-0">
                      {assignment.photoUrl ? (
                        <img
                          src={assignment.photoUrl}
                          alt={assignment.fullNameEn}
                          className="w-full h-full object-cover rounded-[6px]"
                        />
                      ) : (
                        assignment.fullNameEn.charAt(0)
                      )}
                    </div>

                    <div className="space-y-1">
                      <Badge variant="accent" size="sm">
                        {assignment.positionTitleEn}
                      </Badge>
                      <h4 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                        {assignment.fullNameEn}
                      </h4>
                      {assignment.fullNameAr && (
                        <p className="font-arabic text-xs text-[var(--brand-accent)] font-semibold" dir="rtl">
                          {assignment.fullNameAr}
                        </p>
                      )}
                    </div>
                  </div>

                  {assignment.positionTitleAr && (
                    <div className="font-arabic text-xs text-[var(--text-muted)] text-right" dir="rtl">
                      {assignment.positionTitleAr}
                    </div>
                  )}

                  {assignment.bioEn && (
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-2 border-t border-[var(--border-subtle)]">
                      {assignment.bioEn}
                    </p>
                  )}

                  <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">
                      Ref: {assignment.membershipId || "Active Fellow"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-semibold">
                      <Shield className="w-3 h-3" />
                      Executive Officer
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Committee Members Assigned to this Term"
            description="Official appointments for this academic term are being authenticated by the governance secretariat."
            actionLabel="Return to Current Leadership"
            actionHref="/leadership"
          />
        )}
      </div>
    </div>
  );
}
