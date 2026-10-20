/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/layout/Header.tsx
 * Master institutional redesign of the site header/navbar.
 * Institution: Kabi Nazrul Government College, Dhaka (كلية كابي نذرول الحكومية)
 * Society: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
 * 
 * ARCHITECTURAL SPECIFICATIONS COMPLETED:
 * 1. Brand Block:
 *    - Logo: Official club crest rendered at 48-52px with priority loading.
 *    - Club Name: Bold 20-22px on one line desktop with anti-truncation and hover accent.
 *    - College Name: 12-13px muted collegiate title below.
 *    - Arabic Line: Antique brass gold calligraphic title beside/below without exceeding 80px.
 *    - Desktop Header Height: Strictly 72-80px (80px default, smoothly shrinking to 72px on scroll).
 * 
 * 2. Grouped 5-Item Navigation Structure:
 *    - About: [About (/about), History (/history), Founders (/founders), Leadership (/leadership)]
 *    - Activities: [Calendar (/events), Gallery (/gallery)]
 *    - Library: [Resources (/resources), Publications (/publications)]
 *    - News: Direct link (/news)
 *    - Contact: Direct link (/contact)
 *    - Full Dropdown Accessibility: Keyboard navigable (Enter/Space to toggle, ArrowUp/Down to traverse,
 *      Escape to dismiss, Tab to advance), hover/focus debounced, outside-click dismiss, and ARIA compliant.
 * 
 * 3. Right Action Controls:
 *    - "Join Club": Primary gold button with arrow icon, generous padding, zero text wrapping.
 *    - Language Switcher: Compact icon button with dropdown (EN, العربية, বাংলা).
 *    - Theme Toggle: Compact icon button with light/dark transition.
 *    - Admin Portal: Moved out of public header into footer (small lock icon appears only if active session exists).
 * 
 * 4. Micro-Interactions & Styling:
 *    - Sticky header with scroll detection, subtle blur, and elevation shadow.
 *    - Active item indicator: Gold underline with smooth scale-in and parent highlight.
 *    - Transitions respect prefers-reduced-motion.
 *    - Full RTL mirroring support via logical Tailwind classes (ms-, me-, ps-, pe-, start-, end-).
 * 
 * Strictly zero AI emojis. Clean SVG icons from lucide-react.
 */

"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  ChevronDown, 
  ArrowRight, 
  Lock, 
  BookOpen, 
  History, 
  Award, 
  Shield, 
  Calendar, 
  Camera, 
  FileText, 
  Sparkles 
} from "lucide-react";
import { ThemeToggle, ClubLogo } from "@/components/ui";
import { MobileNav, type MobileNavGroup } from "./MobileNav";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils/cn";
import { type SiteSettings } from "@/lib/types/settings";

export interface HeaderProps {
  settings?: SiteSettings;
}

interface NavChildItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroupItem {
  id: string;
  label: string;
  href?: string;
  children?: NavChildItem[];
}

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [hasAdminSession, setHasAdminSession] = useState(false);
  const { t, isRTL } = useTranslation();

  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Stable callback for closing mobile nav
  const handleCloseMobileNav = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  // Brand text strings derived from settings / defaults
  const brandTitle = settings?.club_short_name_en || settings?.club_name_en || "Arabic Language & Cultural Club";
  const collegeTitle = settings?.college_name_en || "Kabi Nazrul Government College, Dhaka";
  const arabicTitle = settings?.club_name_ar || "نادي اللغة والثقافة العربية - كلية كابي نذرول الحكومية";
  const logoCrestUrl = settings?.logo_crest_url || undefined;

  // CTA button configuration
  const ctaLabel = isRTL 
    ? (settings?.nav_cta_label_ar || t("nav.joinClub", "انضم للنادي")) 
    : (settings?.nav_cta_label_en || t("nav.joinClub", "Join Club"));
  const ctaLink = settings?.nav_cta_link || "/membership";

  // Helper to dynamically read custom labels from settings navigation_menu if customized
  const getNavLabel = useCallback((href: string, fallbackKey: string, fallbackText: string) => {
    const customItem = settings?.navigation_menu?.find((m) => m.href === href);
    if (customItem) {
      if (isRTL && customItem.labelAr) return customItem.labelAr;
      if (!isRTL && customItem.labelEn) return customItem.labelEn;
    }
    return t(fallbackKey, fallbackText);
  }, [settings?.navigation_menu, isRTL, t]);

  // Check if admin session cookie exists (strictly show lock icon only if admin session exists)
  useEffect(() => {
    const hasSession = document.cookie.split(";").some((c) => c.trim().startsWith("arabic_club_session="));
    setHasAdminSession(hasSession);
  }, []);

  // Sticky header scroll elevation and shrink behavior (80px -> 72px)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  // Handle outside click and Escape key dismissal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 5 Grouped Navigation Items (About, Activities, Library, News, Contact)
  const navGroups: NavGroupItem[] = useMemo(() => [
    {
      id: "about",
      label: isRTL ? "عن النادي" : t("nav.about", "About"),
      children: [
        {
          id: "about-club",
          label: getNavLabel("/about", "nav.about", "About the Club"),
          href: "/about",
          description: isRTL ? "الرؤية والرسالة والميثاق الدستوري" : "Vision, charter, and constitutional mission",
          icon: BookOpen,
        },
        {
          id: "history",
          label: getNavLabel("/history", "nav.history", "History & Milestones"),
          href: "/history",
          description: isRTL ? "المحطات التاريخية والنشأة" : "Chronological milestones and heritage",
          icon: History,
        },
        {
          id: "founders",
          label: getNavLabel("/founders", "nav.founders", "Founders Archive"),
          href: "/founders",
          description: isRTL ? "المجلس التأسيسي والرواد الأوائل" : "Founding assembly and conveners",
          icon: Award,
        },
        {
          id: "leadership",
          label: getNavLabel("/leadership", "nav.leadership", "Executive Leadership"),
          href: "/leadership",
          description: isRTL ? "المجالس القيادية والهيئات السابقة" : "Governing council and past committees",
          icon: Shield,
        },
      ],
    },
    {
      id: "activities",
      label: isRTL ? "الأنشطة" : t("nav.activities", "Activities"),
      children: [
        {
          id: "calendar",
          label: getNavLabel("/events", "nav.calendar", "Calendar & Annual Plan"),
          href: "/events",
          description: isRTL ? "الخطة السنوية والتقويم الأكاديمي" : "12-month master curriculum and gatherings",
          icon: Calendar,
        },
        {
          id: "gallery",
          label: getNavLabel("/gallery", "nav.gallery", "Photo & Media Archive"),
          href: "/gallery",
          description: isRTL ? "معرض الصور والأرشيف المرئي" : "Visual recordings and symposium imagery",
          icon: Camera,
        },
      ],
    },
    {
      id: "library",
      label: isRTL ? "المكتبة" : t("nav.library", "Library"),
      children: [
        {
          id: "resources",
          label: getNavLabel("/resources", "nav.resources", "Learning Resources"),
          href: "/resources",
          description: isRTL ? "المخطوطات والمعاجم والدراسات اللغوية" : "Classical treatises and study guides",
          icon: FileText,
        },
        {
          id: "publications",
          label: getNavLabel("/publications", "nav.publications", "Publications & Honor Roll"),
          href: "/publications",
          description: isRTL ? "المجلات الأكاديمية وسجل الشرف" : "Academic journals and roll of honor",
          icon: Sparkles,
        },
      ],
    },
    {
      id: "news",
      label: getNavLabel("/news", "nav.news", isRTL ? "الأخبار" : "News"),
      href: "/news",
    },
    {
      id: "contact",
      label: getNavLabel("/contact", "nav.contact", isRTL ? "تواصل معنا" : "Contact"),
      href: "/contact",
    },
  ], [isRTL, t, getNavLabel]);

  // Hover handlers with debounce protection
  const handleMouseEnter = (id: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown(id);
  };

  const handleMouseLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Keyboard navigation for dropdown triggers
  const handleTriggerKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActiveDropdown(id);
      setTimeout(() => {
        const menu = document.getElementById(`dropdown-${id}`);
        const firstItem = menu?.querySelector<HTMLAnchorElement>('[role="menuitem"]');
        firstItem?.focus();
      }, 50);
    } else if (e.key === "Escape") {
      setActiveDropdown(null);
    }
  };

  // Keyboard traversal inside dropdown menus
  const handleMenuKeyDown = (e: React.KeyboardEvent, groupId: string) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setActiveDropdown(null);
      const trigger = document.getElementById(`nav-trigger-${groupId}`);
      trigger?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const next = target.nextElementSibling as HTMLElement;
      if (next && next.focus) next.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const prev = target.previousElementSibling as HTMLElement;
      if (prev && prev.focus) {
        prev.focus();
      } else {
        const trigger = document.getElementById(`nav-trigger-${groupId}`);
        trigger?.focus();
      }
    }
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full box-border border-b transition-[height,background-color,box-shadow,border-color] duration-200 motion-reduce:transition-none",
          isScrolled
            ? "h-[72px] bg-[var(--bg-surface)]/95 backdrop-blur-md shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.35)] border-[var(--border-color)]"
            : "h-[80px] bg-[var(--bg-surface)]/90 backdrop-blur-sm border-[var(--border-color)]/70"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between gap-2 sm:gap-4 h-full">
            {/* 1. Brand Identity Block */}
            <Link
              href="/"
              className="flex items-center gap-2.5 sm:gap-3.5 group select-none shrink-0"
              title={`${brandTitle} — ${collegeTitle}`}
            >
              {/* Official Crest: 48-52px */}
              <ClubLogo
                variant="crest"
                size="custom"
                src={logoCrestUrl}
                priority
                className="w-11 h-11 sm:w-12 sm:h-12 lg:w-[50px] lg:h-[50px] shrink-0 object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transform-none"
              />

              <div className="flex flex-col justify-center text-start">
                {/* Club Name: Bold 20-22px on one line desktop, clean truncate on small screens */}
                <span className="font-bold text-[16px] xs:text-[18px] sm:text-[20px] lg:text-[21px] xl:text-[22px] leading-tight tracking-tight text-[var(--text-primary)] max-w-[200px] xs:max-w-[240px] sm:max-w-none truncate sm:whitespace-nowrap group-hover:text-[var(--brand-accent)] transition-colors">
                  {brandTitle}
                </span>

                {/* College Name: 12-13px muted, with Arabic line beside it on sm+ */}
                <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                  <span className="text-[11.5px] sm:text-[12.5px] font-medium text-[var(--text-secondary)] leading-tight whitespace-nowrap">
                    {collegeTitle}
                  </span>
                  <span className="hidden sm:inline-block text-[var(--border-subtle)] text-[10px]" aria-hidden="true">•</span>
                  <span className="hidden sm:inline-block font-arabic text-[11px] sm:text-[11.5px] text-[var(--brand-accent)] font-medium leading-tight shrink-0" dir="rtl">
                    {arabicTitle}
                  </span>
                </div>
              </div>
            </Link>

            {/* 2. Desktop Navigation: 5 Grouped Items with Dropdowns (1024px+) */}
            <nav 
              ref={navContainerRef}
              className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0" 
              aria-label="Main Navigation"
            >
              {navGroups.map((group) => {
                const hasChildren = Boolean(group.children && group.children.length > 0);
                const isOpen = activeDropdown === group.id;

                // Active check: matches self, or any child route
                const isGroupActive = hasChildren
                  ? group.children?.some((child) => pathname === child.href || (child.href !== "/" && pathname.startsWith(child.href)))
                  : pathname === group.href || (group.href !== "/" && pathname.startsWith(group.href!));

                if (!hasChildren && group.href) {
                  // Flat navigation item (News, Contact)
                  return (
                    <Link
                      key={group.id}
                      href={group.href}
                      prefetch={false}
                      className={cn(
                        "relative inline-flex items-center py-2 px-3 rounded-[6px] text-[13.5px] font-semibold tracking-wide transition-colors duration-150 select-none whitespace-nowrap",
                        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]",
                        isGroupActive
                          ? "text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-bold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]/70",
                        "after:absolute after:bottom-0 after:start-2.5 after:end-2.5 after:h-[2.5px] after:bg-[var(--brand-accent)] after:rounded-full after:transition-all after:duration-200 motion-reduce:after:transition-none",
                        isGroupActive 
                          ? "after:opacity-100 after:scale-x-100" 
                          : "after:opacity-0 after:scale-x-50 hover:after:opacity-40 hover:after:scale-x-100"
                      )}
                    >
                      {group.label}
                    </Link>
                  );
                }

                // Dropdown Navigation Item (About, Activities, Library)
                return (
                  <div
                    key={group.id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(group.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      id={`nav-trigger-${group.id}`}
                      type="button"
                      onClick={() => setActiveDropdown(isOpen ? null : group.id)}
                      onKeyDown={(e) => handleTriggerKeyDown(e, group.id)}
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                      aria-controls={`dropdown-${group.id}`}
                      className={cn(
                        "relative inline-flex items-center gap-1.5 py-2 px-3 rounded-[6px] text-[13.5px] font-semibold tracking-wide transition-colors duration-150 cursor-pointer select-none",
                        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]",
                        isGroupActive
                          ? "text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-bold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]/70",
                        "after:absolute after:bottom-0 after:start-2.5 after:end-2.5 after:h-[2.5px] after:bg-[var(--brand-accent)] after:rounded-full after:transition-all after:duration-200 motion-reduce:after:transition-none",
                        isGroupActive 
                          ? "after:opacity-100 after:scale-x-100" 
                          : "after:opacity-0 after:scale-x-50 hover:after:opacity-40 hover:after:scale-x-100"
                      )}
                    >
                      <span>{group.label}</span>
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 shrink-0",
                          "motion-reduce:transition-none",
                          isOpen && "rotate-180 text-[var(--brand-accent)]"
                        )}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Accessible Dropdown Panel */}
                    {isOpen && group.children && (
                      <div
                        id={`dropdown-${group.id}`}
                        role="menu"
                        aria-label={group.label}
                        onKeyDown={(e) => handleMenuKeyDown(e, group.id)}
                        className={cn(
                          "absolute top-full z-50 mt-1 min-w-[270px] p-2 rounded-[10px]",
                          "bg-[var(--bg-surface)]/98 backdrop-blur-xl border border-[var(--border-color)]",
                          "shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)]",
                          "dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)]",
                          "transition-all duration-150 ease-out",
                          "motion-reduce:transition-none",
                          isRTL ? "right-0" : "left-0"
                        )}
                      >
                        <div className="space-y-0.5">
                          {group.children.map((child) => {
                            const isChildActive = pathname === child.href || (child.href !== "/" && pathname.startsWith(child.href));
                            const Icon = child.icon;

                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                role="menuitem"
                                tabIndex={0}
                                onClick={() => setActiveDropdown(null)}
                                className={cn(
                                  "group/item flex items-start gap-3 p-2.5 rounded-[8px] transition-colors duration-150",
                                  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]",
                                  isChildActive
                                    ? "bg-[var(--brand-primary)]/10 dark:bg-[var(--brand-accent)]/15 text-[var(--brand-primary)] dark:text-[var(--brand-accent)]"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
                                )}
                              >
                                <div
                                  className={cn(
                                    "p-1.5 rounded-[6px] shrink-0 mt-0.5 transition-colors",
                                    isChildActive
                                      ? "bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] dark:bg-[var(--brand-accent)] dark:text-[#17211D]"
                                      : "bg-[var(--bg-surface-hover)] text-[var(--text-muted)] group-hover/item:text-[var(--brand-accent)] group-hover/item:bg-[var(--bg-surface)]"
                                  )}
                                >
                                  <Icon className="w-4 h-4" aria-hidden="true" />
                                </div>
                                <div className="flex flex-col min-w-0 text-start">
                                  <span
                                    className={cn(
                                      "text-[13px] font-semibold leading-tight flex items-center justify-between gap-2",
                                      isChildActive
                                        ? "text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-bold"
                                        : "text-[var(--text-primary)]"
                                    )}
                                  >
                                    <span>{child.label}</span>
                                    {isChildActive && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-accent)] shrink-0" aria-hidden="true" />
                                    )}
                                  </span>
                                  {child.description && (
                                    <span className="text-[11px] text-[var(--text-muted)] leading-tight mt-1 line-clamp-1">
                                      {child.description}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* 3. Header Right Actions: Join Club CTA, Language, Theme, & Mobile Hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Admin Portal Shortcut (Subtle lock icon, rendered strictly only if session exists) */}
              {hasAdminSession && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex p-2 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--brand-accent)] hover:border-[var(--brand-accent)] hover:bg-[var(--bg-surface-hover)] transition-all cursor-pointer shadow-2xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
                  title={t("nav.adminPortal", "Admin Portal")}
                  aria-label={t("nav.adminPortal", "Admin Portal")}
                >
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}

              {/* Compact Language Selector Dropdown (visible sm+) */}
              <div className="hidden sm:inline-block">
                <LanguageSwitcher variant="compact" />
              </div>

              {/* Compact Theme Switcher (visible sm+) */}
              <div className="hidden sm:inline-block">
                <ThemeToggle />
              </div>

              {/* Primary Gold CTA Button: Join Club (No text wrapping, clear padding, arrow icon) */}
              <Link href={ctaLink} className="hidden sm:inline-flex shrink-0">
                <button
                  type="button"
                  className={cn(
                    "group inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-[6px]",
                    "bg-[var(--brand-accent)] text-[#17211D] font-bold text-[13px] sm:text-[13.5px] tracking-wide",
                    "hover:brightness-105 active:scale-[0.98] transition-all duration-150 shadow-xs cursor-pointer select-none",
                    "whitespace-nowrap shrink-0",
                    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--brand-accent)]"
                  )}
                >
                  <span>{ctaLabel}</span>
                  <ArrowRight 
                    className={cn(
                      "w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5",
                      isRTL && "rotate-180 group-hover:-translate-x-0.5"
                    )} 
                    aria-hidden="true" 
                  />
                </button>
              </Link>

              {/* Responsive Hamburger Trigger (Visible below 1024px) */}
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-2 rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
                aria-label="Open navigation menu"
                aria-expanded={mobileNavOpen}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 4. Responsive Mobile Drawer (Accordion navigation below 1024px) */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={handleCloseMobileNav}
        groups={navGroups}
        brandTitle={brandTitle}
        collegeTitle={collegeTitle}
        arabicTitle={arabicTitle}
        logoSrc={logoCrestUrl}
        ctaLabel={ctaLabel}
        ctaLink={ctaLink}
      />
    </>
  );
}
