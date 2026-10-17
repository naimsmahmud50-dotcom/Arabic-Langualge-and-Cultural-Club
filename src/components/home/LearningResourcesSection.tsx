/**
 * @file src/components/home/LearningResourcesSection.tsx
 * @description Arabic Learning Resources & Digital Library Spotlight.
 * 
 * ARCHITECTURAL ROLE:
 * - Spotlights curated open-access academic materials for Arabic scholars.
 * - Queries `getPublicLearningResources({ limit: 4 })`.
 * - Meets Requirement SPEC-HOM-08 and SPEC-RES-01.
 * 
 * CONSTRAINTS:
 * - Shows real database records with valid skill-level and format tags.
 * - Provides direct links to full digital repository.
 */

import React from "react";
import Link from "next/link";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { BookOpen, FileDown, ArrowRight, Library, Headphones, BookText } from "lucide-react";

interface ResourceItem {
  id: string;
  titleEn: string;
  titleAr?: string | null;
  descriptionEn?: string | null;
  category: string;
  skillLevel: string;
  format?: string | null;
  fileUrl?: string | null;
}

interface LearningResourcesSectionProps {
  resources: ResourceItem[];
}

export function LearningResourcesSection({ resources }: LearningResourcesSectionProps) {
  const formatIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    pdf: BookText,
    audio: Headphones,
    default: BookOpen,
  };

  return (
    <section className="py-20 bg-[var(--bg-primary)] border-b border-[var(--border-color)]" aria-label="Arabic Learning Resources">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <Badge variant="accent" size="sm">Academic Repository</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-serif">
              Arabic Learning Resources & Curated Library
            </h2>
            <p className="font-arabic text-sm text-[var(--brand-accent)] font-medium" dir="rtl">
              مَرْكَزُ الْمَصَادِرِ وَالْمَوَادِّ التَّعْلِيمِيَّةِ • كُتُبٌ وَتَسْجِيلَاتٌ لِتَعْلِيمِ اللُّغَةِ الْعَرَبِيَّةِ
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Carefully vetted grammatical treatises, audio diction exercises, vocabulary lexicons, and literary monographs available to the university community.
            </p>
          </div>
          <Link href="/resources">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Explore Entire Library Archive
            </Button>
          </Link>
        </div>

        {resources.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {resources.map((item) => {
              const fileExtension = item.fileUrl ? item.fileUrl.split(".").pop()?.toLowerCase() : "pdf";
              const detectedFormat = item.format || fileExtension || "pdf";
              const Icon = formatIconMap[detectedFormat] || formatIconMap.default;

              return (
                <Card key={item.id} hoverElevate className="border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="neutral" size="sm" className="capitalize text-[10px]">
                        {item.skillLevel}
                      </Badge>
                    </div>

                    <div className="space-y-1">
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
                      {item.descriptionEn || "Scholarly resource curated by the academic committee."}
                    </p>

                    <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                      <span className="capitalize font-mono text-[11px] uppercase tracking-wider">{detectedFormat}</span>
                      <span className="capitalize">{item.category}</span>
                    </div>
                  </CardContent>

                  <div className="p-4 bg-[var(--bg-primary)]/40 border-t border-[var(--border-subtle)]">
                    <Link
                      href="/resources"
                      className="text-xs font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)] hover:underline inline-flex items-center gap-1.5"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Access Material</span>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-[var(--border-color)] rounded-[6px] max-w-md mx-auto">
            <Library className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2 opacity-80" />
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Library Ingestion in Progress</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Curated pedagogical PDFs and audio files are being indexed by the library committee.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
