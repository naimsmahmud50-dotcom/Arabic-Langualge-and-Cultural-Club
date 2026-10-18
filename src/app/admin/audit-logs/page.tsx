/**
 * @file src/app/admin/audit-logs/page.tsx
 * @route /admin/audit-logs
 * @description Immutable System and Administrative Activity Audit Trail.
 * 
 * ARCHITECTURE & ROLE:
 * - Server Component protected by least-privilege RBAC: requires `audit:read` (Super Admin or Administrator).
 * - Sourced directly from immutable SQLite `audit_logs` ledger.
 * - Allows searching, filtering by action code / entity, detailed payload inspection, and JSON exports.
 * - Meets Requirement REQ-ADM-12 and SPEC-SEC-04.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { getAdminAuditLogs } from "@/lib/db/queries";
import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";
import { redirect } from "next/navigation";
import { AuditLogsClient } from "./AuditLogsClient";

export const revalidate = 0;

export default async function AdminAuditLogsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login?next=/admin/audit-logs");
  }

  // Enforce server-side authorization: audit:read
  assertPermission(session.role, "audit:read");

  // Fetch up to 1000 recent logs for client filtering and fast pagination
  const logs = await getAdminAuditLogs(1000).catch(() => []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Security & Activity Audit Trail"
        subtitle="Cryptographically tracked immutable records of all administrative actions and security events"
      />

      <div className="p-6 sm:p-8 max-w-7xl">
        <AuditLogsClient initialLogs={Array.isArray(logs) ? (logs as any) : []} />
      </div>
    </div>
  );
}
