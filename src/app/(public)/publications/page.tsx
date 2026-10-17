/**
 * @file src/app/(public)/publications/page.tsx
 * @route /publications
 * @description Academic Publications, Literary Journals, and Competitive Honors.
 * 
 * ARCHITECTURE & ROLE:
 * - Showcases official magazines (such as "Al-Bayan"), scholarly collections,
 *   and oratorical/debate competition achievements.
 * - Queries `getPublicPublications()` and `getPublicAchievements()`.
 * - Meets Requirement SPEC-PUB-01 through SPEC-PUB-04 and SPEC-ACH-01.
 */

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button } from "@/components/ui";
import { getPublicPublications, getPublicAchievements } from "@/lib/db/queries";
import { BookOpen, Award, Download, Calendar, ExternalLink } from "lucide-react";

export const revalidate = 60;

export default async function PublicationsPage() {
  const [publications, achievements] = await Promise.all([
    getPublicPublications().catch(() => []),
    getPublicAchievements().catch(() => []),
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Publications & Honors", href: "/publications" },
  ];

  return (
    <div>
      <PageHeader
        title="Publications & Institutional Honors"
        titleAr="المطبوعات الدورية والجوائز الشرفية"
        description="Peer-reviewed student journals, quarterly Arabic bulletins, research essays, and regional oratorical tournament honors."
        badge="Academic Press"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        {/* Publications Section */}
        <section className="space-y-6">
          <div className="space-y-1">
            <Badge variant="accent" size="sm">Literary Journals</Badge>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Club Magazines & Official Bulletins
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Archival and current issues of official club publications available for open study.
            </p>
          </div>

          {publications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publications.map((pub) => (
                <Card key={pub.id} hoverElevate className="border-[var(--border-color)] flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="accent" size="sm">
                        {pub.publicationType || "Journal"}
                      </Badge>
                      {pub.publicationDate && (
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          {new Date(pub.publicationDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                        {pub.titleEn}
                      </h3>
                      {pub.titleAr && (
                        <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                          {pub.titleAr}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {pub.descriptionEn || "Complete publication archive authenticated by the press and editorial board."}
                    </p>

                    {pub.issueNo && (
                      <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-muted)]">
                        Issue Ref: {pub.issueNo}
                      </div>
                    )}
                  </CardContent>

                  <div className="p-6 pt-0">
                    <a
                      href={pub.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full block"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        rightIcon={<Download className="w-3.5 h-3.5" />}
                      >
                        Read / Download Issue
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Publication Archive Being Digitized"
              description="Editorial issues of the club magazine are currently undergoing OCR scanning and archival verification."
              actionLabel="Return Home"
              actionHref="/"
            />
          )}
        </section>

        {/* Competitive Achievements Section */}
        <section className="space-y-6 pt-8 border-t border-[var(--border-color)]">
          <div className="space-y-1">
            <Badge variant="neutral" size="sm">Roll of Honor</Badge>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Championships & Academic Distinctions
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Institutional awards won by club debate teams, orators, and calligraphers.
            </p>
          </div>

          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((ach) => (
                <Card key={ach.id} className="border-[var(--border-color)] bg-[var(--bg-surface)]">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] flex items-center justify-center shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-semibold text-[var(--brand-accent)]">
                          {ach.dateAchieved ? new Date(ach.dateAchieved).getFullYear().toString() : "Distinction"}
                        </span>
                        <h4 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                          {ach.titleEn}
                        </h4>
                      </div>
                    </div>

                    {ach.titleAr && (
                      <p className="font-arabic text-sm text-[var(--brand-accent)]" dir="rtl">
                        {ach.titleAr}
                      </p>
                    )}

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {ach.descriptionEn}
                    </p>

                    <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                      Honor Category: <strong className="text-[var(--text-primary)] capitalize">{ach.category || "Competitive Distinction"}</strong>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-[6px] border border-dashed border-[var(--border-color)] text-center max-w-lg mx-auto">
              <Award className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Historical Honors Registry</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Records of past inter-university tournament trophies are being cataloged by the secretariat.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
