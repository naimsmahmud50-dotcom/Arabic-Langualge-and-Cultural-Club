/**
 * @file src/components/home/CulturalProgramsSection.tsx
 * @description Cultural Programs, Workshops & Traditional Arabic Circles Showcase.
 * 
 * ARCHITECTURAL ROLE:
 * - Details the four flagship experiential programs offered by the society.
 * - Bridges academic study with active cultural practice and creative artistry.
 * - Meets Requirement SPEC-HOM-07 and SPEC-CUL-01.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Feather, MessageSquare, Palette, Scroll, ArrowRight, Sparkles } from "lucide-react";

export function CulturalProgramsSection() {
  const programs = [
    {
      icon: Feather,
      titleEn: "Classical Rhetoric & Grammar Circles",
      titleAr: "حلقات النحو والبلاغة الكلاسيكية",
      schedule: "Weekly on Tuesdays & Thursdays",
      level: "Introductory to Advanced",
      desc: "Systematic exploration of foundational texts (Al-Ajrumiyyah, Alfiyyat Ibn Malik, and Al-Balaghah Al-Wadihah) guided by advanced scholars.",
    },
    {
      icon: MessageSquare,
      titleEn: "Collegiate Arabic Parliamentary Debate",
      titleAr: "المناظرات الجامعية باللغة الفصحى",
      schedule: "Bi-weekly on Saturdays",
      level: "Competitive & Eloquent",
      desc: "Training student debaters in formal Arabic argumentation, rebuttals, policy critique, and representation in national varsity tournaments.",
    },
    {
      icon: Palette,
      titleEn: "Arabic Calligraphy & Illuminations Studio",
      titleAr: "محترف الخط العربي والزخرفة الإسلامية",
      schedule: "Monthly Masterclasses",
      level: "Hands-on Workshop",
      desc: "Traditional reed pen (Qalam) techniques across classical scripts (Thuluth, Naskh, Diwani, and Ruq'ah) alongside gold-leaf manuscript border craft.",
    },
    {
      icon: Scroll,
      titleEn: "Classical Arabic Poetry & Literary Salon",
      titleAr: "صالون الأدب والشعر العربي الأصيل",
      schedule: "Monthly Evening Gathering",
      level: "Cultural & Conversational",
      desc: "Intimate recitation and critical analysis of pre-Islamic Mu'allaqat, Abbasid verse (Al-Mutanabbi, Abu Tammam), and contemporary diaspora prose.",
    },
  ];

  return (
    <section className="py-20 bg-[var(--bg-surface-elevated)] border-b border-[var(--border-color)]" aria-label="Cultural Programs & Activities">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="accent" size="sm">Signature Initiatives</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif">
            Cultural Programs & Academic Circles
          </h2>
          <p className="font-arabic text-base text-[var(--brand-accent)] font-medium" dir="rtl">
            الْبَرَامِجُ وَالْأَنْشِطَةُ الثَّقَافِيَّةُ • أَنْشِطَةٌ تَرْبِطُ التُّرَاثَ بِالْإِبْدَاعِ الْمُعَاصِرِ
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Our programs are designed for both native speakers seeking oratorical mastery and non-native scholars acquiring authentic linguistic fluency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((prog, idx) => {
            const Icon = prog.icon;
            return (
              <Card key={idx} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)]">
                <CardContent className="p-8 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                        {prog.schedule}
                      </Badge>
                      <span className="text-[11px] text-[var(--brand-accent)] font-medium">
                        {prog.level}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      {prog.titleEn}
                    </h3>
                    <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium mt-1" dir="rtl">
                      {prog.titleAr}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {prog.desc}
                  </p>

                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)]">Open to all verified club members</span>
                    <Link href="/events" className="text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-semibold hover:underline inline-flex items-center gap-1">
                      <span>Schedule & Syllabus</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
