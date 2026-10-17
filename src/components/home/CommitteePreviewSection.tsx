/**
 * @file src/components/home/CommitteePreviewSection.tsx
 * @description Current Committee & Governing Council Preview Section.
 * 
 * ARCHITECTURAL ROLE:
 * - Highlights current executive stewardship under the active academic term.
 * - Queries `getCommitteeTerms()` and `getCommitteeMembersByTerm()`.
 * - Preserves historical term accountability and links to archival records.
 * - Meets Requirement SPEC-HOM-04 and SPEC-COM-01.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Users2, ArrowRight, Shield, Award } from "lucide-react";

interface CommitteeMemberItem {
  assignmentId: string;
  positionTitleEn: string;
  positionTitleAr?: string | null;
  fullNameEn: string;
  fullNameAr?: string | null;
  roleDescription?: string | null;
  rankOrder: number;
}

interface CommitteePreviewSectionProps {
  termTitle?: string;
  academicYear?: string;
  officers: CommitteeMemberItem[];
}

export function CommitteePreviewSection({
  termTitle = "Governing Executive Council",
  academicYear = "2024–2025",
  officers,
}: CommitteePreviewSectionProps) {
  return (
    <section className="py-20 bg-[var(--bg-primary)] border-b border-[var(--border-color)]" aria-label="Current Committee Governance">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="accent" size="sm">Current Governance</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif">
              Executive Council & Committee ({academicYear})
            </h2>
            <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
              الْهَيْئَةُ الْإِدَارِيَّةُ الْحَالِيَّةُ • أَعْضَاءُ الْمَجْلِسِ التَّنْفِيذِيِّ لِلْعَامِ الْأَكَادِيمِيِّ
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Serving the academic term with democratic accountability, constitutional loyalty, and academic devotion to Arabic scholarship.
            </p>
          </div>
          <Link href="/leadership">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All Historical Committees
            </Button>
          </Link>
        </div>

        {officers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {officers.slice(0, 6).map((officer) => (
              <Card key={officer.assignmentId} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold text-sm">
                      {officer.fullNameEn.charAt(0)}
                    </div>
                    <Badge variant="neutral" size="sm">Rank #{officer.rankOrder}</Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {officer.fullNameEn}
                    </h3>
                    {officer.fullNameAr && (
                      <p className="font-arabic text-xs text-[var(--brand-accent)] font-medium mt-0.5" dir="rtl">
                        {officer.fullNameAr}
                      </p>
                    )}
                    <div className="text-xs font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)] mt-1.5 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 shrink-0" />
                      <span>{officer.positionTitleEn}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {officer.roleDescription || "Executive council member administering club initiatives and member welfare."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[6px] max-w-md mx-auto">
            <Users2 className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Committee Rosters Pending Update</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              The current term's executive assignments are being archived and ratified.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
