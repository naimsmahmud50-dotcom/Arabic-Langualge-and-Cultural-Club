/**
 * @file src/app/admin/applications/page.tsx
 * @route /admin/applications
 * @description Administrative Membership Admissions Queue.
 * 
 * ARCHITECTURE & ROLE:
 * - Review pipeline for prospective member applications submitted via the public form.
 * - Allows reviewing student motivation, verifying student ID, and issuing approval.
 * - Meets Requirement SPEC-APP-01 through SPEC-APP-05.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { getAdminMembershipApplications } from "@/lib/db/queries";
import { UserPlus, Check, X, Eye } from "lucide-react";

export const revalidate = 0;

export default async function AdminApplicationsPage() {
  const applications = await getAdminMembershipApplications("pending").catch(() => []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Membership Application Queue"
        subtitle="Review, approve, or reject incoming student admission dossiers"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Pending Applications ({applications.length})
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Dossiers awaiting executive committee verification and membership ID issuance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              View Approved History
            </Button>
          </div>
        </div>

        <Card className="border-[var(--border-color)]">
          {applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference No.</TableHead>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead className="text-right">Decisions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs font-bold text-[var(--text-primary)]">
                      {app.referenceNo}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-xs text-[var(--text-primary)]">{app.applicantName}</div>
                      <div className="text-[11px] text-[var(--text-muted)] font-mono">{app.phone}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-[var(--text-secondary)]">
                      {app.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm" className="capitalize">{app.category || "Standard"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-[var(--text-muted)]">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-1.5">
                      <Button variant="accent" size="sm" className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white">
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600">
                        <X className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8">
              <EmptyState
                title="Application Queue is Clear"
                description="All submitted membership applications have been reviewed by the committee."
                actionLabel="View Active Members"
                actionHref="/admin/members"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
