/**
 * @file Header.tsx
 * @description Public institutional navigation header for the Arabic Language & Cultural Club.
 * Features:
 * - Brand logo & bilingual emblem badge
 * - Desktop primary navigation links
 * - Theme toggle (Light/Dark mode)
 * - Language selector shortcut (EN / AR)
 * - "Join Club" action button
 * - Mobile drawer trigger button
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, ThemeToggle, Badge } from "@/components/ui";
import { Menu, Globe, Shield, ArrowUpRight } from "lucide-react";
import { MobileNav } from "./MobileNav";

export const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "History", href: "/history" },
  { label: "Founders", href: "/founders" },
  { label: "Leadership", href: "/leadership" },
  { label: "Calendar", href: "/events" },
  { label: "Gallery", href: "/gallery" },
  { label: "Resources", href: "/resources" },
  { label: "News", href: "/news" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
              
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg leading-tight tracking-tight text-[var(--text-primary)] group-hover:text-[var(--brand-accent)] transition-colors">
                  Arabic Language & Cultural Club
                </span>
                <span className="font-arabic text-xs text-[var(--brand-accent)] font-medium leading-none mt-1" dir="rtl">
                  نادي اللغة والثقافة العربية
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1.5" aria-label="Main Navigation">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-[5px] text-xs font-semibold tracking-wide transition-colors duration-150 ${
                      isActive
                        ? "bg-[var(--bg-surface-hover)] text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-bold"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]/60"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2.5">
              {/* Admin Portal Shortcut */}
              <Link href="/admin" className="hidden sm:inline-flex" title="Administrative CMS Portal">
                <Button variant="ghost" size="sm" leftIcon={<Shield className="w-3.5 h-3.5" />}>
                  Admin
                </Button>
              </Link>

              {/* Theme Switcher */}
              <ThemeToggle />

              {/* Apply / Join CTA */}
              <Link href="/membership" className="hidden sm:inline-flex">
                <Button variant="accent" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                  Join Club
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
        links={NAV_LINKS}
      />
    </>
  );
}
