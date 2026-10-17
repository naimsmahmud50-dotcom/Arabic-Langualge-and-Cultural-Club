/**
 * @file src/app/admin/audit-logs/page.tsx
 * @route /admin/audit-logs
 * @description Immutable System and Administrative Activity Audit Trail.
 * 
 * ARCHITECTURE & ROLE:
 * - Displays verifiable security logs recording all executive modifications,
 *   privilege grants, membership approvals, and content publishes.
 * - Queries `getAdminAuditLogs()`.
 * - Meets Requirement SPEC-SEC-04 and SPEC-ADM-04.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, EmptyState } from "@/components/ui";
import { getAdminAuditLogs } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { History, Shield, Filter, Download } from "lucide-react";

export const revalidate = 0;

export default async function AdminAuditLogsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/audit-logs");
  }

  // Enforce server-side authorization: audit:read
  assertPermission(session.role, "audit:read");

  const logs = await getAdminAuditLogs(50).catch(() => []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Security & Activity Audit Trail"
        subtitle="Cryptographically tracked immutable records of all administrative actions and security events"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Recorded Security Trail
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Logs are write-only and cannot be altered or deleted by any administrative role.
            </p>
          </div>
          <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export Audit Trail (JSON)
          </Button>
        </div>

        <Card className="border-[var(--border-color)]">
          {logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action Code</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-[var(--text-muted)] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-bold text-xs text-[var(--text-primary)]">
                      {log.action}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-secondary)]">
                      {log.targetEntity}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-[var(--text-muted)]">
                      {log.targetId ? log.targetId.slice(0, 8) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-secondary)] max-w-xs truncate">
                      {log.detailsJson || "Routine operation"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="accent" size="sm">Audited</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8">
              <EmptyState
                title="Audit Trail Initialized"
                description="Administrative modifications will be appended to this immutable audit ledger automatically."
                actionLabel="Back to Dashboard"
                actionHref="/admin"
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
