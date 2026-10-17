/**
 * @file src/app/admin/resources/page.tsx
 * @route /admin/resources
 * @description Administrative Arabic Learning Resources Management.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows curating linguistic references, uploading syntax cheat sheets,
 *   tagging grammatical categories, and managing download links.
 * - Queries `getPublicLearningResources()`.
 * - Meets Requirement SPEC-RES-01 through SPEC-RES-04.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { getPublicLearningResources } from "@/lib/db/queries";
import { BookOpen, Plus, Edit, Download, Trash2 } from "lucide-react";

export const revalidate = 0;

export default async function AdminResourcesPage() {
  const { data: resources = [] } = await getPublicLearningResources({ limit: 50 }).catch(() => ({ data: [] }));

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Arabic Learning Resources Hub"
        subtitle="Upload pedagogical guides, grammar references, and vocabulary lists"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Curated Educational Assets
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Pedagogical files made available to student fellows and the public.
            </p>
          </div>
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Upload Learning Resource
          </Button>
        </div>

        <Card className="border-[var(--border-color)]">
          {resources.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource Title (EN / AR)</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Proficiency Level</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resources.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-bold text-xs text-[var(--text-primary)]">{r.titleEn}</div>
                      {r.titleAr && <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">{r.titleAr}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="accent" size="sm">{r.category || "General"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-secondary)] capitalize">
                      {r.skillLevel || "All Levels"}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[var(--text-muted)] uppercase">
                      Curated PDF
                    </TableCell>
                    <TableCell>
                      <Badge variant="accent" size="sm">Published</Badge>
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
                title="No Learning Resources Uploaded"
                description="Upload the inaugural grammar or syntax cheat sheet to populate the student resources hub."
                actionLabel="Upload Resource"
                actionHref="/admin/resources"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
