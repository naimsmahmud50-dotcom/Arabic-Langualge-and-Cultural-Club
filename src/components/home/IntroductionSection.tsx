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

export function IntroductionSection() {
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
    <section className="py-20 bg-[var(--bg-primary)] border-b border-[var(--border-color)]" aria-label="Introduction to the Club">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="accent" size="sm">Foundational Mandate</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif">
            The Purpose & Four Pillars of Our Society
          </h2>
          <p className="font-arabic text-base text-[var(--brand-accent)] font-medium" dir="rtl">
            «إِنَّ مِنَ الْبَيَانِ لَسِحْرًا» • أربعة أركان تقوم عليها مسيرتنا في كلية كابي نذرول الحكومية
          </p>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            Founded as the premier collegiate society at Kabi Nazrul Government College, Dhaka, the Arabic Language & Cultural Club provides an intellectually rigorous sanctuary for the mastery, celebration, and dissemination of classical Arabic letters.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card key={idx} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)]">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center">
                    <Icon className="w-6 h-6" />
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
