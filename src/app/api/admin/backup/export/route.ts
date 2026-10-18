/**
 * @file src/app/api/admin/backup/export/route.ts
 * @description Authenticated endpoint for exporting verified database snapshot downloads.
 * 
 * ARCHITECTURE & SECURITY:
 * - Requires active session with `settings:manage` authorization.
 * - Generates verified SQLite snapshot stream.
 * - Sets strict security headers (no-cache, secure download attachment).
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";
import { createDatabaseBackup } from "@/lib/utils/db-backup";
import fs from "fs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertPermission(session.role, "settings:manage");

    const backupResult = await createDatabaseBackup();
    const fileContent = fs.readFileSync(backupResult.filepath, "utf8");

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${backupResult.filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Checksum-Sha256": backupResult.checksumSha256,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate backup export" },
      { status: 403 }
    );
  }
}
