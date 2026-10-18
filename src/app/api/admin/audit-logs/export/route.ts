/**
 * @file src/app/api/admin/audit-logs/export/route.ts
 * @description Authenticated endpoint for exporting immutable audit ledger records.
 * 
 * ARCHITECTURE & SECURITY:
 * - Requires active session with `audit:read` authorization.
 * - Streams uncorrupted audit history formatted as JSON.
 * - Prohibits client-side caching.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";
import { getAdminAuditLogs } from "@/lib/db/queries";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session.role, "audit:read");

    // Fetch full audit log ledger (up to 5000 recent entries)
    const logs = await getAdminAuditLogs(5000);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    const exportPayload = {
      system: "Arabic Language & Cultural Club Platform",
      report: "Immutable Administrative & Security Audit Trail",
      exportedAt: new Date().toISOString(),
      exportedBy: session.email,
      totalRecords: Array.isArray(logs) ? logs.length : 0,
      records: logs,
    };

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="arabic_club_audit_logs_${timestamp}.json"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export audit logs" },
      { status: 403 }
    );
  }
}
