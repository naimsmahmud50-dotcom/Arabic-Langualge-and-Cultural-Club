/**
 * @file src/app/(public)/about/page.tsx
 * @route /about
 * @description Institutional About, Mission, Vision, and Values Page.
 * 
 * ARCHITECTURE & ROLE:
 * - Permanent narrative describing the club's origin, institutional constitution,
 *   academic mandate, and core values.
 * - Meets Requirement SPEC-ABT-01 through SPEC-ABT-04.
 * 
 * DESIGN CONSTRAINTS:
 * - Scholarly, editorial layout with generous whitespace.
 * - Integrated PageHeader with breadcrumbs and Arabic title.
 * - Verified institutional placeholders until ratified club text is supplied.
 */

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, Button, HeritageDivider } from "@/components/ui";
import { Compass, BookOpen, Target, HeartHandshake, ShieldCheck, ArrowRight, Award } from "lucide-react";

export default function AboutPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
  ];

  return (
    <div>
      <PageHeader
        title="About the Club"
        titleAr="عن النادي وأهدافه السامية"
        description="An enduring academic society founded to preserve the classical eloquence of the Arabic language, foster intellectual discourse, and cultivate cultural scholarship."
        badge="Institutional Charter"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Mission & Vision Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-[var(--border-color)] bg-[var(--bg-surface)] p-8 space-y-4">
            <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <Badge variant="accent" size="sm">Our Mission</Badge>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                رسالتنا • Institutional Mission
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              To cultivate an academic environment that empowers students to master Arabic linguistics, appreciate the depth of Islamic and classical literature, and articulate thought with eloquence, integrity, and analytical depth.
            </p>
            <div className="pt-2 text-xs font-serif italic text-[var(--brand-accent)]">
              «إِنَّ مِنَ البَيَانِ لَسِحْرًا» — Classical Prophetic Adage
            </div>
          </Card>

          <Card className="border-[var(--border-color)] bg-[var(--bg-surface)] p-8 space-y-4">
            <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <Badge variant="accent" size="sm">Our Vision</Badge>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                رؤيتنا • Institutional Vision
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              To be the premier university forum for Arabic literary scholarship, recognized regionally for producing articulate leaders, eloquent orators, and scholarly publications that bridge traditional heritage and contemporary intellectual dialogue.
            </p>
            <div className="pt-2 text-xs font-serif italic text-[var(--brand-accent)]">
              Toward an enduring renaissance of literary excellence.
            </div>
          </Card>
        </section>

        {/* Foundational Pillars */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="neutral" size="sm">Guiding Philosophy</Badge>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              Our Core Institutional Values
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Every initiative, competition, and publication conforms strictly to these five core values.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-[var(--border-color)] p-6 space-y-3">
              <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                1. Scholarly Fidelity (الأمانة العلمية)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Upholding strict academic rigor in textual attribution, linguistic translation, and classical Arabic manuscript studies.
              </p>
            </Card>

            <Card className="border-[var(--border-color)] p-6 space-y-3">
              <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                2. Institutional Continuity (التوارث المؤسسي)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Honoring the contributions of founding scholars and former executive committees through continuous archival record-keeping.
              </p>
            </Card>

            <Card className="border-[var(--border-color)] p-6 space-y-3">
              <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                3. Collegial Brotherhood (الأخوة والتعاون)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Fostering an inclusive and supportive academic brotherhood where advanced linguists mentor novice Arabic learners.
              </p>
            </Card>
          </div>
        </section>

        {/* Links to Connected Heritage Sections */}
        <section className="bg-[var(--bg-surface-elevated)] p-8 rounded-[6px] border border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Explore Our History & Founding Fathers
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-xl">
              Learn about the founders who laid the foundation stones of our club and the chronological milestones achieved across consecutive academic years.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/founders">
              <Button variant="outline" size="sm">Founders Archive</Button>
            </Link>
            <Link href="/history">
              <Button variant="accent" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Chronological History
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
