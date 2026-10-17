/**
 * @file src/app/(public)/resources/page.tsx
 * @route /resources
 * @description Arabic Learning Resource Center and Academic Materials Hub.
 * 
 * ARCHITECTURE & ROLE:
 * - Curated classical Arabic linguistic guides, grammar cheat sheets (Nahw & Sarf),
 *   rhetorical manuals (Balaghah), and vocabulary reference lists.
 * - Queries `getPublicLearningResources({ category, level })`.
 * - Meets Requirement SPEC-RES-01 through SPEC-RES-04.
 */

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button } from "@/components/ui";
import { getPublicLearningResources } from "@/lib/db/queries";
import { BookOpen, Download, FileText, ExternalLink, BookmarkCheck } from "lucide-react";

export const revalidate = 60;

interface ResourcesPageProps {
  searchParams: Promise<{ category?: string; level?: string }>;
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const { category, level } = await searchParams;

  const { data: resources = [] } = await getPublicLearningResources({
    category: category || undefined,
    skillLevel: level || undefined,
    limit: 30,
  }).catch(() => ({ data: [] }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Learning Resources", href: "/resources" },
  ];

  const categories = [
    { label: "All Subjects", value: "" },
    { label: "Grammar & Syntax (النحو)", value: "grammar" },
    { label: "Morphology (الصرف)", value: "morphology" },
    { label: "Rhetoric & Eloquence (البلاغة)", value: "rhetoric" },
    { label: "Vocabulary & Lexicon (المفردات)", value: "vocabulary" },
    { label: "Classical Literature (الأدب العربي)", value: "literature" },
  ];

  return (
    <div>
      <PageHeader
        title="Arabic Learning Resource Center"
        titleAr="مركز الموارد التعليمية واللغوية"
        description="Comprehensive pedagogical references, classical grammatical treatises, syntax charts, and vocabulary compendiums for students of Arabic."
        badge="Academic Repository"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-[var(--border-color)]">
          {categories.map((c) => {
            const isSelected = (category || "") === c.value;
            return (
              <Link
                key={c.value}
                href={c.value ? `/resources?category=${c.value}` : "/resources"}
                className={`px-4 py-2 rounded-[5px] text-xs font-semibold tracking-wide transition-all border ${
                  isSelected
                    ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
                    : "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand-accent)]"
                }`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        {/* Resources Grid */}
        {resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => (
              <Card key={res.id} hoverElevate className="border-[var(--border-color)] flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent" size="sm">
                      {res.category || "General"}
                    </Badge>
                    {res.skillLevel && (
                      <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                        {res.skillLevel} Level
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
                    {res.contentEn || "Educational pedagogical guide prepared by academic club tutors."}
                  </p>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="uppercase text-[10px] font-mono">Curated Material</span>
                    <span>Downloads: {res.downloadCount || 0}</span>
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
                      Download Material
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Resources Available in this Category"
            description="The academic curriculum council is digitizing additional texts and syntax sheets. Please select another subject or view all resources."
            actionLabel="Reset Category Filter"
            actionHref="/resources"
          />
        )}
      </div>
    </div>
  );
}
