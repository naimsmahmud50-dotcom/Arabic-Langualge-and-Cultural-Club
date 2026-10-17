/**
 * @file src/components/home/AchievementsSection.tsx
 * @description Club Accolades, Debate Trophies, and Official Publications Preview.
 * 
 * ARCHITECTURAL ROLE:
 * - Documents verified collegiate milestones and official club publications.
 * - Queries `getPublicAchievements()` and `getPublicPublications()`.
 * - Meets Requirement SPEC-HOM-09 and SPEC-PUB-01.
 * 
 * CONSTRAINTS:
 * - Zero fabricated achievements or fictitious accolades.
 * - Bilingual titles with issue details and archival records.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Trophy, Newspaper, ArrowRight, Award, ExternalLink, Calendar } from "lucide-react";

interface AchievementItem {
  id: string;
  titleEn: string;
  titleAr?: string | null;
  descriptionEn?: string | null;
  category: string;
  dateAchieved?: string | null;
  certificateUrl?: string | null;
}

interface PublicationItem {
  id: string;
  slug?: string;
  titleEn: string;
  titleAr?: string | null;
  publicationType: string;
  issueNo?: string | null;
  publicationDate?: string | null;
  descriptionEn?: string | null;
  coverImageUrl?: string | null;
  fileUrl?: string;
}

interface AchievementsSectionProps {
  achievements: AchievementItem[];
  publications: PublicationItem[];
}

export function AchievementsSection({ achievements, publications }: AchievementsSectionProps) {
  return (
    <section className="py-20 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-color)]" aria-label="Achievements and Publications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="accent" size="sm">Academic Distinction</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif">
              Honors, Collegiate Accolades & Publications
            </h2>
            <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
              الْإِنْجَازَاتُ وَالْمَنْشُورَاتُ الرَّسْمِيَّةُ • سِجِلُّ التَّمَيُّزِ وَالْإِصْدَارَاتِ الْأَدَبِيَّةِ
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Recognizing championship debate delegations, literary awards, and our flagship student journal of Arabic letters.
            </p>
          </div>
          <Link href="/publications">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Browse All Publications
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Official Publications Spotlight */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-5 h-5 text-[var(--brand-accent)]" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Official Club Journals & Bulletins
              </h3>
            </div>

            {publications.length > 0 ? (
              <div className="space-y-4">
                {publications.slice(0, 3).map((pub) => {
                  const dateDisplay = pub.publicationDate
                    ? new Date(pub.publicationDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
                    : "Archived Issue";

                  return (
                    <Card key={pub.id} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)]">
                      <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="accent" size="sm" className="capitalize">
                              {pub.publicationType}
                            </Badge>
                            {pub.issueNo && (
                              <span className="text-xs font-mono text-[var(--text-muted)]">
                                Issue #{pub.issueNo}
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-[var(--text-primary)]">
                            {pub.titleEn}
                          </h4>
                          {pub.titleAr && (
                            <p className="font-arabic text-xs text-[var(--brand-accent)] font-medium" dir="rtl">
                              {pub.titleAr}
                            </p>
                          )}
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                            {pub.descriptionEn || "Official institutional publication preserving student essays, poetry, and debate records."}
                          </p>
                        </div>

                        <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                          <span className="text-xs text-[var(--text-muted)] font-mono">
                            {dateDisplay}
                          </span>
                          <Link href="/publications">
                            <Button variant="outline" size="sm" className="text-xs py-1 px-3">
                              Read Issue
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[6px] bg-[var(--bg-surface)]">
                <Newspaper className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Next Journal Issue in Typesetting</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  The editorial committee is reviewing submissions for the forthcoming volume.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Collegiate Accolades & Trophies */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-[var(--brand-accent)]" />
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Accolades & Competition Honors
              </h3>
            </div>

            {achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.slice(0, 3).map((ach) => (
                  <Card key={ach.id} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)]">
                    <CardContent className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Badge variant="neutral" size="sm" className="font-mono text-[10px] capitalize">
                          {ach.category}
                        </Badge>
                        <Award className="w-4 h-4 text-[var(--brand-accent)]" />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                          {ach.titleEn}
                        </h4>
                        {ach.titleAr && (
                          <p className="font-arabic text-xs text-[var(--brand-accent)] font-medium mt-0.5" dir="rtl">
                            {ach.titleAr}
                          </p>
                        )}
                        {ach.dateAchieved && (
                          <div className="text-[11px] text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-mono mt-1">
                            {ach.dateAchieved}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                        {ach.descriptionEn || "Awarded for outstanding oratorical and academic distinction."}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[6px] bg-[var(--bg-surface)]">
                <Trophy className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Competition Accolades</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Verified tournament awards will be presented following adjudication.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
