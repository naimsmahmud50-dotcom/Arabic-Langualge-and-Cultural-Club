/**
 * @file src/app/(public)/publications/page.tsx
 * @route /publications
 * @description Academic Publications, Literary Reviews, and Competitive Roll of Honor.
 * 
 * ARCHITECTURE & ROLE:
 * - Showcases official magazines (such as "Al-Bayan"), quarterly bulletins, annual reports,
 *   and verified tournament achievements with distinction citations.
 * - Queries `getPublicPublications({ type, search })` and `getPublicAchievements({ category })`.
 * - Strictly isolates unpublished draft publications and unverified trophies.
 * - Meets Requirement REQ-PUB-12 and SPEC-PUB-01 through SPEC-PUB-04 and SPEC-ACH-01.
 * 
 * DESIGN TOKENS & CONSTRAINTS:
 * - Primary: #173D32 (Forest Green)
 * - Accent: #B18A4A (Antique Brass)
 * - Anti-Emoji: Strictly clean Lucide SVG icons. Zero cheesy AI emojis.
 */

import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button } from "@/components/ui";
import { getPublicPublications, getPublicAchievements } from "@/lib/db/queries";
import { 
  BookOpen, 
  Award, 
  Download, 
  Calendar, 
  FileText, 
  GraduationCap, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Search
} from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Publications & Roll of Honor | Arabic Language & Cultural Club",
  description: "Official periodicals, literary magazines (Al-Bayan), scholarly monographs, and distinction awards earned by club fellows in regional and international tournaments.",
  openGraph: {
    title: "Publications & Roll of Honor — Arabic Language & Cultural Club",
    description: "Read official magazines, academic treatises, and explore the institutional roll of honor.",
    url: "/publications",
  },
  alternates: {
    canonical: "/publications",
  },
  twitter: {
    card: "summary_large_image",
    title: "Publications & Roll of Honor — Arabic Language & Cultural Club",
    description: "Read official magazines, academic treatises, and explore the institutional roll of honor.",
  },
};

interface PublicationsPageProps {
  searchParams: Promise<{ type?: string; achievementCategory?: string; q?: string }>;
}

export default async function PublicationsPage({ searchParams }: PublicationsPageProps) {
  const { type, achievementCategory, q } = await searchParams;
  const activeType = type || "";
  const activeAchCategory = achievementCategory || "";
  const searchQuery = q || "";

  const [publications, achievements] = await Promise.all([
    getPublicPublications({
      type: activeType || undefined,
      search: searchQuery || undefined,
    }).catch(() => []),
    getPublicAchievements({ category: activeAchCategory || undefined }).catch(() => []),
  ]);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Publications & Honors", href: "/publications" },
  ];

  const publicationTypes = [
    { label: "All Press Issues", value: "" },
    { label: "Literary Magazines", value: "magazine" },
    { label: "Quarterly Bulletins", value: "newsletter" },
    { label: "Annual Governance Reports", value: "report" },
  ];

  const achievementCategories = [
    { label: "All Distinctions", value: "" },
    { label: "Competitive Tournaments", value: "competition" },
    { label: "Academic Commendations", value: "academic" },
    { label: "Institutional Citations", value: "institutional" },
  ];

  return (
    <div className="space-y-14 pb-20">
      {/* 1. Header */}
      <PageHeader
        title="Publications & Institutional Honors"
        titleAr="المطبوعات الدورية والجوائز الشرفية"
        description="Peer-reviewed literary reviews, quarterly bulletins, annual governance reports, and verified tournament debate championships."
        badge="Academic Press & Roll of Honor"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-16">
        {/* 2. Official Publications Section */}
        <section aria-labelledby="publications-heading" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--brand-accent)]" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
                  Archival Press Repository
                </span>
              </div>
              <h2 id="publications-heading" className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Club Magazines & Official Periodicals
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Verified editions authenticated by the Editorial Board and Academic Council.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Publication Text Search */}
              <form method="GET" action="/publications" className="relative w-full sm:w-64">
                {activeType && <input type="hidden" name="type" value={activeType} />}
                {activeAchCategory && <input type="hidden" name="achievementCategory" value={activeAchCategory} />}
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={searchQuery}
                  placeholder="Search articles, monographs..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-[5px] bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] min-h-[44px]"
                />
              </form>

              {/* Publication Type Filters */}
              <div className="flex flex-wrap gap-2">
                {publicationTypes.map((t) => {
                  const isSelected = activeType === t.value;
                  const url = `/publications?${new URLSearchParams({
                    ...(t.value ? { type: t.value } : {}),
                    ...(activeAchCategory ? { achievementCategory: activeAchCategory } : {}),
                    ...(searchQuery ? { q: searchQuery } : {}),
                  }).toString()}`;

                  return (
                    <Link
                      key={t.value}
                      href={url}
                      prefetch={false}
                      className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold tracking-wide transition-all border min-h-[36px] flex items-center ${
                        isSelected
                          ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm"
                          : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand-accent)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      {t.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {publications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {publications.map((pub) => (
                <Card key={pub.id} hoverElevate className="border-[var(--border-color)] flex flex-col justify-between">
                  <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="accent" size="sm" className="capitalize">
                        {pub.publicationType || "Journal"}
                      </Badge>
                      {pub.publicationDate && (
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          {new Date(pub.publicationDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-tight">
                        {pub.titleEn}
                      </h3>
                      {pub.titleAr && (
                        <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                          {pub.titleAr}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                      {pub.descriptionEn || "Complete publication archive authenticated by the press and editorial board."}
                    </p>

                    {pub.issueNo && (
                      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                        <span>Issue Ref: {pub.issueNo}</span>
                        <span className="uppercase text-[10px] text-[var(--brand-accent)]">Verified Edition</span>
                      </div>
                    )}
                  </CardContent>

                  <div className="p-4 sm:p-6 pt-0 flex items-center gap-2">
                    <a
                      href={pub.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 block"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between min-h-[44px]"
                        rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                      >
                        <span>Preview Issue</span>
                      </Button>
                    </a>
                    <a
                      href={pub.fileUrl}
                      download
                      className="shrink-0"
                      aria-label={`Download ${pub.titleEn}`}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-[var(--brand-accent)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)]"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Publications in Selected Category"
              description="Editorial issues in this category are currently undergoing archival cataloging. Please select another category or view all periodicals."
              actionLabel="Show All Press Issues"
              actionHref="/publications"
            />
          )}
        </section>

        {/* 3. Competitive Distinctions & Roll of Honor Section */}
        <section aria-labelledby="achievements-heading" className="space-y-6 pt-10 border-t border-[var(--border-color)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[var(--border-color)] pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--brand-accent)]" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
                  Institutional Roll of Honor
                </span>
              </div>
              <h2 id="achievements-heading" className="text-2xl font-bold text-[var(--text-primary)]">
                Championships & Academic Distinctions
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Verified institutional accolades won by varsity debate delegations, orators, and calligraphic fellows.
              </p>
            </div>

            {/* Achievement Category Filters */}
            <div className="flex flex-wrap gap-2">
              {achievementCategories.map((achCat) => {
                const isSelected = activeAchCategory === achCat.value;
                const url = `/publications?${new URLSearchParams({
                  ...(activeType ? { type: activeType } : {}),
                  ...(achCat.value ? { achievementCategory: achCat.value } : {}),
                }).toString()}`;

                return (
                  <Link
                    key={achCat.value}
                    href={url}
                    prefetch={false}
                    className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold tracking-wide transition-all border min-h-[36px] flex items-center ${
                      isSelected
                        ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm"
                        : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand-accent)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {achCat.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {achievements.map((ach) => (
                <Card key={ach.id} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col justify-between">
                  <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[6px] bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] flex items-center justify-center shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <Badge variant="neutral" size="sm" className="capitalize">
                          {ach.category || "Competitive Distinction"}
                        </Badge>
                      </div>

                      <span className="text-xs font-mono font-semibold text-[var(--brand-accent)]">
                        {ach.dateAchieved ? new Date(ach.dateAchieved).getFullYear().toString() : "Honors"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                        {ach.titleEn}
                      </h3>
                      {ach.titleAr && (
                        <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                          {ach.titleAr}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                      {ach.descriptionEn}
                    </p>

                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
                      <span>Conferred: {ach.dateAchieved || "Verified Record"}</span>
                      <span className="text-[var(--brand-accent)] font-bold">Authenticated</span>
                    </div>
                  </CardContent>

                  {ach.certificateUrl && (
                    <div className="p-4 sm:p-6 pt-0">
                      <a
                        href={ach.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block"
                      >
                        <Button variant="outline" size="sm" className="w-full justify-between min-h-[44px]" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          <span>Inspect Verified Citation</span>
                        </Button>
                      </a>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-[6px] border border-dashed border-[var(--border-color)] text-center max-w-lg mx-auto">
              <Award className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Historical Honors Registry</h4>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Records of past inter-university tournament trophies in this category are being cataloged by the secretariat.
              </p>
            </div>
          )}
        </section>

        {/* 4. Archival Certification Protocol Note */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[6px] p-4 sm:p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wide text-[var(--brand-accent)]">
            <ShieldCheck className="w-4 h-4 text-[var(--brand-accent)]" />
            <span>Honors Verification & Editorial Protocol</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            In accordance with Article 8 of the Club Constitution, every competitive distinction, debate trophy, and student research journal published under the institutional masthead must undergo formal authentication by the Academic Committee. Fictional accolades or unverified claims are strictly prohibited from this permanent public register.
          </p>
        </div>
      </div>
    </div>
  );
}
