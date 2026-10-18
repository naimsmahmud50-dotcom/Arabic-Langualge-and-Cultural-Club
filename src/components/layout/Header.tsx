/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/layout/Header.tsx
 * Updated masthead brand identity to Kabi Nazrul Government College, Dhaka / كلية كابي نذرول الحكومية.
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/layout/Header.tsx
 * @description Public institutional navigation header for the Arabic Language & Cultural Club.
 * 
 * DEVELOPER USAGE NOTE:
 * - Features:
 *   - Brand logo & bilingual emblem badge
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
import { Button, ThemeToggle } from "@/components/ui";
import { Menu, Shield, ArrowUpRight } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";

export function Header() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { t, isRTL } = useTranslation();

  const navLinks = [
    { label: t("nav.about", "About"), href: "/about" },
    { label: t("nav.history", "History"), href: "/history" },
    { label: t("nav.founders", "Founders"), href: "/founders" },
    { label: t("nav.leadership", "Leadership"), href: "/leadership" },
    { label: t("nav.calendar", "Calendar"), href: "/events" },
    { label: t("nav.gallery", "Gallery"), href: "/gallery" },
    { label: t("nav.resources", "Resources"), href: "/resources" },
    { label: t("nav.news", "News"), href: "/news" },
    { label: t("nav.contact", "Contact"), href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-color)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Brand Logo & Name */}
            <Link
              href="/"
              className="flex items-center gap-3.5 group select-none shrink-0"
              aria-label="Arabic Language & Cultural Club Home"
            >
              {/* Emblem Tile */}
              <div className="w-11 h-11 rounded-[6px] bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] flex items-center justify-center font-bold text-lg border border-[var(--brand-accent)] shadow-xs group-hover:scale-[1.02] transition-transform">
                <span className="font-arabic font-bold text-xl">ض</span>
              </div>
              
              <div className="flex flex-col text-start">
                <span className="font-bold text-sm sm:text-base leading-tight tracking-tight text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors">
                  Arabic Language & Cultural Club
                </span>
                <span className="text-[11px] sm:text-xs font-medium text-[var(--text-secondary)] leading-tight mt-0.5">
                  Kabi Nazrul Government College, Dhaka
                </span>
                <span className="font-arabic text-[11px] sm:text-xs text-[var(--brand-accent)] font-medium leading-none mt-1" dir="rtl">
                  نادي اللغة والثقافة العربية - كلية كابي نذرول الحكومية
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1.5" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-1.5 rounded-[5px] text-xs font-semibold tracking-wide transition-colors duration-150",
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
              <Link href="/membership" className="hidden sm:inline-flex">
                <Button 
                  variant="accent" 
                  size="sm" 
                  rightIcon={<ArrowUpRight className={cn("w-3.5 h-3.5", isRTL && "rotate-270")} />}
                >
                  {t("nav.joinClub", "Join Club")}
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
