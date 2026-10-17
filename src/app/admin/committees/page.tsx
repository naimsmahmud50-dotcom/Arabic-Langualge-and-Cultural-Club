/**
 * @file src/app/admin/committees/page.tsx
 * @route /admin/committees
 * @description Administrative Committee Terms and Executive Portfolio Management.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows managing governing terms (active and historical archives).
 * - Enforces the institutional rule: old terms remain preserved forever.
 * - Queries `getCommitteeTerms()`.
 * - Meets Requirement SPEC-LDR-01 through SPEC-LDR-06.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { getCommitteeTerms } from "@/lib/db/queries";
import { Users2, Plus, Edit, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminCommitteesPage() {
  const terms = await getCommitteeTerms().catch(() => []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Committee Terms & Executive Portfolios"
        subtitle="Manage active executive council, historical committee preservation, and officer appointments"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Academic Terms & Governing Councils
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Historical terms are permanently archived. Only one term can be designated as Current at a time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Manage Positions
            </Button>
            <Button variant="accent" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Create New Academic Term
            </Button>
          </div>
        </div>

        <Card className="border-[var(--border-color)]">
          {terms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Term Title (EN / AR)</TableHead>
                  <TableHead>Term Governance Status</TableHead>
                  <TableHead>Date Span</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {terms.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs font-bold text-[var(--text-primary)]">
                      {t.academicYear}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-[var(--text-primary)]">{t.titleEn}</div>
                      {t.titleAr && <div className="font-arabic text-xs text-[var(--brand-accent)]" dir="rtl">{t.titleAr}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={t.isCurrent ? "accent" : "neutral"} size="sm">
                        {t.isCurrent ? "Active Term (الحالي)" : "Historical Archive (سابق)"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-muted)] font-mono">
                      {t.startDate ? new Date(t.startDate).toLocaleDateString() : "—"} to {t.endDate ? new Date(t.endDate).toLocaleDateString() : "Present"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        Edit Roster
                      </Button>
                      <Link href={`/leadership?term=${t.id}`} target="_blank">
                        <Button variant="ghost" size="sm" className="text-xs">
                          Public View
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
                title="No Committee Terms Configured"
                description="Initialize your first academic governing term to assign executive portfolios."
                actionLabel="Create Academic Term"
                actionHref="/admin/committees"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
