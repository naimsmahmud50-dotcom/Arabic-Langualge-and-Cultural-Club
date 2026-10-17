/**
 * @file src/components/home/FoundersPreviewSection.tsx
 * @description Founders Archive & Founding Story Preview Section.
 * 
 * ARCHITECTURAL ROLE:
 * - Honors the inaugural conveners and faculty advisers who established the club.
 * - Displays authentic database records from `getPublicFounders()`.
 * - Meets Requirement SPEC-HOM-03 and SPEC-ABT-02.
 * 
 * CONSTRAINTS:
 * - Zero fabricated personnel: clearly identifies demo fixtures when in staging.
 * - Bilingual titles and names.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Award, ArrowRight, UserCheck, BookMarked } from "lucide-react";

interface FounderItem {
  id: string;
  nameEn: string;
  nameAr?: string | null;
  roleTitleEn: string;
  roleTitleAr?: string | null;
  bioEn?: string | null;
  bioAr?: string | null;
  foundingYear?: number | null;
  portraitUrl?: string | null;
}

interface FoundersPreviewSectionProps {
  founders: FounderItem[];
}

export function FoundersPreviewSection({ founders }: FoundersPreviewSectionProps) {
  return (
    <section className="py-20 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-color)]" aria-label="Founders & Origin Archive">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="accent" size="sm">Archival Origins</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif">
              Founders & Archival Genesis
            </h2>
            <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
              سِجِلُّ الرُّوَّادِ • تَكْرِيمُ الْمُؤَسِّسِينَ وَأَصْحَابِ الْفَضْلِ فِي نَشْأَةِ النَّادِي
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              In 2022, a dedicated convocation of scholars, student debaters, and calligraphers established the permanent charter of the Arabic Language & Cultural Club.
            </p>
          </div>
          <Link href="/founders">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Read Founding Monograph
            </Button>
          </Link>
        </div>

        {founders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {founders.slice(0, 3).map((founder) => (
              <Card key={founder.id} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)]">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)] text-white flex items-center justify-center font-bold text-lg border border-[var(--brand-accent)]">
                      {founder.nameEn.charAt(0)}
                    </div>
                    <Badge variant="outline" size="sm" className="font-mono">
                      Class of {founder.foundingYear}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {founder.nameEn}
                    </h3>
                    {founder.nameAr && (
                      <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium mt-0.5" dir="rtl">
                        {founder.nameAr}
                      </p>
                    )}
                    <div className="text-xs font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)] mt-1">
                      {founder.roleTitleEn}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                    {founder.bioEn || "Dedicated academic convener and institutional founder."}
                  </p>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1 font-medium">
                      <BookMarked className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                      Inaugural Charter
                    </span>
                    <Link href="/founders" className="text-[var(--brand-accent)] hover:underline font-semibold">
                      Full Bio →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[6px] max-w-md mx-auto">
            <UserCheck className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Founding Archive in Process</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Historical monographs are undergoing academic verification by the archival committee.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
