/**
 * @file src/app/(public)/news/page.tsx
 * @route /news
 * @description Official Institutional Gazettes, Announcements, and Bulletins.
 * 
 * ARCHITECTURE & ROLE:
 * - Public notices from the executive council, administrative decrees, election notifications,
 *   symposia communiqués, and academic press releases.
 * - Queries `getPublicAnnouncements({ category, search, page, limit })`.
 * - Strictly enforces isPublished === true and status === 'published'.
 * - Meets Requirement REQ-PUB-14 and SPEC-NWS-01 through SPEC-NWS-04.
 * 
 * DESIGN TOKENS & CONSTRAINTS:
 * - Primary: #173D32 (Forest Green)
 * - Accent: #B18A4A (Antique Brass)
 * - Dark Surface: #17211D (Midnight Evergreen)
 * - Light Surface: #F5F0E5 (Warm Ivory)
 * - Anti-Emoji: Strictly clean Lucide SVG icons. Zero cheesy AI emojis.
 */

import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button } from "@/components/ui";
import { getPublicAnnouncements } from "@/lib/db/queries";
import { 
  Bell, 
  Calendar, 
  Pin, 
  Search, 
  ArrowRight, 
  User, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  FileText
} from "lucide-react";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gazettes, Bulletins & Notices | Arabic Language & Cultural Club",
  description: "Official notices from the executive council, administrative decrees, election notifications, symposia communiqués, and academic press releases.",
  openGraph: {
    title: "Gazettes, Bulletins & Notices — Arabic Language & Cultural Club",
    description: "Read official announcements and academic press releases from the Arabic Language & Cultural Club.",
    url: "/news",
  },
  alternates: {
    canonical: "/news",
  },
};

interface NewsPageProps {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const { category, q, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const activeCategory = category || "";
  const searchQuery = q || "";

  const { data: announcements = [], pagination } = await getPublicAnnouncements({
    category: activeCategory || undefined,
    search: searchQuery || undefined,
    page: currentPage,
    limit: 9,
  }).catch(() => ({ data: [], pagination: { page: 1, limit: 9, total: 0, totalPages: 1 } }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "News & Bulletins", href: "/news" },
  ];

  const categories = [
    { label: "All Bulletins", value: "" },
    { label: "Official Notices", value: "notice" },
    { label: "Club News", value: "news" },
    { label: "Press Releases", value: "press" },
    { label: "Academic Gazettes", value: "academic" },
  ];

  // Separate pinned announcements from standard stream on page 1
  const pinnedAnnouncements = currentPage === 1 && !searchQuery && !activeCategory
    ? announcements.filter(a => a.isPinned)
    : [];
  const regularAnnouncements = announcements.filter(a => !pinnedAnnouncements.some(p => p.id === a.id));

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Header */}
      <PageHeader
        title="Official News & Announcements"
        titleAr="الإعلانات الرسمية والبيانات الدورية"
        description="Official communiqués from the Executive Committee, administrative decrees, election notifications, research calls, and varsity circulars."
        badge="Official Gazettes"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* 2. Filter Bar & Search */}
        <div className="bg-[var(--bg-surface)] p-4 sm:p-6 rounded-[8px] border border-[var(--border-color)] space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const isSelected = activeCategory === c.value;
                const targetUrl = `/news?${new URLSearchParams({
                  ...(c.value ? { category: c.value } : {}),
                  ...(searchQuery ? { q: searchQuery } : {}),
                }).toString()}`;

                return (
                  <Link
                    key={c.value}
                    href={targetUrl}
                    className={`px-3.5 py-1.5 rounded-[5px] text-xs font-semibold tracking-wide transition-all border min-h-[36px] flex items-center ${
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

            {/* Search Input */}
            <form method="GET" action="/news" className="relative w-full md:w-72">
              {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search circulars..."
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-[5px] bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-accent)] min-h-[44px]"
              />
            </form>
          </div>

          {searchQuery && (
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
              <span>
                Search results for: <strong className="text-[var(--text-primary)]">"{searchQuery}"</strong>
              </span>
              <Link href={`/news${activeCategory ? `?category=${activeCategory}` : ""}`} className="text-[var(--brand-accent)] hover:underline font-medium">
                Clear Search
              </Link>
            </div>
          )}
        </div>

        {/* 3. Pinned Notices Spotlight */}
        {pinnedAnnouncements.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[var(--brand-accent)]">
              <Pin className="w-4 h-4" />
              <span>Priority Executive Notices</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pinnedAnnouncements.map((item) => (
                <Card
                  key={item.id}
                  hoverElevate
                  className="border-2 border-[var(--brand-accent)]/40 bg-[var(--bg-surface-elevated)] flex flex-col justify-between"
                >
                  <CardContent className="p-6 sm:p-8 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="accent" size="sm" className="gap-1 font-mono uppercase">
                          <Pin className="w-3 h-3 text-[var(--brand-accent)]" />
                          Pinned Notice
                        </Badge>
                        <Badge variant="neutral" size="sm" className="capitalize">
                          {item.category || "Notice"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
                        <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        <span>{new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight">
                        {item.titleEn}
                      </h3>
                      {item.titleAr && (
                        <p className="font-arabic text-base text-[var(--brand-accent)] font-semibold" dir="rtl">
                          {item.titleAr}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                      {item.summaryEn || item.contentEn}
                    </p>

                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                        <span>{item.authorName || "Executive Secretariat"}</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase text-[var(--brand-accent)]">Authenticated Circular</span>
                    </div>
                  </CardContent>

                  <div className="p-4 sm:p-6 pt-0">
                    <Link href={`/news/${item.slug}`} className="w-full block">
                      <Button variant="primary" size="sm" className="w-full justify-between min-h-[44px]" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        <span>Read Full Official Dossier</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 4. Regular News Stream */}
        <section className="space-y-6">
          {pinnedAnnouncements.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
              <FileText className="w-4 h-4 text-[var(--brand-accent)]" />
              <span>Chronological Gazette Stream</span>
            </div>
          )}

          {regularAnnouncements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {regularAnnouncements.map((item) => (
                <Card
                  key={item.id}
                  hoverElevate
                  className="border-[var(--border-color)] flex flex-col justify-between"
                >
                  <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant={item.category === "notice" ? "accent" : "neutral"} size="sm" className="capitalize">
                        {item.category || "Official Notice"}
                      </Badge>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)]">
                        <Calendar className="w-3 h-3 text-[var(--brand-accent)]" />
                        <span>{new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight line-clamp-2">
                        {item.titleEn}
                      </h3>
                      {item.titleAr && (
                        <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold truncate" dir="rtl">
                          {item.titleAr}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                      {item.summaryEn || item.contentEn}
                    </p>

                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span className="truncate max-w-[180px]">By {item.authorName || "General Secretariat"}</span>
                      <span className="font-mono text-[10px] uppercase">Ref: Gazette</span>
                    </div>
                  </CardContent>

                  <div className="p-4 sm:p-6 pt-0">
                    <Link href={`/news/${item.slug}`} className="w-full block">
                      <Button variant="outline" size="sm" className="w-full justify-between min-h-[44px]" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                        <span>Read Circular</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title={searchQuery ? "No Bulletins Match Your Query" : "No Active Bulletins"}
              description={searchQuery 
                ? "Try searching for a different keyword or resetting the category filter." 
                : "All official executive announcements are current. New bulletins from the general secretariat will be published here."
              }
              actionLabel={searchQuery ? "Reset Search" : "Return to Homepage"}
              actionHref={searchQuery ? "/news" : "/"}
            />
          )}
        </section>

        {/* 5. Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-[var(--border-color)]">
            <Link
              href={`/news?${new URLSearchParams({
                ...(activeCategory ? { category: activeCategory } : {}),
                ...(searchQuery ? { q: searchQuery } : {}),
                page: String(Math.max(1, currentPage - 1)),
              }).toString()}`}
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
              href={`/news?${new URLSearchParams({
                ...(activeCategory ? { category: activeCategory } : {}),
                ...(searchQuery ? { q: searchQuery } : {}),
                page: String(Math.min(pagination.totalPages, currentPage + 1)),
              }).toString()}`}
              className={`p-2 rounded border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] transition-colors ${
                currentPage >= pagination.totalPages ? "pointer-events-none opacity-40" : ""
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
