/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/home/IntroductionSection.tsx
 * Updated collegiate society identity to Kabi Nazrul Government College, Dhaka.
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/home/IntroductionSection.tsx
 * @description Introduction to the Arabic Club: Mission, Vision, and Four Pillars.
 * 
 * ARCHITECTURAL ROLE:
 * - Introduces the foundational ethos of the Arabic Language & Cultural Club at Kabi Nazrul Government College, Dhaka.
 * - Outlines the Four Pillars: Linguistic Eloquence, Historical Preservation,
 *   Ethical Leadership, and Scholarly Engagement.
 * - Meets Requirement SPEC-HOM-02 and SPEC-ABT-01.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button, HeritageDivider } from "@/components/ui";
import { BookOpen, History, Users, Award, ArrowRight, Compass } from "lucide-react";
import { type SiteSettings } from "@/lib/types/settings";

export interface IntroductionSectionProps {
  settings?: SiteSettings;
}

export function IntroductionSection({ settings }: IntroductionSectionProps) {
  const badgeText = settings?.mission_badge_en || "Foundational Mandate";
  const titleText = settings?.mission_title_en || "The Purpose & Four Pillars of Our Society";
  const subtitleText = settings?.mission_subtitle_ar || "«إِنَّ مِنَ الْبَيَانِ لَسِحْرًا» • أربعة أركان تقوم عليها مسيرتنا في كلية كابي نذرول الحكومية";
  const descText = settings?.mission_desc_en || "Founded as the premier collegiate society at Kabi Nazrul Government College, Dhaka, the Arabic Language & Cultural Club provides an intellectually rigorous sanctuary for the mastery, celebration, and dissemination of classical Arabic letters.";

  const pillars = [
    {
      icon: BookOpen,
      titleEn: "Linguistic Eloquence",
      titleAr: "الفصاحة والبلاغة",
      desc: "Deep immersion in classical Arabic grammar (Nahw), morphology (Sarf), rhetoric (Balaghah), and prose comprehension.",
    },
    {
      icon: History,
      titleEn: "Historical Preservation",
      titleAr: "حفظ التراث والتوثيق",
      desc: "An enduring institutional archive preserving founding manuscripts, committee lineages, and student scholarly work.",
    },
    {
      icon: Users,
      titleEn: "Ethical Leadership",
      titleAr: "القيادة الرشيدة",
      desc: "Orderly democratic governance, inter-generational mentorship between senior fellows and newcomers, and executive discipline.",
    },
    {
      icon: Award,
      titleEn: "Scholarly Engagement",
      titleAr: "النشر والبحث العلمي",
      desc: "Publishing peer-reviewed student journals, hosting national Arabic debate competitions, and public academic symposiums.",
    },
  ];

  return (
    <section className="py-10 sm:py-16 lg:py-20 bg-[var(--bg-primary)] border-b border-[var(--border-color)]" aria-label="Introduction to the Club">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16 space-y-2 sm:space-y-3">
          <Badge variant="accent" size="sm">{badgeText}</Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] font-serif leading-tight">
            {titleText}
          </h2>
          <p className="font-arabic text-sm sm:text-base text-[var(--brand-accent)] font-medium" dir="rtl">
            {subtitleText}
          </p>
          <p className="text-xs sm:text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
            {descText}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card key={idx} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)]">
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {pillar.titleEn}
                    </h3>
                    <div className="font-arabic text-xs text-[var(--brand-accent)] font-medium mt-0.5" dir="rtl">
                      {pillar.titleAr}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    {pillar.desc}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charter Exploration Link */}
        <div className="mt-12 text-center">
          <Link href="/about">
            <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Read Our Constitution & Full Institutional Charter
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
