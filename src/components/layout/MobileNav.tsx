/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/layout/MobileNav.tsx
 * Updated mobile drawer header identity to Kabi Nazrul Govt. College, Dhaka.
 * Strictly human vibe; zero AI emojis.
 *
 * @file src/components/layout/MobileNav.tsx
 * @description Accessible slide-over drawer navigation for mobile and tablet screens.
 * 
 * DEVELOPER USAGE NOTE:
 * - Supports RTL mirroring: slides from left in RTL mode and from right in LTR mode.
 * - Features:
 *   - Backdrop click to dismiss and ESC key handler
 *   - Body overflow locking while drawer is open
 *   - Language Switcher (`<LanguageSwitcher variant="full" />`)
 *   - Theme Toggle (`<ThemeToggle showLabel />`)
 *   - Translated navigation links and CTAs
 * - Human-crafted: strictly zero AI emojis; clean semantic tokens.
 */

"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowRight, Shield } from "lucide-react";
import { Button, ThemeToggle } from "@/components/ui";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ label: string; href: string }>;
}

export function MobileNav({ isOpen, onClose, links }: MobileNavProps) {
  const pathname = usePathname();
  const { t, isRTL } = useTranslation();

  // Close on route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel: RTL aware positioning */}
      <div
        className={cn(
          "fixed inset-y-0 w-full max-w-xs sm:max-w-sm bg-[var(--bg-surface)] shadow-[var(--shadow-elevated)] p-6 flex flex-col justify-between overflow-y-auto z-10 duration-200",
          isRTL
            ? "left-0 border-r border-[var(--border-color)] animate-in slide-in-from-left"
            : "right-0 border-l border-[var(--border-color)] animate-in slide-in-from-right"
        )}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[4px] bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] flex items-center justify-center font-bold text-sm">
                ض
              </div>
              <div className="flex flex-col text-start">
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  {t("nav.home", "Arabic Club")}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                  Kabi Nazrul Govt. College, Dhaka
                </span>
                <span className="text-[10px] text-[var(--brand-accent)] font-arabic" dir="rtl">
                  نادي اللغة والثقافة العربية - كلية كابي نذرول
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-1 py-5" aria-label="Mobile Navigation Links">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-[6px] text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-[var(--brand-primary)] text-[var(--brand-primary-fg)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                  )}
                >
                  <span>{link.label}</span>
                  <ArrowRight className={cn("w-3.5 h-3.5 opacity-60", isRTL && "rotate-180")} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions & Preferences */}
        <div className="pt-5 border-t border-[var(--border-color)] space-y-4">
          {/* Language Switcher in Drawer */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[var(--text-muted)] block text-start">
              {t("common.language", "Language / اللغة")}
            </span>
            <LanguageSwitcher variant="full" className="w-full" />
          </div>

          {/* Theme Toggle in Drawer */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              {t("common.theme", "Interface Theme")}
            </span>
            <ThemeToggle showLabel />
          </div>

          {/* CTA Buttons */}
          <div className="space-y-2 pt-2">
            <Link href="/membership" className="block w-full">
              <Button variant="accent" className="w-full justify-center">
                {t("nav.joinClub", "Join Club")}
              </Button>
            </Link>

            <Link href="/admin" className="block w-full">
              <Button variant="outline" className="w-full justify-center" leftIcon={<Shield className="w-3.5 h-3.5" />}>
                {t("nav.adminPortal", "Admin Portal")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
