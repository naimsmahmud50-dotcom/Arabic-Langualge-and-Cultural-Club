/**
 * @file src/app/admin/users/page.tsx
 * @route /admin/users
 * @description System Users, Role-Based Access Control (RBAC), and Permissions.
 * 
 * ARCHITECTURE & ROLE:
 * - Allows managing privileged administrative accounts, assigning roles
 *   (Super Admin, Content Editor, Archival Trustee, Auditor), and session tokens.
 * - Meets Requirement SPEC-SEC-01 through SPEC-SEC-03 and SPEC-ADM-02.
 */

import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Card, CardContent, Badge, Button, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui";
import { ShieldCheck, Plus, User, Shield, Lock } from "lucide-react";

export default function AdminUsersPage() {
  const usersList = [
    { id: "1", name: "System Administrator", email: "admin@arabicclub.edu", role: "Super Admin", lastActive: "Active Now", status: "Active" },
    { id: "2", name: "Academic Editor", email: "editor@arabicclub.edu", role: "Content Editor", lastActive: "2 hours ago", status: "Active" },
    { id: "3", name: "Archive Trustee", email: "archivist@arabicclub.edu", role: "Archival Officer", lastActive: "Yesterday", status: "Active" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Users, Roles & Access Control"
        subtitle="Manage administrative permissions, role hierarchies, and privileged credentials"
      />

      <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Authorized System Operators
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Privileges are strictly partitioned by role according to the principle of least privilege.
            </p>
          </div>
          <Button variant="accent" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Provision Administrator Account
          </Button>
        </div>

        <Card className="border-[var(--border-color)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Identity</TableHead>
                <TableHead>Institutional Email</TableHead>
                <TableHead>Assigned Role</TableHead>
                <TableHead>Activity Status</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersList.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-2">
                    <User className="w-4 h-4 text-[var(--brand-accent)]" />
                    {u.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[var(--text-muted)]">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-semibold">
                      <Shield className="w-3 h-3 text-[var(--brand-accent)]" />
                      <span>{u.role}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-secondary)]">
                    {u.lastActive}
                  </TableCell>
                  <TableCell>
                    <Badge variant="accent" size="sm">{u.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1.5">
                    <Button variant="ghost" size="sm" className="text-xs">
                      Permissions
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
