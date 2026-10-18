/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/home/HeroSection.tsx
 * Updated hero collegiate badge, Arabic bismillah heading, and editorial narrative to reflect Kabi Nazrul Government College, Dhaka.
 * Integrated official Arabic Language & Cultural Club crest in scholarly emblem card.
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/home/HeroSection.tsx
 * @description Institutional Hero Section for the Arabic Language & Cultural Club Homepage.
 * 
 * ARCHITECTURAL ROLE:
 * - Premium scholarly gateway greeting members, researchers, and prospective students.
 * - Displays verified institutional nomenclature, official club crest (<ClubLogo variant="crest" />), and primary CTAs.
 * - Meets Requirement SPEC-HOM-01.
 * 
 * DESIGN CONSTRAINTS:
 * - Brand palette: Midnight evergreen (#17211D) & Forest green (#173D32) background with Warm ivory (#F5F0E5) text.
 * - Antique brass (#B18A4A) accents.
 * - Authentic 8-point geometric star pattern backdrop (no generic AI particles).
 * - Fully accessible keyboard focus states and high-contrast typography.
 */

import React from "react";
import Link from "next/link";
import { Button, GeometricPattern, Badge, ClubLogo } from "@/components/ui";
import { ShieldCheck, ArrowRight, BookOpen, Calendar, Compass } from "lucide-react";

interface HeroSectionProps {
  stats?: {
    activeMembers?: number;
    upcomingEvents?: number;
    foundingYear?: number;
  };
}

export function HeroSection({ stats }: HeroSectionProps) {
  const foundingYear = stats?.foundingYear || 2022;

  return (
    <section 
      className="relative overflow-hidden bg-[var(--brand-dark)] text-[#F5F0E5] pt-24 pb-20 lg:pt-28 lg:pb-24 border-b border-[var(--border-color)]"
      aria-label="Institutional Welcome & Motto"
    >
      {/* Subtle Classical Geometric Background Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden="true">
        <GeometricPattern />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Editorial Content Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-white/10 border border-white/20 text-xs font-semibold text-[var(--brand-accent)] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Collegiate Society • Kabi Nazrul Govt. College, Dhaka</span>
            </div>

            {/* Bilingual Typography Header */}
            <div className="space-y-4">
              <p 
                className="font-arabic text-2xl sm:text-3xl text-[var(--brand-accent)] font-semibold leading-relaxed" 
                dir="rtl"
                lang="ar"
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • نَادِي اللُّغَةِ وَالثَّقَافَةِ الْعَرَبِيَّةِ - كُلِّيَّةُ كَابِي نَذْرُول الْحُكُومِيَّة
              </p>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight font-serif">
                Preserving Heritage, Advancing Eloquence, Cultivating Leadership.
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-[#D8DFD7] leading-relaxed max-w-2xl font-light">
              An enduring collegiate forum at Kabi Nazrul Government College, Dhaka, dedicated to classical Arabic scholarship, rhetorical mastery, competitive debate, and intellectual fellowship.
            </p>

            {/* Primary Meaningful Calls to Action */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link href="/membership">
                <Button 
                  variant="accent" 
                  size="lg" 
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Apply for Membership
                </Button>
              </Link>
              <Link href="/about">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Explore Our Legacy
                </Button>
              </Link>
              <Link href="/events">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="text-[var(--brand-accent)] hover:bg-white/5"
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  12-Month Calendar
                </Button>
              </Link>
            </div>

            {/* Verified Institutional Metadata Ribbon */}
            <div className="pt-8 border-t border-white/15 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-[#C5D0C7]">
              <div>
                <span className="block text-xl font-bold text-white font-mono">{foundingYear}</span>
                <span className="text-[11px] uppercase tracking-wider text-[var(--brand-accent)]">Year of Foundation</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-white font-mono">100%</span>
                <span className="text-[11px] uppercase tracking-wider text-[var(--brand-accent)]">Verified Records</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-xl font-bold text-white font-arabic" dir="rtl">اللغة الخالدة</span>
                <span className="text-[11px] uppercase tracking-wider text-[var(--brand-accent)]">Classical Heritage</span>
              </div>
            </div>
          </div>

          {/* Right Emblem Card: Calligraphic Crest */}
          <div className="lg:col-span-4 hidden lg:flex flex-col items-center justify-center">
            <div className="relative p-8 rounded-[12px] bg-white/5 border border-white/15 backdrop-blur-xs text-center space-y-4 max-w-xs shadow-2xl">
              <ClubLogo 
                variant="crest" 
                size="xl" 
                className="mx-auto filter drop-shadow-lg hover:scale-105 transition-transform" 
              />
              <div className="space-y-1">
                <h3 className="font-bold text-base text-white">
                  Lisan Al-Arab Heritage
                </h3>
                <p className="font-arabic text-sm text-[var(--brand-accent)]" dir="rtl">
                  «لُغَةُ الضَّادِ حِلْيَةُ الْأَدَبِ»
                </p>
              </div>
              <p className="text-xs text-[#B5C2B7] leading-relaxed">
                Dedicated to students, scholars, and orators honoring the classical language of Islamic civilization and literature.
              </p>
              <div className="pt-2">
                <Badge variant="outline" size="sm" className="border-[var(--brand-accent)] text-[var(--brand-accent)]">
                  University Chartered
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
