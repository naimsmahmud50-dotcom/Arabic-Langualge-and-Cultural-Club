/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/layout/Header.tsx
 * Updated masthead brand identity with official Arabic Language & Cultural Club crest.
 * Institution: Kabi Nazrul Government College, Dhaka / كلية كابي نذرول الحكومية
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/layout/Header.tsx
 * @description Public institutional navigation header for the Arabic Language & Cultural Club.
 * 
 * DEVELOPER USAGE NOTE:
 * - Features:
 *   - Official brand crest (<ClubLogo variant="crest" />) & bilingual title
 *   - Desktop primary navigation links with dynamic translation
 *   - Language selector dropdown (EN, العربية, বাংলা) via `<LanguageSwitcher />`
 *   - Theme toggle (Light/Dark mode) via `<ThemeToggle />`
 *   - "Join Club" action button with RTL-aware layout
 *   - Mobile drawer trigger button
 * - Connects with `useTranslation()` from `@/lib/i18n/context`.
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, ThemeToggle, ClubLogo } from "@/components/ui";
import { Menu, Shield, ArrowUpRight } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";
import { type SiteSettings, DEFAULT_NAV_ITEMS } from "@/lib/types/settings";

export interface HeaderProps {
  settings?: SiteSettings;
}

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { t, isRTL } = useTranslation();

  const brandTitle = settings?.club_short_name_en || settings?.club_name_en || "Arabic Language & Cultural Club";
  const collegeTitle = settings?.college_name_en || "Kabi Nazrul Government College, Dhaka";
  const arabicTitle = settings?.club_name_ar || "نادي اللغة والثقافة العربية - كلية كابي نذرول الحكومية";
  const logoCrestUrl = settings?.logo_crest_url || undefined;

  const rawMenu = settings?.navigation_menu && settings.navigation_menu.length > 0 
    ? settings.navigation_menu 
    : DEFAULT_NAV_ITEMS;

  const activeMenuItems = rawMenu
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const navLinks = activeMenuItems.map((item) => ({
    label: isRTL ? (item.labelAr || item.labelEn) : (item.labelEn || item.labelAr),
    href: item.href,
  }));

  const ctaLabel = isRTL 
    ? (settings?.nav_cta_label_ar || t("nav.joinClub", "انضم للنادي")) 
    : (settings?.nav_cta_label_en || t("nav.joinClub", "Join Club"));
  const ctaLink = settings?.nav_cta_link || "/membership";

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-color)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Brand Logo & Name */}
            <Link
              href="/"
              className="flex items-center gap-3.5 group select-none shrink-0"
              title={`${brandTitle} - ${collegeTitle}`}
            >
              {/* Official Club Crest */}
              <ClubLogo 
                variant="crest" 
                size="md" 
                src={logoCrestUrl}
                priority
                className="group-hover:scale-[1.03] transition-transform drop-shadow-xs" 
              />
              
              <div className="flex flex-col text-start">
                <span className="font-bold text-sm sm:text-base leading-tight tracking-tight text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors">
                  {brandTitle}
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-[var(--text-secondary)] leading-tight mt-0.5">
                  {collegeTitle}
                </span>
                <span className="font-arabic text-[11px] sm:text-xs text-[var(--brand-accent)] font-medium leading-none mt-1" dir="rtl">
                  {arabicTitle}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    className={cn(
                      "px-2.5 py-1.5 rounded-[5px] text-xs font-semibold tracking-wide transition-colors duration-150 whitespace-nowrap",
                      isActive
                        ? "bg-[var(--bg-surface-hover)] text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]/60"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {/* Admin Portal Shortcut */}
              <Link 
                href="/admin" 
                className="hidden sm:inline-flex" 
                title={t("nav.adminPortal", "Admin Portal")}
              >
                <Button variant="ghost" size="sm" leftIcon={<Shield className="w-3.5 h-3.5" />}>
                  {t("nav.adminPortal", "Admin")}
                </Button>
              </Link>

              {/* Language Selector Dropdown */}
              <LanguageSwitcher variant="compact" />

              {/* Theme Switcher */}
              <ThemeToggle />

              {/* Apply / Join CTA */}
              <Link href={ctaLink} className="hidden sm:inline-flex">
                <Button 
                  variant="accent" 
                  size="sm" 
                  rightIcon={<ArrowUpRight className={cn("w-3.5 h-3.5", isRTL && "rotate-270")} />}
                >
                  {ctaLabel}
                </Button>
              </Link>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="xl:hidden p-2 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                aria-label="Open mobile navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        links={navLinks}
      />
    </>
  );
}
