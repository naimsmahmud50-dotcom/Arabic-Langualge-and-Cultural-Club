/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/layout/MobileNav.tsx
 * Redesigned accessible slide-over drawer navigation for mobile and tablet screens (< 1024px).
 * Institution: Kabi Nazrul Government College, Dhaka
 * Society: Arabic Language & Cultural Club
 * 
 * DESIGN INVARIANTS:
 * - Grouped Navigation Accordion: About, Activities, Library, News, Contact.
 * - Auto-expands accordion containing the active route.
 * - Supports RTL mirroring: slides from left in RTL mode and from right in LTR mode.
 * - Body overflow locking while drawer is open.
 * - Backdrop click and Escape key dismissal.
 * - Minimum 44px touch targets on operable elements.
 * - Strictly zero AI emojis. Clean Lucide SVG icons.
 */

"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronDown, ArrowRight } from "lucide-react";
import { ThemeToggle, ClubLogo } from "@/components/ui";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";

export interface MobileNavChildItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface MobileNavGroup {
  id: string;
  label: string;
  href?: string;
  children?: MobileNavChildItem[];
}

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  groups?: MobileNavGroup[];
  links?: Array<{ label: string; href: string }>;
  brandTitle?: string;
  collegeTitle?: string;
  arabicTitle?: string;
  logoSrc?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export function MobileNav({
  isOpen,
  onClose,
  groups = [],
  links = [],
  brandTitle = "Arabic Club",
  collegeTitle = "Kabi Nazrul Govt. College, Dhaka",
  arabicTitle = "نادي اللغة والثقافة العربية",
  logoSrc,
  ctaLabel = "Join Club",
  ctaLink = "/membership",
}: MobileNavProps) {
  const pathname = usePathname();
  const { t, isRTL } = useTranslation();

  // Track accordion state for grouped navigation
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  // Auto-expand accordion that contains the active route
  useEffect(() => {
    if (!isOpen) return;
    const initialOpen: Record<string, boolean> = {};
    groups.forEach((group) => {
      if (group.children?.some((child) => pathname === child.href || (child.href !== "/" && pathname.startsWith(child.href)))) {
        initialOpen[group.id] = true;
      }
    });
    setOpenAccordions(prev => ({ ...prev, ...initialOpen }));
  }, [isOpen, pathname, groups]);

  // Close drawer strictly on route change (not on mount)
  const lastPathnameRef = useRef(pathname);
  useEffect(() => {
    if (lastPathnameRef.current !== pathname) {
      lastPathnameRef.current = pathname;
      onClose();
    }
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

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 lg:hidden" 
      role="dialog" 
      aria-modal="true" 
      aria-label="Mobile Navigation Menu"
    >
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
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[var(--border-color)]">
            <Link href="/" onClick={onClose} className="flex items-center gap-3 select-none min-w-0">
              <ClubLogo 
                variant="crest" 
                size="custom" 
                src={logoSrc} 
                priority 
                className="w-10 h-10 shrink-0 drop-shadow-xs" 
              />
              <div className="flex flex-col text-start min-w-0">
                <span className="font-bold text-[15px] text-[var(--text-primary)] leading-tight truncate">
                  {brandTitle}
                </span>
                <span className="text-[11px] text-[var(--text-secondary)] font-medium leading-tight mt-0.5 truncate">
                  {collegeTitle}
                </span>
                <span className="text-[10.5px] text-[var(--brand-accent)] font-arabic leading-tight mt-0.5 truncate" dir="rtl">
                  {arabicTitle}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)] shrink-0"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Grouped Accordion Menu */}
          <nav className="flex flex-col gap-1.5 py-5" aria-label="Mobile Navigation Groups">
            {groups.length > 0 ? (
              groups.map((group) => {
                const hasChildren = Boolean(group.children && group.children.length > 0);
                const isExpanded = Boolean(openAccordions[group.id]);
                const isGroupActive = hasChildren
                  ? group.children?.some((c) => pathname === c.href || (c.href !== "/" && pathname.startsWith(c.href)))
                  : pathname === group.href;

                if (!hasChildren && group.href) {
                  // Flat navigation item (News, Contact)
                  return (
                    <Link
                      key={group.id}
                      href={group.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-[14px] font-semibold transition-colors min-h-[44px]",
                        isGroupActive
                          ? "bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] font-bold shadow-2xs"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                      )}
                    >
                      <span>{group.label}</span>
                      <ArrowRight className={cn("w-4 h-4 opacity-70", isRTL && "rotate-180")} aria-hidden="true" />
                    </Link>
                  );
                }

                // Accordion Section (About, Activities, Library)
                return (
                  <div key={group.id} className="rounded-[8px] overflow-hidden border border-transparent transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(group.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`mobile-accordion-${group.id}`}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-[8px] text-[14px] font-semibold transition-colors min-h-[44px] cursor-pointer text-start",
                        isGroupActive
                          ? "text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-bold bg-[var(--bg-surface-hover)]/70"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]/40"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {group.label}
                        {isGroupActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] shrink-0" aria-hidden="true" />
                        )}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 shrink-0",
                          isExpanded && "rotate-180 text-[var(--brand-accent)]"
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {isExpanded && group.children && (
                      <div 
                        id={`mobile-accordion-${group.id}`} 
                        className="ps-3 pe-1 pt-1 pb-2 space-y-1"
                      >
                        {group.children.map((child) => {
                          const isChildActive = pathname === child.href || (child.href !== "/" && pathname.startsWith(child.href));
                          const Icon = child.icon;

                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onClose}
                              className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-colors min-h-[40px]",
                                isChildActive
                                  ? "bg-[var(--brand-primary)]/10 dark:bg-[var(--brand-accent)]/15 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-bold"
                                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                              )}
                            >
                              <Icon className="w-3.5 h-3.5 text-[var(--brand-accent)] shrink-0" aria-hidden="true" />
                              <div className="flex flex-col min-w-0 text-start">
                                <span className="leading-tight">{child.label}</span>
                                {child.description && (
                                  <span className="text-[10.5px] text-[var(--text-muted)] leading-tight mt-0.5 truncate">
                                    {child.description}
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Fallback for flat links if groups are omitted
              links.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-[6px] text-sm font-semibold transition-colors min-h-[44px]",
                      isActive
                        ? "bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] font-bold shadow-2xs"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                    )}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className={cn("w-3.5 h-3.5 opacity-60", isRTL && "rotate-180")} aria-hidden="true" />
                  </Link>
                );
              })
            )}
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

          {/* Primary Gold CTA */}
          <div className="pt-2">
            <Link href={ctaLink} onClick={onClose} className="block w-full">
              <button
                type="button"
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[6px]",
                  "bg-[var(--brand-accent)] text-[#17211D] font-bold text-[13.5px] tracking-wide",
                  "hover:brightness-105 active:scale-[0.98] transition-all shadow-xs cursor-pointer select-none"
                )}
              >
                <span>{ctaLabel}</span>
                <ArrowRight className={cn("w-3.5 h-3.5", isRTL && "rotate-180")} aria-hidden="true" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
