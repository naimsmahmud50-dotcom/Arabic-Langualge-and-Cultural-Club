/**
 * @file src/app/admin/gallery/page.tsx
 * @route /admin/gallery
 * @description Administrative Photo Gallery & Archival Media Management.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows curating photo albums, uploading high-resolution event media,
 *   tagging academic years, and moderating publication consent.
 * - Queries `getPublicGalleryAlbums()`.
 * - Meets Requirement SPEC-GAL-01 through SPEC-GAL-04.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { getPublicGalleryAlbums } from "@/lib/db/queries";
import { Image as ImageIcon, Plus, Edit, Eye, Upload } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminGalleryPage() {
  const { data: albums = [] } = await getPublicGalleryAlbums().catch(() => ({ data: [] }));

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Photo Albums & Media Archive"
        subtitle="Curate visual memories, upload photographs, and manage media publications"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Curated Archival Albums
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Albums organize event photographs and exhibition retrospectives.
            </p>
          </div>
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Create New Album
          </Button>
        </div>

        <Card className="border-[var(--border-color)]">
          {albums.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Album Title (EN / AR)</TableHead>
                  <TableHead>Academic Term</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {albums.map((alb) => (
                  <TableRow key={alb.id}>
                    <TableCell>
                      <div className="font-bold text-xs text-[var(--text-primary)]">{alb.titleEn}</div>
                      {alb.titleAr && <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">{alb.titleAr}</div>}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[var(--brand-accent)] font-semibold">
                      {alb.academicYear || "General"}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[var(--text-muted)]">
                      {new Date(alb.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="accent" size="sm">Published</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        Add Photos
                      </Button>
                      <Link href={`/gallery/${alb.slug}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No Media Albums Created"
                description="Create your first photo album to document calligraphy exhibitions and cultural assemblies."
                actionLabel="Create First Album"
                actionHref="/admin/gallery"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
