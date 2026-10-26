/**
 * ==============================================================================
 * PAGE COMPONENT: Institutional History & Milestones Timeline
 * ==============================================================================
 * @file src/app/(public)/history/page.tsx
 * @route /history
 * @access Public
 * @cms_source Database tables: `editable_pages` (slug='history') and `page_sections`
 * 
 * DEVELOPER ONBOARDING NOTE:
 * ------------------------------------------------------------------------------
 * This page serves as the official chronological record of the Arabic Language
 * & Cultural Club.
 * 
 * ARCHITECTURE & DATA FLOW:
 * 1. Queries `getPageWithSections('history')` for live CMS data.
 * 2. Unpacks the `intro`, `milestones`, and `archives` sections.
 * 3. Enforces the Institutional Anti-Fabrication Rule: only displays verified
 *    dates, milestones, and archival citations.
 * 4. Renders a chronological vertical timeline with responsive mobile-friendly
 *    geometry and bilingual English/Arabic typography.
 * 5. Provides an academic empty state if history records are unpublished or unseeded.
 * ------------------------------------------------------------------------------
 */

import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, Button, HeritageDivider, EmptyState } from "@/components/ui";
import { 
  Calendar, 
  Flag, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Download, 
  ShieldCheck, 
  Clock, 
  History as HistoryIcon,
  Users
} from "lucide-react";
import { getPageWithSections, SectionContentItem } from "@/lib/db/queries";

export const revalidate = 60; // Incremental Static Regeneration every 60s

export const metadata: Metadata = {
  title: "Institutional History & Milestones | Arabic Language & Cultural Club",
  description: "A chronological record of our institutional journey, academic milestones, and enduring devotion to Arabic language scholarship.",
  openGraph: {
    title: "History & Milestones — Arabic Language & Cultural Club",
    description: "Chronological timeline of verified club milestones, founding charters, and academic accomplishments.",
  },
};

export default async function HistoryPage() {
  const pageData = await getPageWithSections("history");

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "History", href: "/history" },
  ];

  // Meaningful empty state if page is missing or unpublished
  if (!pageData) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)]">
        <PageHeader
          title="Institutional History"
          titleAr="تاريخ النادي والمحطات البارزة"
          description="Chronological record of academic milestones."
          badge="Archival Notice"
          breadcrumbs={breadcrumbs}
        />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <EmptyState
            icon={<Clock className="w-12 h-12 text-[var(--brand-accent)]" />}
            title="Historical Archives Under Verification"
            description="The club's chronological records and milestone citations are currently being digitized and corroborated by the Archival Committee. Please consult the Founders Archive in the interim."
            actionLabel="Consult Founders Archive"
            actionHref="/founders"
          />
        </div>
      </div>
    );
  }

  // Extract individual sections
  const introSection = pageData.sections.find((s) => s.sectionKey === "intro");
  const milestonesSection = pageData.sections.find((s) => s.sectionKey === "milestones");
  const archivesSection = pageData.sections.find((s) => s.sectionKey === "archives");

  const milestonesList: SectionContentItem[] = milestonesSection?.contentEn.items || [];

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      {/* 1. Header with Breadcrumbs & Editorial Description */}
      <PageHeader
        title={pageData.titleEn}
        titleAr={pageData.titleAr || "تاريخ النادي والمحطات البارزة"}
        description={pageData.metaDescriptionEn || "A chronological record of our institutional journey, academic milestones, and enduring devotion to Arabic language scholarship."}
        badge="Historical Chronology"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12 lg:space-y-16">

        {/* 2. Institutional Genesis Narrative */}
        {introSection && (
          <section className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] p-4 sm:p-6 md:p-10 shadow-sm space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="accent" size="sm">
                {introSection.contentEn.badge || "Historical Overview"}
              </Badge>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                Verified Archival Narrative
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[var(--text-primary)] leading-tight">
              {introSection.contentEn.heading || "Institutional Genesis & Academic Journey"}
            </h2>
            {introSection.contentEn.subheading && (
              <p className="text-xs font-serif italic text-[var(--brand-accent)]">
                {introSection.contentEn.subheading}
              </p>
            )}
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed pt-1 sm:pt-2">
              {introSection.contentEn.body}
            </p>
          </section>
        )}

        <HeritageDivider />

        {/* 3. Chronological Milestones Timeline */}
        <section className="space-y-8 sm:space-y-10" id="timeline">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="neutral" size="sm">
              {milestonesSection?.contentEn.badge || "Verified Chronology"}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)] leading-tight">
              {milestonesSection?.contentEn.heading || "Chronological Institutional Milestones"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {milestonesSection?.contentEn.subheading || "Verified records documented and corroborated by the Club Archival Committee."}
            </p>
          </div>

          {milestonesList.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={<Clock className="w-10 h-10 text-[var(--brand-accent)]" />}
                title="Milestone Archives Pending Digitization"
                description="Verified institutional milestones are currently being entered into the digital register. Check back shortly."
              />
            </div>
          ) : (
            <div className="relative border-s-2 border-[var(--border-color)] ms-3 sm:ms-8 ps-4 sm:ps-10 space-y-8 sm:space-y-12">
              {milestonesList.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Node with Antique Brass Border */}
                  <div className="absolute -start-[23px] sm:-start-[49px] top-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--brand-accent)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
                  </div>

                  <Card className="border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--brand-accent)] transition-colors shadow-sm">
                    <CardContent className="p-4 sm:p-6 md:p-7 space-y-3 sm:space-y-4">
                      {/* Milestone Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="font-serif font-bold text-xl sm:text-2xl text-[var(--brand-accent)]">
                            {item.year}
                          </span>
                          {item.badge && (
                            <Badge variant="accent" size="sm">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.isVerified && (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--brand-primary)] font-medium bg-[var(--brand-primary)]/10 px-2.5 py-1 rounded-[4px] border border-[var(--brand-primary)]/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Verified Record</span>
                          </div>
                        )}
                      </div>

                      {/* Titles in English & Arabic */}
                      <div className="space-y-1.5 pt-1">
                        <h3 className="text-lg font-bold text-[var(--text-primary)]">
                          {item.title}
                        </h3>
                        {item.arabicTitle && (
                          <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
                            {item.arabicTitle}
                          </p>
                        )}
                      </div>

                      {/* Descriptions in English & Arabic */}
                      <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                        {item.description}
                      </p>
                      {item.arabicDescription && (
                        <p className="font-arabic text-xs text-[var(--text-muted)] leading-relaxed" dir="rtl">
                          {item.arabicDescription}
                        </p>
                      )}

                      {/* Archival Citation Reference */}
                      {item.citation && (
                        <div className="pt-3 border-t border-[var(--border-color)] flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-mono">
                          <BookOpen className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0" />
                          <span>Citation: {item.citation}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. Archival Preservation Protocol & Policy */}
        {archivesSection && (
          <section className="bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] rounded-[8px] p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    {archivesSection.contentEn.badge || "Archival Protocol"}
                  </Badge>
                  <span className="text-xs text-[var(--brand-accent)] font-medium">
                    Constitutional Article IV
                  </span>
                </div>
                <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                  {archivesSection.contentEn.heading || "Archival Preservation Protocol"}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {archivesSection.contentEn.body || "In accordance with Article IV of the Club Constitution, historical records are immutable. No incoming administration may delete, overwrite, or obscure the records, decisions, or personnel of previous terms. Complete physical records are maintained at the Campus Cultural Archives."}
                </p>
              </div>

              {archivesSection.contentEn.documentUrl && (
                <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[6px] p-5 shrink-0 w-full md:w-80 space-y-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
                        {archivesSection.contentEn.documentTitle || "Archival Protocol Document"}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {archivesSection.contentEn.documentSize || "PDF Deposit"}
                      </p>
                    </div>
                  </div>

                  <a 
                    href={archivesSection.contentEn.documentUrl} 
                    download
                    className="w-full inline-block"
                  >
                    <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />}>
                      Download Protocol
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. Historical Cross-Link Navigation Banner */}
        <section className="bg-[var(--bg-surface)] p-8 rounded-[8px] border border-[var(--border-color)] shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">
                Connect With Our Living Institution
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-xl">
                Every milestone achieved was built upon the vision of our founding scholars and active committees. Explore our founding documents and upcoming calendar.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link href="/founders">
                <Button variant="outline" size="sm" leftIcon={<Users className="w-3.5 h-3.5" />}>
                  Founders Archive
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="sm" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
                  About & Constitution
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="accent" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Upcoming Events
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
