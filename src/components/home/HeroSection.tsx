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
import { type SiteSettings } from "@/lib/types/settings";

interface HeroSectionProps {
  stats?: {
    activeMembers?: number;
    upcomingEvents?: number;
    foundingYear?: number;
  };
  settings?: SiteSettings;
}

export function HeroSection({ stats, settings }: HeroSectionProps) {
  const foundingYear = stats?.foundingYear || (settings?.founding_year ? parseInt(settings.founding_year, 10) : 2022);
  const badgeText = settings?.hero_badge_en || "Official Collegiate Society • Kabi Nazrul Govt. College, Dhaka";
  const arabicHeading = settings?.hero_arabic_heading || "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • نَادِي اللُّغَةِ وَالثَّقَافَةِ الْعَرَبِيَّةِ - كُلِّيَّةُ كَابِي نَذْرُول الْحُكُومِيَّة";
  const titleText = settings?.hero_title_en || "Preserving Heritage, Advancing Eloquence, Cultivating Leadership.";
  const subtitleText = settings?.hero_subtitle_en || "An enduring collegiate forum at Kabi Nazrul Government College, Dhaka, dedicated to classical Arabic scholarship, rhetorical mastery, competitive debate, and intellectual fellowship.";
  
  const ctaPrimaryLabel = settings?.hero_cta_primary_label_en || "Apply for Membership";
  const ctaPrimaryLink = settings?.hero_cta_primary_link || "/membership";
  const ctaSecondaryLabel = settings?.hero_cta_secondary_label_en || "Explore Our Legacy";
  const ctaSecondaryLink = settings?.hero_cta_secondary_link || "/about";
  const ctaTertiaryLabel = settings?.hero_cta_tertiary_label_en || "12-Month Calendar";
  const ctaTertiaryLink = settings?.hero_cta_tertiary_link || "/events";

  const cardTitle = settings?.hero_card_title_en || "Lisan Al-Arab Heritage";
  const cardQuote = settings?.hero_card_quote_ar || "«لُغَةُ الضَّادِ حِلْيَةُ الْأَدَبِ»";
  const cardDesc = settings?.hero_card_desc_en || "Dedicated to students, scholars, and orators honoring the classical language of Islamic civilization and literature.";
  const cardBadge = settings?.hero_card_badge_en || "University Chartered";
  const logoSrc = settings?.logo_crest_url || undefined;
  const bgImageUrl = settings?.hero_bg_image_url || null;

  return (
    <section 
      className="relative overflow-hidden bg-[var(--brand-dark)] text-[#F5F0E5] pt-10 pb-12 sm:pt-16 sm:pb-16 lg:pt-24 lg:pb-20 border-b border-[var(--border-color)]"
      aria-label="Institutional Welcome & Motto"
    >
      {/* Background Image Overlay if Configured */}
      {bgImageUrl && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImageUrl})` }}
          aria-hidden="true"
        />
      )}
      {/* Subtle Classical Geometric Background Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-10" aria-hidden="true">
        <GeometricPattern />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Editorial Content Column */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">
            {/* Mobile Crest & Badge */}
            <div className="flex items-center gap-3 lg:hidden">
              <ClubLogo 
                variant="crest" 
                size="md" 
                src={logoSrc} 
                priority 
                className="w-11 h-11 shrink-0 drop-shadow-md" 
              />
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-white/10 border border-white/20 text-[11px] font-semibold text-[#E5BE6A] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{badgeText}</span>
              </div>
            </div>

            <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-white/10 border border-white/20 text-xs font-semibold text-[#E5BE6A] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{badgeText}</span>
            </div>

            {/* Bilingual Typography Header */}
            <div className="space-y-3 sm:space-y-4">
              <p 
                className="font-arabic text-lg sm:text-2xl lg:text-3xl text-[#E5BE6A] font-semibold leading-relaxed" 
                dir="rtl"
                lang="ar"
              >
                {arabicHeading}
              </p>
              
              <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight font-serif">
                {titleText}
              </h1>
            </div>

            <p className="text-sm sm:text-lg text-[#D8DFD7] leading-relaxed max-w-2xl font-light">
              {subtitleText}
            </p>

            {/* Primary Meaningful Calls to Action */}
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link href={ctaPrimaryLink} className="w-full sm:w-auto">
                <Button 
                  variant="accent" 
                  size="lg" 
                  className="w-full sm:w-auto min-h-[44px] justify-center"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {ctaPrimaryLabel}
                </Button>
              </Link>
              <Link href={ctaSecondaryLink} className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto min-h-[44px] justify-center border-white/30 text-white hover:bg-white/10"
                >
                  {ctaSecondaryLabel}
                </Button>
              </Link>
              <Link href={ctaTertiaryLink} className="w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full sm:w-auto min-h-[44px] justify-center text-[#E5BE6A] hover:bg-white/5"
                  leftIcon={<Calendar className="w-4 h-4" />}
                >
                  {ctaTertiaryLabel}
                </Button>
              </Link>
            </div>

            {/* Verified Institutional Metadata Ribbon */}
            <div className="pt-6 sm:pt-8 border-t border-white/15 grid grid-cols-3 gap-3 sm:gap-6 text-xs text-[#C5D0C7]">
              <div>
                <span className="block text-lg sm:text-xl font-bold text-white font-mono">{foundingYear}</span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#E5BE6A]">Foundation</span>
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-bold text-white font-mono">100%</span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#E5BE6A]">Verified Records</span>
              </div>
              <div>
                <span className="block text-lg sm:text-xl font-bold text-white font-arabic" dir="rtl">اللغة الخالدة</span>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#E5BE6A]">Heritage</span>
              </div>
            </div>
          </div>

          {/* Right Emblem Card: Calligraphic Crest */}
          <div className="lg:col-span-4 hidden lg:flex flex-col items-center justify-center">
            <div className="relative p-8 rounded-[12px] bg-white/5 border border-white/15 backdrop-blur-xs text-center space-y-4 max-w-xs shadow-2xl">
              <ClubLogo 
                variant="crest" 
                size="xl" 
                src={logoSrc}
                className="mx-auto filter drop-shadow-lg hover:scale-105 transition-transform" 
              />
              <div className="space-y-1">
                <h3 className="font-bold text-base text-white">
                  {cardTitle}
                </h3>
                <p className="font-arabic text-sm text-[#E5BE6A]" dir="rtl">
                  {cardQuote}
                </p>
              </div>
              <p className="text-xs text-[#B5C2B7] leading-relaxed">
                {cardDesc}
              </p>
              <div className="pt-2">
                <Badge variant="outline" size="sm" className="border-[var(--brand-accent)] text-[var(--brand-accent)]">
                  {cardBadge}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
