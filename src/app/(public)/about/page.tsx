/**
 * DEVELOPER NOTE:
 * Page/Component: src/app/(public)/about/page.tsx
 * Updated page title and SEO metadata to reflect Kabi Nazrul Government College, Dhaka.
 * Strictly human vibe; zero AI emojis.
 *
 * ==============================================================================
 * PAGE COMPONENT: About the Club (Institutional Narrative, Mission, Vision, Values, Constitution)
 * ==============================================================================
 * @file src/app/(public)/about/page.tsx
 * @route /about
 * @access Public
 * @cms_source Database tables: `editable_pages` (slug='about') and `page_sections`
 * 
 * DEVELOPER ONBOARDING NOTE:
 * ------------------------------------------------------------------------------
 * This page serves as the permanent institutional charter and public voice of the
 * Arabic Language & Cultural Club.
 * 
 * ARCHITECTURE & DATA FLOW:
 * 1. Fetches published page metadata & sections from `getPageWithSections('about')`.
 * 2. Sections are parsed from typed JSON payloads stored in `page_sections.content_en`.
 * 3. Supports headless CMS editing by authorized Content Editors without code changes.
 * 4. Renders dignified, academic empty states if the database is unseeded or records are unpublished.
 * 5. Strict adherence to institutional heritage tokens:
 *    - Heritage Forest: var(--brand-primary) #173D32
 *    - Antique Brass: var(--brand-accent) #B18A4A
 *    - Warm Ivory: var(--bg-surface) #F5F0E5
 *    - Deep Evergreen: var(--text-primary)
 * ------------------------------------------------------------------------------
 */

import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, Button, HeritageDivider, EmptyState, ClubLogo } from "@/components/ui";
import { 
  Compass, 
  BookOpen, 
  Target, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight, 
  Award, 
  FileText, 
  Download, 
  Scroll, 
  CheckCircle2,
  Users,
  History
} from "lucide-react";
import { getPageWithSections, SectionContentItem } from "@/lib/db/queries";
import { CulturalProgramsSection } from "@/components/home";

export const revalidate = 60; // Incremental Static Regeneration every 60s

export const metadata: Metadata = {
  title: "About the Club | Arabic Language & Cultural Club, Kabi Nazrul Govt. College",
  description: "An enduring academic society at Kabi Nazrul Government College, Dhaka, founded to preserve the classical eloquence of the Arabic language, foster intellectual discourse, and cultivate cultural scholarship.",
  openGraph: {
    title: "About Us — Arabic Language & Cultural Club, Kabi Nazrul Govt. College",
    description: "Discover our institutional mission, vision, core values, and constitutional charter for Arabophone scholarship at Kabi Nazrul Government College, Dhaka.",
  },
};

// Map icon strings stored in CMS JSON to verified Lucide components
function renderIcon(iconName?: string) {
  switch (iconName) {
    case "BookOpen": return <BookOpen className="w-5 h-5" />;
    case "ShieldCheck": return <ShieldCheck className="w-5 h-5" />;
    case "HeartHandshake": return <HeartHandshake className="w-5 h-5" />;
    case "Compass": return <Compass className="w-5 h-5" />;
    case "Award": return <Award className="w-5 h-5" />;
    case "Target": return <Target className="w-5 h-5" />;
    case "Scroll": return <Scroll className="w-5 h-5" />;
    default: return <BookOpen className="w-5 h-5" />;
  }
}

export default async function AboutPage() {
  const pageData = await getPageWithSections("about");

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
  ];

  // Meaningful empty state if page is not found or unpublished
  if (!pageData) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)]">
        <PageHeader
          title="About the Club"
          titleAr="عن النادي وأهدافه السامية"
          description="Institutional charter and foundational narrative."
          badge="Archival Notice"
          breadcrumbs={breadcrumbs}
        />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <EmptyState
            icon={<Scroll className="w-12 h-12 text-[var(--brand-accent)]" />}
            title="Official Records Pending Archival Publication"
            description="The official charter and institutional documentation for the Arabic Language & Cultural Club are currently undergoing academic review by the Archival Committee. Verified records will appear once published."
            actionLabel="Explore Founders Archive"
            actionHref="/founders"
          />
        </div>
      </div>
    );
  }

  // Extract individual sections by sectionKey
  const missionSection = pageData.sections.find((s) => s.sectionKey === "mission");
  const visionSection = pageData.sections.find((s) => s.sectionKey === "vision");
  const valuesSection = pageData.sections.find((s) => s.sectionKey === "values");
  const constitutionSection = pageData.sections.find((s) => s.sectionKey === "constitution");
  const pillarsSection = pageData.sections.find((s) => s.sectionKey === "pillars");

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      {/* 1. Header with Breadcrumbs & Calligraphy Subheading */}
      <PageHeader
        title={pageData.titleEn}
        titleAr={pageData.titleAr || "عن النادي وأهدافه السامية"}
        description={pageData.metaDescriptionEn || "An enduring academic society founded to preserve the classical eloquence of the Arabic language, foster intellectual discourse, and cultivate cultural scholarship."}
        badge="Institutional Charter"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* 2. Mission & Vision Dual Heritage Showcase */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8" id="mission-vision">
          {/* Mission Card */}
          <Card className="border-[var(--border-color)] bg-[var(--bg-surface)] p-8 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center border border-[var(--brand-primary)]/20">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <Badge variant="accent" size="sm">
                  {missionSection?.contentEn.badge || "Our Mission"}
                </Badge>
                <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                  {missionSection?.contentEn.heading || "Institutional Mission"}
                </h2>
                <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
                  {missionSection?.contentAr.heading || "رسالتنا المؤسسية الرصينة"}
                </p>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {missionSection?.contentEn.body || "To cultivate an academic environment that empowers students to master Arabic linguistics, appreciate the depth of Islamic and classical literature, and articulate thought with eloquence, integrity, and analytical depth."}
              </p>
            </div>
            
            {missionSection?.contentEn.quote && (
              <div className="pt-4 border-t border-[var(--border-color)] space-y-1">
                <blockquote className="font-arabic text-base text-[var(--brand-accent)]" dir="rtl">
                  {missionSection.contentEn.quote.text}
                </blockquote>
                {missionSection.contentEn.quote.attribution && (
                  <p className="text-xs font-serif italic text-[var(--text-muted)]">
                    — {missionSection.contentEn.quote.attribution}
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Vision Card */}
          <Card className="border-[var(--border-color)] bg-[var(--bg-surface)] p-8 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] flex items-center justify-center border border-[var(--brand-accent)]/20">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <Badge variant="accent" size="sm">
                  {visionSection?.contentEn.badge || "Our Vision"}
                </Badge>
                <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                  {visionSection?.contentEn.heading || "Institutional Vision"}
                </h2>
                <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
                  {visionSection?.contentAr.heading || "رؤيتنا المستقبلية الواعدة"}
                </p>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {visionSection?.contentEn.body || "To be the premier university forum for Arabic literary scholarship, recognized regionally for producing articulate leaders, eloquent orators, and scholarly publications that bridge traditional heritage and contemporary intellectual dialogue."}
              </p>
            </div>

            {visionSection?.contentEn.quote && (
              <div className="pt-4 border-t border-[var(--border-color)] space-y-1">
                <blockquote className="text-sm font-serif italic text-[var(--brand-accent)]">
                  «{visionSection.contentEn.quote.text}»
                </blockquote>
                {visionSection.contentEn.quote.attribution && (
                  <p className="text-xs text-[var(--text-muted)]">
                    — {visionSection.contentEn.quote.attribution}
                  </p>
                )}
              </div>
            )}
          </Card>
        </section>

        <HeritageDivider />

        {/* 3. Core Institutional Values Section */}
        {valuesSection && (
          <section className="space-y-10" id="values">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="neutral" size="sm">
                {valuesSection.contentEn.badge || "Guiding Philosophy"}
              </Badge>
              <h2 className="text-3xl font-serif font-bold text-[var(--text-primary)]">
                {valuesSection.contentEn.heading || "Our Core Institutional Values"}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {valuesSection.contentEn.subheading || "Every initiative, competition, and publication conforms strictly to these five foundational values."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {valuesSection.contentEn.items?.map((val: SectionContentItem, idx: number) => (
                <Card 
                  key={val.id || idx} 
                  className="border-[var(--border-color)] bg-[var(--bg-surface)] p-6 space-y-4 hover:border-[var(--brand-accent)] transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                      {renderIcon(val.iconName)}
                    </div>
                    <span className="font-serif font-bold text-xs text-[var(--brand-accent)]">
                      0{idx + 1}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {val.title}
                    </h3>
                    {val.arabicTitle && (
                      <p className="font-arabic text-xs text-[var(--brand-accent)] font-medium" dir="rtl">
                        {val.arabicTitle}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {val.description}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* 4. The Four Academic Pillars Section */}
        {pillarsSection && (
          <section className="space-y-10" id="pillars">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <Badge variant="neutral" size="sm">
                {pillarsSection.contentEn.badge || "Operational Framework"}
              </Badge>
              <h2 className="text-3xl font-serif font-bold text-[var(--text-primary)]">
                {pillarsSection.contentEn.heading || "The Four Academic Pillars"}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                {pillarsSection.contentEn.subheading || "Our comprehensive operational framework across linguistic and cultural domains."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillarsSection.contentEn.items?.map((pillar: SectionContentItem, idx: number) => (
                <div 
                  key={idx}
                  className="border border-[var(--border-color)] bg-[var(--bg-surface)] p-6 rounded-[6px] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <Badge variant="accent" size="sm">
                      {pillar.badge || `Pillar 0${idx + 1}`}
                    </Badge>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[var(--border-color)] flex items-center gap-1.5 text-xs text-[var(--brand-accent)] font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Academic Curriculum</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Cultural Initiatives & Experiential Programs */}
        <div className="rounded-[8px] overflow-hidden border border-[var(--border-color)]">
          <CulturalProgramsSection />
        </div>

        {/* 6. Constitution & Governance Charter (Downloadable Document & Verification) */}
        {constitutionSection && (
          <section className="bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] rounded-[8px] p-8 md:p-10 space-y-6" id="constitution">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 max-w-2xl">
                <ClubLogo variant="crest" size="lg" className="shrink-0 hidden sm:inline-flex drop-shadow-sm" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {constitutionSection.contentEn.badge || "Governing Charter"}
                    </Badge>
                    <span className="text-xs text-[var(--brand-accent)] font-medium">
                      Verified Institutional Record
                    </span>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                    {constitutionSection.contentEn.heading || "Club Constitution & Institutional Governance"}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {constitutionSection.contentEn.body || "The Arabic Language & Cultural Club operates under an institutional constitution ratified by the founding general assembly. The constitution mandates annual executive committee transitions, democratic representation, transparent auditing of club assets, and permanent preservation of archival records."}
                  </p>
                </div>
              </div>

              {/* Downloadable Constitution Card */}
              <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[6px] p-5 shrink-0 w-full md:w-80 space-y-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
                      {constitutionSection.contentEn.documentTitle || "Official Constitution & Bylaws"}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {constitutionSection.contentEn.documentSize || "PDF Document"}
                    </p>
                  </div>
                </div>

                <a 
                  href={constitutionSection.contentEn.documentUrl || "/assets/docs/club-constitution.pdf"} 
                  download
                  className="w-full inline-block"
                >
                  <Button variant="accent" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download Constitution
                  </Button>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* 6. Archival Cross-Link Navigation Banner */}
        <section className="bg-[var(--bg-surface)] p-8 rounded-[8px] border border-[var(--border-color)] shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">
                Explore Our Archival Heritage & Leadership
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-2xl">
                Our institutional memory is safeguarded by strict constitutional continuity. Review the founding scholars, chronological milestones, and successive executive committees.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link href="/founders">
                <Button variant="outline" size="sm" leftIcon={<Users className="w-3.5 h-3.5" />}>
                  Founders Archive
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="primary" size="sm" leftIcon={<History className="w-3.5 h-3.5" />}>
                  Chronological History
                </Button>
              </Link>
              <Link href="/leadership">
                <Button variant="accent" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Leadership & Committees
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
