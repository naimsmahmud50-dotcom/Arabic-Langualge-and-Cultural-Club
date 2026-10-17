/**
 * @file src/app/admin/founders/page.tsx
 * @route /admin/founders
 * @description Administrative Founders and Originators Registry Management.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows managing verified founders, biographical text, and founding year records.
 * - Queries `getPublicFounders()` for current catalog.
 * - Meets Requirement SPEC-FND-01 through SPEC-FND-04.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { getPublicFounders } from "@/lib/db/queries";
import { Award, Plus, Edit, Trash2 } from "lucide-react";

export const revalidate = 0;

export default async function AdminFoundersPage() {
  const founders = await getPublicFounders().catch(() => []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Founders & Originators Archive"
        subtitle="Manage permanent historical founders, patron scholars, and inception records"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Verified Founder Profiles
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              All entries here populate the public historical memorial page (/founders).
            </p>
          </div>
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Register New Founder
          </Button>
        </div>

        <Card className="border-[var(--border-color)]">
          {founders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Founder Name (EN / AR)</TableHead>
                  <TableHead>Designation / Role</TableHead>
                  <TableHead>Inception Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {founders.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="font-bold text-xs text-[var(--text-primary)]">{f.nameEn}</div>
                      {f.nameAr && <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">{f.nameAr}</div>}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-secondary)]">
                      {f.roleTitleEn}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[var(--text-muted)]">
                      {f.foundingYear || "Inception"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="accent" size="sm">Published</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No Founder Records Cataloged"
                description="Use the button above to add authenticated founding committee profiles and patron scholars."
                actionLabel="Add First Founder Profile"
                actionHref="/admin/founders"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
