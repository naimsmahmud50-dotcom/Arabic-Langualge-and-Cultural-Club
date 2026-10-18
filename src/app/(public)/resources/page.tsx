/**
 * @file src/app/(public)/resources/page.tsx
 * @route /resources
 * @description Arabic Learning Resource Center and Academic Materials Repository.
 * 
 * ARCHITECTURE & ROLE:
 * - Curated classical Arabic linguistic guides, grammar cheat sheets (Nahw & Sarf),
 *   rhetorical manuals (Balaghah), vocabulary reference lists, and guided reading treatises.
 * - Multi-criteria filtering by Subject Category, Skill Level (Beginner/Intermediate/Advanced),
 *   and full-text search.
 * - Queries `getPublicLearningResources({ category, skillLevel, search, page, limit })`.
 * - Meets Requirement REQ-PUB-11 and SPEC-RES-01 through SPEC-RES-04.
 * 
 * DESIGN TOKENS & CONSTRAINTS:
 * - Primary: #173D32 (Forest Green)
 * - Accent: #B18A4A (Antique Brass)
 * - Anti-Emoji: Strictly clean Lucide SVG icons.
 * - Arabic Typography: Authentic diacritic rendering and font hierarchy.
 */

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button } from "@/components/ui";
import { getPublicLearningResources } from "@/lib/db/queries";
import { 
  BookOpen, 
  Download, 
  FileText, 
  Search, 
  Filter, 
  GraduationCap, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  BookmarkCheck
} from "lucide-react";

export const revalidate = 60;

interface ResourcesPageProps {
  searchParams: Promise<{ category?: string; level?: string; q?: string; page?: string }>;
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const { category, level, q, page } = await searchParams;
  const activeCategory = category || "";
  const activeLevel = level || "";
  const searchQuery = q || "";
  const currentPage = Math.max(1, parseInt(page || "1", 10));

  const { data: resources = [], pagination } = await getPublicLearningResources({
    category: activeCategory || undefined,
    skillLevel: activeLevel || undefined,
    search: searchQuery || undefined,
    page: currentPage,
    limit: 9,
  }).catch(() => ({ data: [], pagination: { page: 1, limit: 9, total: 0, totalPages: 1 } }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Learning Resources", href: "/resources" },
  ];

  const categories = [
    { label: "All Subjects", value: "" },
    { label: "Grammar & Syntax (النحو)", value: "grammar" },
    { label: "Morphology (الصرف)", value: "morphology" },
    { label: "Rhetoric (البلاغة)", value: "rhetoric" },
    { label: "Vocabulary (المفردات)", value: "vocabulary" },
    { label: "Classical Literature (الأدب)", value: "literature" },
    { label: "Guided Reading (القراءة)", value: "reading" },
  ];

  const skillLevels = [
    { label: "All Levels", value: "" },
    { label: "Beginner (مبتدئ)", value: "beginner" },
    { label: "Intermediate (متوسط)", value: "intermediate" },
    { label: "Advanced (متقدم)", value: "advanced" },
  ];

  const buildFilterUrl = (newParams: { category?: string; level?: string; q?: string; page?: string }) => {
    const params = new URLSearchParams();
    const cat = newParams.category !== undefined ? newParams.category : activeCategory;
    const lvl = newParams.level !== undefined ? newParams.level : activeLevel;
    const query = newParams.q !== undefined ? newParams.q : searchQuery;
    const p = newParams.page !== undefined ? newParams.page : "1";

    if (cat) params.set("category", cat);
    if (lvl) params.set("level", lvl);
    if (query) params.set("q", query);
    if (p && p !== "1") params.set("page", p);

    const qs = params.toString();
    return `/resources${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Header */}
      <PageHeader
        title="Arabic Learning Resource Center"
        titleAr="مركز الموارد التعليمية واللغوية"
        description="Comprehensive pedagogical treatises, classical grammatical syntax charts, morphological paradigms, vocabulary lexicons, and guided reading texts."
        badge="Academic Repository"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 2. Filter & Search Controls */}
        <div className="bg-[var(--bg-surface)] p-6 rounded-[8px] border border-[var(--border-color)] space-y-5">
          {/* Top Row: Search & Active Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
              <Filter className="w-4 h-4" />
              <span>Pedagogical Filter Matrix</span>
            </div>

            <form method="GET" action="/resources" className="relative w-full md:w-80">
              {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
              {activeLevel && <input type="hidden" name="level" value={activeLevel} />}
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search syntax guides, roots..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-[5px] bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)]"
              />
            </form>
          </div>

          {/* Subject Category Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wide">
              Subject Category:
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const isSelected = activeCategory === c.value;
                return (
                  <Link
                    key={c.value}
                    href={buildFilterUrl({ category: c.value, page: "1" })}
                    className={`px-3.5 py-1.5 rounded-[5px] text-xs font-semibold tracking-wide transition-all border ${
                      isSelected
                        ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm"
                        : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand-accent)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {c.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Skill Level Pills */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wide">
              Proficiency Tier:
            </span>
            <div className="flex flex-wrap gap-2">
              {skillLevels.map((lvl) => {
                const isSelected = activeLevel === lvl.value;
                return (
                  <Link
                    key={lvl.value}
                    href={buildFilterUrl({ level: lvl.value, page: "1" })}
                    className={`px-3 py-1 rounded-[5px] text-xs font-medium tracking-wide transition-all border ${
                      isSelected
                        ? "bg-[var(--brand-accent)] text-white border-[var(--brand-accent)]"
                        : "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {lvl.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(searchQuery || activeCategory || activeLevel) && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2">
                <span>Active filters:</span>
                {activeCategory && <Badge variant="neutral" size="sm" className="capitalize">{activeCategory}</Badge>}
                {activeLevel && <Badge variant="accent" size="sm" className="capitalize">{activeLevel} level</Badge>}
                {searchQuery && <span className="font-mono text-[var(--text-primary)]">"{searchQuery}"</span>}
              </div>
              <Link href="/resources" className="text-[var(--brand-accent)] hover:underline font-medium">
                Reset All Filters
              </Link>
            </div>
          )}
        </div>

        {/* 3. Resources Grid */}
        <section className="space-y-6">
          {resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((res) => {
                const levelVariant = 
                  res.skillLevel === "beginner" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/40" :
                  res.skillLevel === "intermediate" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/40" :
                  "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300/40";

                return (
                  <Card key={res.id} hoverElevate className="border-[var(--border-color)] flex flex-col justify-between">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="accent" size="sm" className="capitalize">
                          {res.category || "General"}
                        </Badge>
                        {res.skillLevel && (
                          <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-[4px] border ${levelVariant}`}>
                            {res.skillLevel}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                          {res.titleEn}
                        </h3>
                        {res.titleAr && (
                          <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                            {res.titleAr}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                        {res.contentEn || "Comprehensive academic guide compiled by departmental tutors."}
                      </p>

                      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span className="uppercase text-[10px] font-mono">Curated PDF Document</span>
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <BookmarkCheck className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                          <span>{res.downloadCount || 0} Downloads</span>
                        </div>
                      </div>
                    </CardContent>

                    <div className="p-6 pt-0">
                      <a
                        href={res.fileUrl || "#"}
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
                          <span>Download Material</span>
                        </Button>
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No Educational Resources Found"
              description={searchQuery || activeCategory || activeLevel
                ? "No published materials match your specific filter criteria. Please try resetting your search or selecting another category."
                : "The academic curriculum council is digitizing additional texts and syntax sheets. Please return shortly."
              }
              actionLabel="Clear All Filters"
              actionHref="/resources"
            />
          )}
        </section>

        {/* 4. Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-[var(--border-color)]">
            <Link
              href={buildFilterUrl({ page: String(Math.max(1, currentPage - 1)) })}
              className={`p-2 rounded border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors ${
                currentPage <= 1 ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <span className="text-xs font-mono text-[var(--text-secondary)] px-3">
              Page {currentPage} of {pagination.totalPages}
            </span>

            <Link
              href={buildFilterUrl({ page: String(Math.min(pagination.totalPages, currentPage + 1)) })}
              className={`p-2 rounded border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors ${
                currentPage >= pagination.totalPages ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 5. Institutional Pedagogical Note */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[6px] p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wide text-[var(--brand-accent)]">
            <GraduationCap className="w-4 h-4 text-[var(--brand-accent)]" />
            <span>Curriculum & Copyright Governance</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            All educational compendiums, syntax cheat sheets, and morphological paradigms are authenticated by the Arabic Language & Cultural Club's Academic Council. Materials are distributed exclusively for personal scholarly study, non-commercial education, and campus learning circles in compliance with intellectual property standards.
          </p>
        </div>
      </div>
    </div>
  );
}
