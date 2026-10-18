/**
 * @file src/app/(public)/news/[slug]/page.tsx
 * @route /news/[slug]
 * @description Official Institutional Bulletin Dossier & Editorial View.
 * 
 * ARCHITECTURE & ROLE:
 * - Public dossier presenting full text, bilingual translations, author attestation,
 *   and publication timestamps for official announcements.
 * - Queries `getPublicAnnouncementBySlug(slug)`.
 * - Strictly enforces isPublished === true and status === 'published'.
 * - Generates dynamic SEO metadata (`generateMetadata`).
 * - Meets Requirement SPEC-NWS-01 and SPEC-NWS-04.
 * 
 * DESIGN TOKENS & CONSTRAINTS:
 * - Primary: #173D32 (Forest Green)
 * - Accent: #B18A4A (Antique Brass)
 * - Anti-Emoji: Strictly clean Lucide SVG icons.
 */

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { getPublicAnnouncementBySlug } from "@/lib/db/queries";
import { 
  Calendar, 
  User, 
  Pin, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  BookOpen, 
  Share2 
} from "lucide-react";

export const revalidate = 60;

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublicAnnouncementBySlug(slug).catch(() => null);

  if (!item) {
    return {
      title: "Announcement Not Found | Arabic Language & Cultural Club",
      description: "The requested institutional bulletin could not be located.",
    };
  }

  return {
    title: `${item.titleEn} | Arabic Language & Cultural Club`,
    description: item.summaryEn || item.contentEn.slice(0, 160),
    openGraph: {
      title: item.titleEn,
      description: item.summaryEn || item.contentEn.slice(0, 160),
      type: "article",
      publishedTime: item.publishedAt.toISOString(),
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const item = await getPublicAnnouncementBySlug(slug).catch(() => null);

  if (!item) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "News & Bulletins", href: "/news" },
    { label: item.titleEn, href: `/news/${item.slug}` },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Header */}
      <PageHeader
        title={item.titleEn}
        titleAr={item.titleAr || undefined}
        description={item.summaryEn || "Official executive circular and administrative notification."}
        badge={item.category || "Official Circular"}
        breadcrumbs={breadcrumbs}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link href="/news">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Return to All Bulletins
            </Button>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <span>Ref: {item.slug}</span>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[8px] p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5 font-mono">
              <Calendar className="w-4 h-4 text-[var(--brand-accent)]" />
              <span>
                {new Date(item.publishedAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="h-4 w-[1px] bg-[var(--border-subtle)] hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-[var(--brand-accent)]" />
              <span>Author: <strong className="text-[var(--text-primary)]">{item.authorName || "Executive Secretariat"}</strong></span>
            </div>

            <div className="h-4 w-[1px] bg-[var(--border-subtle)] hidden sm:block" />

            <div className="flex items-center gap-1.5 capitalize">
              <Badge variant="accent" size="sm">
                {item.category || "Notice"}
              </Badge>
            </div>
          </div>

          {item.isPinned && (
            <Badge variant="accent" size="sm" className="gap-1 font-mono uppercase">
              <Pin className="w-3 h-3" />
              Priority Notice
            </Badge>
          )}
        </div>

        {/* Summary Callout */}
        {item.summaryEn && (
          <div className="p-5 rounded-[6px] bg-[var(--bg-surface-elevated)] border-l-4 border-l-[var(--brand-accent)] text-sm font-medium text-[var(--text-primary)] leading-relaxed italic">
            "{item.summaryEn}"
          </div>
        )}

        {/* English Content */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--brand-accent)]" />
            <span>Official Communiqué Record</span>
          </h2>
          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm text-[var(--text-secondary)] leading-relaxed space-y-4">
            {item.contentEn.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* Arabic Translation Block */}
        {item.contentAr && (
          <div className="pt-8 border-t border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2 font-arabic" dir="rtl">
                <BookOpen className="w-5 h-5 text-[var(--brand-accent)]" />
                <span>البيان الرسمي المعتمد</span>
              </h2>
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Arabic Version</span>
            </div>

            <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-[8px] border border-[var(--border-subtle)] space-y-4 font-arabic text-base leading-loose text-right text-[var(--text-primary)]" dir="rtl">
              {item.titleAr && (
                <h3 className="text-lg font-bold text-[var(--brand-accent)]">
                  {item.titleAr}
                </h3>
              )}
              {item.summaryAr && (
                <p className="text-sm font-semibold text-[var(--text-secondary)] italic border-r-2 border-r-[var(--brand-accent)] pr-3">
                  {item.summaryAr}
                </p>
              )}
              {item.contentAr.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        )}

        {/* Institutional Attestation & Verification Footer */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-[6px] p-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wide text-[var(--brand-accent)]">
            <ShieldCheck className="w-4 h-4 text-[var(--brand-accent)]" />
            <span>Official Gazette Attestation</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            This document represents an authenticated administrative communiqué issued under the authority of the Executive Committee and General Secretariat of the Arabic Language & Cultural Club. Permanent archival timestamps are preserved in our immutable records ledger to ensure transparency.
          </p>
        </div>

        {/* Bottom Back Button */}
        <div className="pt-4 flex justify-between items-center">
          <Link href="/news">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to News Hub
            </Button>
          </Link>
          <span className="text-xs font-mono text-[var(--text-muted)]">
            Published: {new Date(item.publishedAt).toLocaleDateString()}
          </span>
        </div>
      </article>
    </div>
  );
}
