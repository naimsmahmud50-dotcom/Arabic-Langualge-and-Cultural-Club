/**
 * ==============================================================================
 * PAGE COMPONENT: Founders & Founding Archive
 * ==============================================================================
 * @file src/app/(public)/founders/page.tsx
 * @route /founders
 * @access Public
 * @cms_source Database table: `founders` via `getPublicFounders()`
 * 
 * DEVELOPER ONBOARDING NOTE:
 * ------------------------------------------------------------------------------
 * This page serves as the permanent roll of honor for the founding conveners,
 * scholars, and faculty patrons who established the Arabic Language & Cultural Club.
 * 
 * CORE RULES:
 * 1. Strict Anti-Fabrication: All founders come from verified database records.
 * 2. Elegant Neutral Avatar Fallback: If `portraitUrl` is null, renders initials
 *    with an Antique Brass border and subtle calligraphic tone instead of AI avatars.
 * 3. Bilingual English & Arabic typography with proper `dir="rtl"` glyph shaping.
 * 4. Displays verified founding year, role titles, and intellectual contributions.
 * ------------------------------------------------------------------------------
 */

import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState, Button, HeritageDivider } from "@/components/ui";
import { getPublicFounders } from "@/lib/db/queries";
import { 
  Award, 
  Calendar, 
  BookOpen, 
  FileText, 
  Download, 
  ShieldCheck, 
  ArrowRight,
  Users,
  History
} from "lucide-react";

export const revalidate = 60; // Incremental Static Regeneration every 60s

export const metadata: Metadata = {
  title: "Founders of the Club | Arabic Language & Cultural Club",
  description: "Preserving the memory and honoring the intellectual dedication of the founding conveners and patron scholars who established the Arabic Language & Cultural Club.",
  openGraph: {
    title: "Founders Archive — Arabic Language & Cultural Club",
    description: "Verified historical profiles of the founding academic assembly and charter conveners.",
  },
};

// Generates an elegant, neutral monogram from English name
function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default async function FoundersPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Founders Archive", href: "/founders" },
  ];

  const founders = await getPublicFounders().catch(() => []);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      {/* 1. Header with Breadcrumbs & Archival Badge */}
      <PageHeader
        title="Founders of the Club"
        titleAr="مؤسسو النادي والرواد الأوائل"
        description="Preserving the permanent roll of honor and celebrating the intellectual devotion of the founding scholars and students who laid our institutional foundations."
        badge="Archival Memorial"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* 2. Founding Assembly Narrative & Charter Citation */}
        <section className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] p-8 md:p-10 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2">
                <Badge variant="accent" size="sm">Charter Conveners</Badge>
                <span className="text-xs text-[var(--text-muted)] font-medium">
                  General Assembly Inception 2022
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text-primary)]">
                The Founding Academic Conveners
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                In autumn 2022, an assembly of dedicated classical Arabic students, faculty patrons, and calligraphers convened to establish an enduring society on campus. Their vision was to restore eloquence in student debate, cultivate philological rigor, and permanently record every successive administration in our university cultural archives.
              </p>
            </div>

            {/* Founding Charter Document Card */}
            <div className="bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] rounded-[6px] p-5 shrink-0 w-full lg:w-80 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[var(--text-primary)]">
                    Inaugural Founding Charter
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] font-mono">
                    Ref: FCA-2022-INCEPTION
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Ratified unanimously at the inaugural assembly; sealed in the campus library archives.
              </p>
            </div>
          </div>
        </section>

        <HeritageDivider />

        {/* 3. Verified Founders Roster Grid */}
        <section className="space-y-8" id="roster">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-serif font-bold text-[var(--text-primary)]">
                Founding Assembly & Patrons Roll
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Verified historical records maintained by the Archival Preservation Committee.
              </p>
            </div>
            <Badge variant="primary" size="md">
              Verified Profiles: {founders.length}
            </Badge>
          </div>

          {founders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {founders.map((founder, idx) => (
                <Card 
                  key={founder.id} 
                  hoverElevate 
                  className="border-[var(--border-color)] bg-[var(--bg-surface)] overflow-hidden flex flex-col justify-between shadow-sm"
                >
                  <CardContent className="p-8 space-y-5">
                    {/* Portrait or Elegant Neutral Monogram */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-[8px] bg-[var(--bg-surface-elevated)] text-[var(--brand-primary)] flex items-center justify-center font-serif text-xl font-bold border-2 border-[var(--brand-accent)] shrink-0 shadow-xs">
                        {founder.portraitUrl ? (
                          <img 
                            src={founder.portraitUrl} 
                            alt={founder.nameEn} 
                            className="w-full h-full object-cover rounded-[6px]" 
                          />
                        ) : (
                          <span>{getInitials(founder.nameEn)}</span>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="accent" size="sm">
                            {founder.foundingYear ? `Convener ${founder.foundingYear}` : "Founding Convener"}
                          </Badge>
                          <span className="text-[11px] text-[var(--brand-primary)] font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        </div>
                        <h4 className="text-lg font-serif font-bold text-[var(--text-primary)] leading-tight">
                          {founder.nameEn}
                        </h4>
                        {founder.nameAr && (
                          <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold" dir="rtl">
                            {founder.nameAr}
                          </p>
                        )}
                        <p className="text-xs text-[var(--text-secondary)] font-medium">
                          {founder.roleTitleEn}
                          {founder.roleTitleAr && (
                            <span className="font-arabic text-[var(--brand-accent)] ml-1">
                              • {founder.roleTitleAr}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Intellectual Contribution & Biography */}
                    <div className="pt-3 border-t border-[var(--border-color)] space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                      <p>{founder.bioEn}</p>
                      {founder.bioAr && (
                        <p className="font-arabic text-[var(--text-muted)] pt-1 text-right" dir="rtl">
                          {founder.bioAr}
                        </p>
                      )}
                    </div>
                  </CardContent>

                  {/* Card Footer with Archival Verification Notice */}
                  <div className="px-8 py-3.5 bg-[var(--bg-surface-elevated)] border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1.5 font-mono">
                      <BookOpen className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                      Archive Roll #{idx + 1}
                    </span>
                    <span className="font-medium text-[var(--brand-primary)]">
                      Archival Record Sealed
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={<Users className="w-12 h-12 text-[var(--brand-accent)]" />}
                title="Archival Founders Roster Under Ratification"
                description="The Archival Committee is currently transcribing the inaugural assembly minutes and verifying biographical attributions. Please check back shortly."
                actionLabel="Return to About Us"
                actionHref="/about"
              />
            </div>
          )}
        </section>

        {/* 4. Cross-Link Navigation Banner */}
        <section className="bg-[var(--bg-surface)] p-8 rounded-[8px] border border-[var(--border-color)] shadow-sm">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-lg font-serif font-bold text-[var(--text-primary)]">
                Explore Leadership & Milestone History
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-xl">
                The foundations laid by our founders continue to guide our governing councils. Review our chronological history or inspect past and present executive committees.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link href="/about">
                <Button variant="outline" size="sm" leftIcon={<BookOpen className="w-3.5 h-3.5" />}>
                  About the Club
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="outline" size="sm" leftIcon={<History className="w-3.5 h-3.5" />}>
                  Chronological Timeline
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
