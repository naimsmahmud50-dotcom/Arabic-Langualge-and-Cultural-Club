/**
 * @file src/app/admin/publications/page.tsx
 * @route /admin/publications
 * @description Administrative Publications, Journals, and Competitive Distinctions.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows managing magazine issues, ISBN/ISSN registrations, research papers,
 *   and oratorical/debate tournament honors.
 * - Queries `getPublicPublications()` and `getPublicAchievements()`.
 * - Meets Requirement SPEC-PUB-01 through SPEC-PUB-04 and SPEC-ACH-01.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { getPublicPublications, getPublicAchievements } from "@/lib/db/queries";
import { Newspaper, Award, Plus, Edit } from "lucide-react";

export const revalidate = 0;

export default async function AdminPublicationsPage() {
  const [publications, achievements] = await Promise.all([
    getPublicPublications().catch(() => []),
    getPublicAchievements().catch(() => []),
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Publications & Institutional Distinctions"
        subtitle="Manage literary journals, academic magazines, and inter-collegiate tournament trophies"
      />

      <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
        {/* Publications Roster */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Club Magazines & Journals
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Archival and current issues of the club magazine.
              </p>
            </div>
            <Button variant="accent" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Publish New Magazine Issue
            </Button>
          </div>

          <Card className="border-[var(--border-color)]">
            {publications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Publication Title (EN / AR)</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Catalog / ISSN</TableHead>
                    <TableHead>Date Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publications.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-bold text-xs text-[var(--text-primary)]">{p.titleEn}</div>
                        {p.titleAr && <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">{p.titleAr}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="accent" size="sm">{p.publicationType || "Journal"}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-[var(--text-muted)]">
                        {p.issueNo || "Standard Issue"}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-[var(--text-muted)]">
                        {p.publicationDate ? new Date(p.publicationDate).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-right space-x-1.5">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="No Publications Cataloged"
                  description="Register the first issue of the club magazine or scholarly journal."
                  actionLabel="Add Magazine Issue"
                  actionHref="/admin/publications"
                />
              </div>
            )}
          </Card>
        </div>

        {/* Competitive Distinctions Roster */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Tournament Distinctions & Awards
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Institutional honors won by debate teams and club representatives.
              </p>
            </div>
            <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Record New Distinction
            </Button>
          </div>

          <Card className="border-[var(--border-color)]">
            {achievements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Award / Honor Title</TableHead>
                    <TableHead>Academic Term</TableHead>
                    <TableHead>Conferred By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {achievements.map((ach) => (
                    <TableRow key={ach.id}>
                      <TableCell className="font-bold text-xs text-[var(--text-primary)]">
                        {ach.titleEn}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-[var(--brand-accent)] font-semibold">
                        {ach.dateAchieved || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-[var(--text-secondary)] capitalize">
                        {ach.category || "General"}
                      </TableCell>
                      <TableCell className="text-right space-x-1.5">
                        <Button variant="ghost" size="sm" className="text-xs">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-8">
                <EmptyState
                  title="No Honors Logged"
                  description="Record debate tournament victories and oratory awards to celebrate club achievement."
                  actionLabel="Add Achievement"
                  actionHref="/admin/publications"
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
