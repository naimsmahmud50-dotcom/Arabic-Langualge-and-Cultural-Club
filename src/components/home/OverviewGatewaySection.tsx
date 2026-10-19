/**
 * DEVELOPER NOTE:
 * Page/Component: src/components/home/OverviewGatewaySection.tsx
 * Module: Home Dashboard Overview Hub
 * Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)
 * Society: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
 * 
 * ARCHITECTURE & ROLE:
 * - Serves as the central navigation gateway on the streamlined root homepage (/),
 *   allowing visitors to quickly navigate to dedicated standalone pages instead of
 *   rendering exhaustive vertical catalogs on a single monolithic page.
 * - Displays 6 primary institutional division cards with live data summaries:
 *   1. Academic Calendar & Events (/events)
 *   2. Photo & Media Archive (/gallery)
 *   3. Arabic Learning Library (/resources)
 *   4. Official Gazettes & Notices (/news)
 *   5. Society Leadership & Founders (/founders, /leadership)
 *   6. Literary Publications & Awards (/publications)
 * 
 * HUMAN VIBE & ACCESSIBILITY:
 * - Strictly zero AI emojis. Clean Lucide SVG icons.
 * - WCAG 2.2 AA compliant contrast, touch targets >= 44px, and screen-reader semantics.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { 
  Calendar, 
  Image as ImageIcon, 
  BookOpen, 
  Bell, 
  Award, 
  Users, 
  ArrowRight, 
  Compass, 
  Clock, 
  MapPin,
  Sparkles
} from "lucide-react";

interface OverviewGatewaySectionProps {
  stats: {
    upcomingEventsCount: number;
    nextEventTitle?: string | null;
    nextEventDate?: string | null;
    albumsCount: number;
    latestAlbumTitle?: string | null;
    resourcesCount: number;
    announcementsCount: number;
    latestAnnouncementTitle?: string | null;
    activeTermTitle?: string | null;
    publicationsCount: number;
  };
}

export function OverviewGatewaySection({ stats }: OverviewGatewaySectionProps) {
  const gateways = [
    {
      titleEn: "Academic Calendar & Events",
      titleAr: "التقويم الأكاديمي والفعاليات",
      description: "Official schedule of symposia, classical Arabic debates, seasonal lectures, and 12-month annual milestones.",
      icon: Calendar,
      href: "/events",
      badge: stats.upcomingEventsCount > 0 ? `${stats.upcomingEventsCount} Scheduled` : "Annual Schedule",
      accent: stats.upcomingEventsCount > 0,
      highlight: stats.nextEventTitle ? `Next: ${stats.nextEventTitle}` : "Explore upcoming colloquia and symposia",
      cta: "View Full Calendar & Events",
    },
    {
      titleEn: "Photo & Media Archive",
      titleAr: "أرشيف الصور والوسائط",
      description: "Permanent photographic documentation preserving club conferences, award ceremonies, and calligraphy exhibitions.",
      icon: ImageIcon,
      href: "/gallery",
      badge: `${stats.albumsCount} Collections`,
      accent: false,
      highlight: stats.latestAlbumTitle ? `Featured: ${stats.latestAlbumTitle}` : "Curated photographic albums",
      cta: "Explore Visual Archives",
    },
    {
      titleEn: "Arabic Learning Resources",
      titleAr: "مركز الموارد اللغوية",
      description: "Classical linguistic treatises, Nahw & Sarf cheat sheets, rhetorical manuals (Balaghah), and vocabulary reference guides.",
      icon: BookOpen,
      href: "/resources",
      badge: `${stats.resourcesCount} Materials`,
      accent: false,
      highlight: "Grammar, syntax, rhetoric, and classical literature reference materials",
      cta: "Browse Learning Library",
    },
    {
      titleEn: "Gazettes & Announcements",
      titleAr: "الإعلانات والبيانات الرسمية",
      description: "Official administrative communiqués, election notices, scholarly symposium calls, and gazette releases.",
      icon: Bell,
      href: "/news",
      badge: stats.announcementsCount > 0 ? `${stats.announcementsCount} Notices` : "Bulletins",
      accent: false,
      highlight: stats.latestAnnouncementTitle ? `Latest: ${stats.latestAnnouncementTitle}` : "Official secretarial bulletins",
      cta: "Read All Announcements",
    },
    {
      titleEn: "Founders & Governance",
      titleAr: "المؤسسون والمجالس الإدارية",
      description: "Permanent roll of honor recognizing founding conveners, faculty patrons, and academic term committee officeholders.",
      icon: Users,
      href: "/leadership",
      badge: stats.activeTermTitle || "Governing Council",
      accent: false,
      highlight: "Term-by-term historical preservation with verified officeholders",
      cta: "View Leadership Roster",
    },
    {
      titleEn: "Publications & Roll of Honor",
      titleAr: "المنشورات وسجل الشرف",
      description: "Official society periodicals including 'Al-Bayan', monographs, research papers, and varsity debate championship awards.",
      icon: Award,
      href: "/publications",
      badge: `${stats.publicationsCount} Publications`,
      accent: false,
      highlight: "Academic periodicals and distinguished collegiate honors",
      cta: "Inspect Publications & Awards",
    },
  ];

  return (
    <section 
      className="py-16 sm:py-20 bg-[var(--bg-surface)] border-b border-[var(--border-color)]"
      aria-label="Institutional Gateway Portals"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="accent" size="sm">
            Institutional Portals
          </Badge>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] font-serif tracking-tight">
            Explore Society Divisions & Archives
          </h2>
          <p className="font-arabic text-sm sm:text-base text-[var(--brand-accent)] font-medium" dir="rtl">
            تصفح الأقسام الأكاديمية والفعاليات والأرشيف الرقمي المستقل
          </p>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed pt-1">
            Each major division operates as a dedicated standalone portal with full archival records, deep-linking, and independent filtering.
          </p>
        </div>

        {/* 6 Grid Gateways */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gateways.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card 
                key={idx} 
                hoverElevate 
                className="border-[var(--border-color)] bg-[var(--bg-surface-elevated)] flex flex-col justify-between transition-all duration-200"
              >
                <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Top Row: Icon and Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center">
                        <Icon className="w-5 h-5 stroke-[1.75]" />
                      </div>
                      <Badge 
                        variant={item.accent ? "accent" : "neutral"} 
                        size="sm"
                        className="text-2xs"
                      >
                        {item.badge}
                      </Badge>
                    </div>

                    {/* Titles */}
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                        {item.titleEn}
                      </h3>
                      <p className="font-arabic text-xs text-[var(--brand-accent)] mt-0.5" dir="rtl">
                        {item.titleAr}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {item.description}
                    </p>

                    {/* Micro Highlight Snippet */}
                    <div className="p-2.5 rounded-[4px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-2xs text-[var(--text-muted)] line-clamp-1 italic">
                      {item.highlight}
                    </div>
                  </div>

                  {/* Action Link Button */}
                  <div className="pt-3 border-t border-[var(--border-subtle)] mt-2">
                    <Link href={item.href} className="block">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-xs font-semibold text-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/10 px-2"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        <span>{item.cta}</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
