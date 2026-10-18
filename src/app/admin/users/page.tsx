/**
 * @file src/app/admin/users/page.tsx
 * @route /admin/users
 * @description System Users, Role-Based Access Control (RBAC), and Permissions Management.
 * 
 * ARCHITECTURE & GOVERNANCE:
 * - Server Component protected by least-privilege RBAC.
 * - Enforces server-side authorization: requires `users:read` to view, and `users:manage` to mutate.
 * - Retrieves authentic user records directly from SQLite `users` table.
 * - Meets Requirements SPEC-SEC-01, SPEC-SEC-02, SPEC-SEC-03, and SPEC-ADM-02.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";
import { assertPermission } from "@/lib/auth/rbac";
import { UsersManagerClient } from "./UsersManagerClient";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login?next=/admin/users");
  }

  // Enforce server-side authorization before executing query
  assertPermission(session.role, "users:read");

  // Query real administrative users from database
  const usersList = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .all();

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Users, Roles & Access Control"
        subtitle="Manage administrative permissions, role hierarchies, and privileged credentials"
      />

      <div className="p-6 sm:p-8 max-w-7xl">
        <UsersManagerClient
          usersList={usersList}
          currentRole={session.role}
          currentUserId={session.id}
        />
      </div>
    </div>
  );
}
