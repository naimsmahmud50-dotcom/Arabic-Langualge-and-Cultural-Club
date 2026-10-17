/**
 * @file src/components/home/NewsAnnouncementsSection.tsx
 * @description Official News, Press Releases, and Institutional Bulletins.
 * 
 * ARCHITECTURAL ROLE:
 * - Broadcasts verified announcements directly from the club secretariat.
 * - Queries `getPublicAnnouncements({ limit: 3 })`.
 * - Meets Requirement SPEC-HOM-10 and SPEC-NWS-01.
 * 
 * CONSTRAINTS:
 * - Highlights pinned priority bulletins.
 * - Clear publication timestamps and category badges.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Bell, Pin, ArrowRight, Calendar, Newspaper } from "lucide-react";

interface AnnouncementItem {
  id: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  contentEn: string;
  contentAr?: string | null;
  category: string;
  isPinned: boolean;
  publishedAt: Date;
}

interface NewsAnnouncementsSectionProps {
  announcements: AnnouncementItem[];
}

export function NewsAnnouncementsSection({ announcements }: NewsAnnouncementsSectionProps) {
  return (
    <section className="py-20 bg-[var(--bg-primary)] border-b border-[var(--border-color)]" aria-label="News and Announcements">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="accent" size="sm">Secretariat Dispatches</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif">
              Latest News & Institutional Notices
            </h2>
            <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
              الْأَخْبَارُ وَالْبَيَانَاتُ الرَّسْمِيَّةُ • بَلَاغَاتُ الْأَمَانَةِ الْعَامَّةِ لِلنَّادِي
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Timely communications concerning executive elections, admissions windows, varsity debate qualifications, and public lectures.
            </p>
          </div>
          <Link href="/news">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              All Official Bulletins
            </Button>
          </Link>
        </div>

        {announcements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {announcements.map((item) => (
              <Card key={item.id} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent" size="sm" className="capitalize">
                      {item.category}
                    </Badge>
                    {item.isPinned && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
                        <Pin className="w-3 h-3 rotate-45" />
                        Pinned Notice
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-[var(--text-primary)] line-clamp-2">
                      {item.titleEn}
                    </h3>
                    {item.titleAr && (
                      <p className="font-arabic text-xs text-[var(--brand-accent)] font-medium line-clamp-1" dir="rtl">
                        {item.titleAr}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                    {item.contentEn}
                  </p>

                  <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                      {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <Link href={`/news`} className="text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-semibold hover:underline">
                      Read Notice →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[6px] max-w-md mx-auto">
            <Bell className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">No Active Bulletins</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              New secretarial announcements will be dispatched here as ratified.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
