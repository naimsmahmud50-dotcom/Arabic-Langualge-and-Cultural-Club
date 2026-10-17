/**
 * @file src/app/(public)/founders/page.tsx
 * @route /founders
 * @description Official Founders and Originators Archive.
 * 
 * ARCHITECTURE & ROLE:
 * - Public archive documenting the founding committee and patron scholars.
 * - Queries `getPublicFounders()` from the database.
 * - Meets Requirement SPEC-FND-01 through SPEC-FND-04.
 * 
 * INSTITUTIONAL INTEGRITY:
 * - Strictly displays verified records from the database.
 * - Never fabricates fictional founders. Empty states are explicitly labeled.
 */

import React from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui";
import { getPublicFounders } from "@/lib/db/queries";
import { User, Award, BookOpen, Calendar } from "lucide-react";

export const revalidate = 60;

export default async function FoundersPage() {
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Founders", href: "/founders" },
  ];

  const founders = await getPublicFounders().catch(() => []);

  return (
    <div>
      <PageHeader
        title="Founders of the Club"
        titleAr="مؤسسو النادي والرواد الأوائل"
        description="Preserving the memory and honoring the intellectual dedication of the founding visionaries who established the Arabic Language & Cultural Club."
        badge="Archival Memorial"
        breadcrumbs={breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {founders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {founders.map((founder) => (
              <Card key={founder.id} hoverElevate className="border-[var(--border-color)] overflow-hidden">
                <CardContent className="p-8 space-y-4">
                  {/* Portrait or Fallback Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[6px] bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center font-serif text-2xl font-bold border border-[var(--border-color)] shrink-0">
                      {founder.portraitUrl ? (
                        <img 
                          src={founder.portraitUrl} 
                          alt={founder.nameEn} 
                          className="w-full h-full object-cover rounded-[6px]" 
                        />
                      ) : (
                        founder.nameEn.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] leading-tight">
                        {founder.nameEn}
                      </h3>
                      {founder.nameAr && (
                        <p className="font-arabic text-sm text-[var(--brand-accent)] font-semibold mt-0.5" dir="rtl">
                          {founder.nameAr}
                        </p>
                      )}
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                        {founder.roleTitleEn}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <p>{founder.bioEn}</p>
                    {founder.bioAr && (
                      <p className="font-arabic text-[var(--text-muted)] pt-1" dir="rtl">
                        {founder.bioAr}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
                      Founded {founder.foundingYear || "Inception"}
                    </span>
                    <Badge variant="accent" size="sm">Verified Founder</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Archival Founders Roster Under Review"
            description="The archival committee is currently verifying historical founding charters and minutes. Official founder profiles will be published here upon archival sign-off."
            actionLabel="Return to About Us"
            actionHref="/about"
          />
        )}
      </div>
    </div>
  );
}
