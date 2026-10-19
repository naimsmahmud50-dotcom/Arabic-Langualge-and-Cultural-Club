/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/layout/Footer.tsx
 * Updated institutional footer identity block and copyright bar to Kabi Nazrul Government College, Dhaka.
 * Integrated official Arabic Language & Cultural Club crest.
 * Strictly human vibe; zero AI emojis.
 *
 * @file Footer.tsx
 * @description Comprehensive institutional footer for the Arabic Language & Cultural Club.
 * Features:
 * - Official branding, mission, Arabic motto, and official club crest (<ClubLogo variant="crest" />)
 * - Sitemaps grouped by domain (About, Operations, Resources, Policies)
 * - Institutional integrity notice (Zero-fabrication & archive preservation)
 * - Admin portal login shortcut
 */

import React from "react";
import Link from "next/link";
import { GeometricPattern, HeritageDivider, ClubLogo } from "@/components/ui";
import { Shield, Mail, MapPin, Globe } from "lucide-react";
import { type SiteSettings } from "@/lib/types/settings";

export interface FooterProps {
  settings?: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  const brandTitle = settings?.club_short_name_en || settings?.club_name_en || "Arabic Language & Cultural Club";
  const collegeTitle = settings?.college_name_en || "Kabi Nazrul Government College, Dhaka";
  const arabicTitle = settings?.club_name_ar || "نادي اللغة والثقافة العربية - كلية كابي نذرول الحكومية، دكا";
  const logoSrc = settings?.logo_crest_url || undefined;
  const aboutText = settings?.footer_about_text_en || "An enduring institutional archive and digital platform advancing classical Arabic eloquence, literary scholarship, cultural heritage, and student leadership.";
  const motto = settings?.footer_motto_ar || settings?.footer_motto_en || "«لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ»";
  const copyrightText = settings?.footer_copyright_en || "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka. All institutional rights reserved.";

  return (
    <footer className="relative bg-[var(--brand-dark)] text-[#F5F0E5] pt-16 pb-12 border-t border-[var(--border-color)] overflow-hidden">
      {/* Background Subtle Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <GeometricPattern />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          {/* Column 1: Institutional Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <ClubLogo variant="crest" size="md" src={logoSrc} className="drop-shadow-sm" />
              <div>
                <p className="font-bold text-lg text-white leading-tight">
                  {brandTitle}
                </p>
                <p className="text-xs text-[#E3D9C4] font-medium mt-0.5">
                  {collegeTitle}
                </p>
                <p className="font-arabic text-xs text-[#E5BE6A] mt-0.5" dir="rtl">
                  {arabicTitle}
                </p>
              </div>
            </div>

            <p className="text-sm text-[#C3C9C2] leading-relaxed max-w-sm">
              {aboutText}
            </p>

            <div className="pt-2 text-xs text-[#E5BE6A] font-medium">
              {motto}
            </div>
          </div>

          {/* Column 2: Institutional Legacy */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-[#E5BE6A]">
              Heritage & History
            </h3>
            <ul className="space-y-2 text-sm text-[#C3C9C2]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About the Club
                </Link>
              </li>
              <li>
                <Link href="/founders" className="hover:text-white transition-colors">
                  Founders Archive
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-white transition-colors">
                  Chronological Timeline
                </Link>
              </li>
              <li>
                <Link href="/leadership" className="hover:text-white transition-colors">
                  Former Committees
                </Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-white transition-colors">
                  Member Directory
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Operations & Community */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-[#E5BE6A]">
              Operations & Media
            </h3>
            <ul className="space-y-2 text-sm text-[#C3C9C2]">
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Annual 12-Month Plan
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-white transition-colors">
                  Photo & Media Archive
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors">
                  Arabic Learning Hub
                </Link>
              </li>
              <li>
                <Link href="/publications" className="hover:text-white transition-colors">
                  Magazines & Bulletins
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors">
                  Official Announcements
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-white transition-colors">
                  Membership Application
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance & Policies */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-[#E5BE6A]">
              Governance & Policies
            </h3>
            <ul className="space-y-2 text-sm text-[#C3C9C2]">
              <li>
                <Link href="/policies" className="hover:text-white transition-colors">
                  Privacy & Data Retention
                </Link>
              </li>
              <li>
                <Link href="/policies#consent" className="hover:text-white transition-colors">
                  Photo Publication Consent
                </Link>
              </li>
              <li>
                <Link href="/policies#accessibility" className="hover:text-white transition-colors">
                  WCAG 2.2 AA Accessibility
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Partnerships
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-[#E5BE6A] hover:underline font-semibold"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin CMS Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#C3C9C2]">
          <div>
            © {new Date().getFullYear()} {copyrightText}
          </div>
          <div className="flex items-center gap-4">
            <span>Preserving Heritage Since Inception</span>
            <span>•</span>
            <Link href="/policies" className="hover:text-white transition-colors">
              Terms & Legal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
