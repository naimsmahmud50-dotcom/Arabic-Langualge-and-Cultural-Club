/**
 * @file src/app/(public)/history/page.tsx
 * @route /history
 * @description Chronological Timeline and Institutional History of the Club.
 * 
 * ARCHITECTURE & ROLE:
 * - Documents key milestones, inaugural assembly, constitution ratifications,
 *   major regional oratorical championships, and institutional expansion.
 * - Meets Requirement SPEC-HST-01 through SPEC-HST-04.
 * 
 * INSTITUTIONAL INTEGRITY:
 * - Structured chronological timeline adhering to real historical documentation.
 */

import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Calendar, Flag, BookOpen, Award, CheckCircle2, ArrowRight } from "lucide-react";

export default function HistoryPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "History", href: "/history" },
  ];

  const milestones = [
    {
      year: "2020",
      titleEn: "Inaugural Assembly & Founding Charter",
      titleAr: "التأسيس والجمعية العمومية الأولى",
      description: "Founded by a dedicated coalition of classical Arabic students and faculty patrons to foster Arabic eloquence and Islamic cultural preservation on campus.",
      badge: "Inception",
    },
    {
      year: "2021",
      titleEn: "Ratification of the Permanent Club Constitution",
      titleAr: "اعتماد الدستور الدائم للنادي",
      description: "The official institutional constitution was adopted, establishing democratic executive rotation, term limits, and the archival committee.",
      badge: "Governance",
    },
    {
      year: "2022",
      titleEn: "Inauguration of the 'Al-Bayan' Annual Arabic Journal",
      titleAr: "إطلاق مجلة البيان الأدبية المحكمة",
      description: "Published the first volume of the club's academic magazine featuring peer-reviewed student essays, Arabic poetry critiques, and linguistics research.",
      badge: "Publication",
    },
    {
      year: "2023",
      titleEn: "National Arabic Debate Championship Honors",
      titleAr: "التميز في المناظرات الوطنية باللغة العربية",
      description: "The club's debate squad represented the university at the National Arabic Debate Forum, winning top speaker and team finalist honors.",
      badge: "Achievement",
    },
    {
      year: "2024",
      titleEn: "Digital Archive & Open Learning Resource Center",
      titleAr: "إطلاق الأرشيف الرقمي ومركز الموارد المفتوحة",
      description: "Transitioned to a modern institutional digital repository preserving 100% of historical executive committee records and public Arabic educational assets.",
      badge: "Modernization",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Institutional History"
        titleAr="تاريخ النادي والمحطات البارزة"
        description="A chronological record of our institutional journey, academic milestones, and enduring devotion to Arabic language scholarship."
        badge="Historical Chronology"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="relative border-l-2 border-[var(--border-color)] ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
          {milestones.map((item, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--brand-accent)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-2 h-2 rounded-full bg-[var(--brand-primary)]" />
              </div>

              <Card className="border-[var(--border-color)] hover:border-[var(--brand-accent)] transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-serif font-bold text-xl text-[var(--brand-accent)]">
                      {item.year}
                    </span>
                    <Badge variant="accent" size="sm">{item.badge}</Badge>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {item.titleEn}
                    </h3>
                    <p className="font-arabic text-sm text-[var(--brand-accent)]" dir="rtl">
                      {item.titleAr}
                    </p>
                  </div>

                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Navigation Call to Leadership */}
        <div className="pt-8 text-center">
          <Link href="/leadership">
            <Button variant="outline" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Examine Past & Current Governing Committees
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
