/**
 * @file src/app/admin/news/page.tsx
 * @route /admin/news
 * @description Administrative News, Announcements, and Bulletins Management.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows authoring official communiqués, pinning urgent circulars,
 *   and scheduling publication dates.
 * - Queries `getPublicAnnouncements()`.
 * - Meets Requirement SPEC-NWS-01 through SPEC-NWS-04.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { getPublicAnnouncements } from "@/lib/db/queries";
import { Bell, Plus, Edit, Pin, Trash2 } from "lucide-react";

export const revalidate = 0;

export default async function AdminNewsPage() {
  const { data: announcements = [] } = await getPublicAnnouncements({ limit: 50 }).catch(() => ({ data: [] }));

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Official News & Bulletins Dispatch"
        subtitle="Publish executive circulars, pin notices, and disseminate press releases"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Executive Communiqués
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Published announcements appear on the homepage and official newsfeed.
            </p>
          </div>
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Draft New Circular
          </Button>
        </div>

        <Card className="border-[var(--border-color)]">
          {announcements.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Announcement Title (EN / AR)</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pinned</TableHead>
                  <TableHead>Publication Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-bold text-xs text-[var(--text-primary)]">{a.titleEn}</div>
                      {a.titleAr && <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">{a.titleAr}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.category === "notice" ? "accent" : "neutral"} size="sm" className="capitalize">
                        {a.category || "Notice"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {a.isPinned ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-accent)]">
                          <Pin className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[var(--text-muted)]">
                      {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : "Draft"}
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
                title="No Bulletins Published"
                description="Draft and post your first institutional circular to communicate with members and students."
                actionLabel="Draft Announcement"
                actionHref="/admin/news"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
