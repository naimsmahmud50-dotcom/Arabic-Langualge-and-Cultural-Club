/**
 * @file src/app/(public)/news/page.tsx
 * @route /news
 * @description Official Institutional Announcements, Bulletins, and Press Releases.
 * 
 * ARCHITECTURE & ROLE:
 * - Public notices from the executive council, meeting calls, election communiqués,
 *   and competition registrations.
 * - Queries `getPublicAnnouncements({ limit })`.
 * - Meets Requirement SPEC-NWS-01 through SPEC-NWS-04.
 */

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui";
import { getPublicAnnouncements } from "@/lib/db/queries";
import { Bell, Calendar, Pin, AlertCircle } from "lucide-react";

export const revalidate = 60;

export default async function NewsPage() {
  const { data: announcements = [] } = await getPublicAnnouncements({ limit: 30 }).catch(() => ({ data: [] }));

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "News & Bulletins", href: "/news" },
  ];

  return (
    <div>
      <PageHeader
        title="Official News & Announcements"
        titleAr="الإعلانات الرسمية والبيانات الدورية"
        description="Official communiqués from the Executive Committee, administrative decrees, election notifications, and event circulars."
        badge="Official Gazettes"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {announcements.length > 0 ? (
          <div className="space-y-6">
            {announcements.map((item) => (
              <Card
                key={item.id}
                hoverElevate
                className={`border-[var(--border-color)] ${
                  item.isPinned ? "border-l-4 border-l-[var(--brand-accent)] bg-[var(--bg-surface-elevated)]" : ""
                }`}
              >
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {item.isPinned && (
                        <Badge variant="accent" size="sm" className="gap-1">
                          <Pin className="w-3 h-3" />
                          Pinned Notice
                        </Badge>
                      )}
                      <Badge variant={item.category === "notice" ? "accent" : "neutral"} size="sm" className="capitalize">
                        {item.category || "Official Notice"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                      <span>{new Date(item.publishedAt || new Date()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight">
                      {item.titleEn}
                    </h3>
                    {item.titleAr && (
                      <p className="font-arabic text-base text-[var(--brand-accent)] font-semibold" dir="rtl">
                        {item.titleAr}
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
                    <p>{item.contentEn}</p>
                    {item.contentAr && (
                      <p className="font-arabic text-right text-[var(--text-muted)] pt-2 border-t border-[var(--border-subtle)]" dir="rtl">
                        {item.contentAr}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Active Bulletins"
            description="All official executive announcements are current. New bulletins from the general secretariat will be published here."
            actionLabel="Return to Homepage"
            actionHref="/"
          />
        )}
      </div>
    </div>
  );
}
