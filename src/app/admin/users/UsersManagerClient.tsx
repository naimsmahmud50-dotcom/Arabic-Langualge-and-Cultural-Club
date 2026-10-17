/**
 * @file src/app/admin/users/UsersManagerClient.tsx
 * @description Client-side interaction layer for User & Role Management.
 * 
 * ARCHITECTURE & ROLE:
 * - Provides Super Admins with the ability to securely provision new administrative accounts.
 * - Displays active institutional operators, their assigned roles, and activity status.
 * - Renders the institutional RBAC Permission Matrix for clear auditability.
 * - Enforces client-side validation alongside server-side least-privilege checks.
 */

"use client";

import React, { useState, useActionState, useEffect } from "react";
import { Card, Badge, Button, Input, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Modal, Alert } from "@/components/ui";
import { ShieldCheck, Plus, User, Shield, Lock, CheckCircle2, AlertCircle, KeyRound, Info } from "lucide-react";
import { provisionUserAction } from "@/lib/auth/actions";
import { ROLE_METADATA, ROLE_PERMISSIONS, hasPermission } from "@/lib/auth/rbac";
import { Role, ActionResponse } from "@/lib/auth/types";

interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

interface UsersManagerClientProps {
  usersList: UserRecord[];
  currentRole: Role;
}

export function UsersManagerClient({ usersList, currentRole }: UsersManagerClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  const canManageUsers = hasPermission(currentRole, "users:manage");

  const [state, formAction, isPending] = useActionState<ActionResponse | null, FormData>(
    provisionUserAction,
    null
  );

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state?.success]);

  const institutionalRoles: Array<{ value: Role; label: string; desc: string }> = [
    { value: "super_admin", label: "Super Administrator", desc: "Full root access, audit logs, system config, user provisioning" },
    { value: "administrator", label: "General Administrator", desc: "Operational management of club programs, committees, and content" },
    { value: "content_editor", label: "Content Editor", desc: "CMS pages, announcements, Arabic resources, publications, gallery" },
    { value: "membership_manager", label: "Membership Manager", desc: "Applications queue review, member directory & verification" },
    { value: "event_manager", label: "Event Manager", desc: "Calendar events, 12-month annual plan, event registration lists" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Authorized System Operators
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {usersList.length} verified administrative accounts configured under institutional least-privilege policy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMatrix(!showMatrix)}
            leftIcon={<Info className="w-3.5 h-3.5" />}
          >
            {showMatrix ? "Hide Permissions Matrix" : "View Permissions Matrix"}
          </Button>

          {canManageUsers && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Provision Administrator Account
            </Button>
          )}
        </div>
      </div>

      {/* Permissions Matrix Drawer */}
      {showMatrix && (
        <Card className="border-[var(--border-color)] p-5 bg-[var(--bg-surface-elevated)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--brand-accent)]" />
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                Institutional Role-Based Access Control (RBAC) Matrix
              </h4>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              Enforced at Middleware & Server Action layers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                  <th className="py-2 px-3 font-semibold">Institutional Role</th>
                  <th className="py-2 px-3 font-semibold">Governance Boundary</th>
                  <th className="py-2 px-3 font-semibold">Allocated Operational Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {institutionalRoles.map((r) => {
                  const meta = ROLE_METADATA[r.value];
                  const perms = ROLE_PERMISSIONS[r.value] || [];
                  return (
                    <tr key={r.value} className="hover:bg-[var(--bg-surface-hover)]">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-[var(--text-primary)]">{meta.titleEn}</div>
                        <div className="text-[10px] font-arabic text-[var(--brand-accent)]" dir="rtl">{meta.titleAr}</div>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[var(--text-secondary)] max-w-xs">
                        {meta.description}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1">
                          {perms.map((p) => (
                            <span
                              key={p}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card className="border-[var(--border-color)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Identity</TableHead>
              <TableHead>Institutional Email</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead>Account Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usersList.map((u) => {
              const roleMeta = ROLE_METADATA[u.role as Role] || ROLE_METADATA.read_only;
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-bold text-xs text-[var(--text-primary)]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-[4px] bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] flex items-center justify-center font-bold text-xs shrink-0">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <div>{u.fullName}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">{u.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-[var(--text-muted)]">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-semibold">
                      <Shield className="w-3 h-3 text-[var(--brand-accent)]" />
                      <span>{roleMeta.titleEn}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-[var(--text-secondary)] font-mono">
                    {new Date(u.createdAt).toISOString().split("T")[0]}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "accent" : "outline"} size="sm">
                      {u.isActive ? "Active Account" : "Suspended"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Provisioning Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Administrative User"
        description="Create an institutional account with designated least-privilege role permissions."
      >
        <div className="space-y-4">
          {state?.success && (
            <Alert variant="success" title="Account Provisioned">
              {state.message}
            </Alert>
          )}

          {state && !state.success && (
            <Alert variant="error" title="Provisioning Error">
              {state.message}
            </Alert>
          )}

          <form action={formAction} className="space-y-4">
            <Input
              label="Full Name & Title"
              name="fullName"
              placeholder="e.g. Dr. Tariq Al-Mansoor"
              required
            />

            <Input
              label="Institutional Email"
              name="email"
              type="email"
              placeholder="e.g. t.mansoor@arabicclub.org"
              required
              helperText="Official university or institutional domain required."
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] block">
                Assigned Administrative Role
              </label>
              <select
                name="role"
                defaultValue="content_editor"
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
                required
              >
                {institutionalRoles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} — {r.desc}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Initial Master Password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              required
              helperText="Must be min 8 characters with mixed case, number, and symbol."
            />

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="accent"
                size="md"
                disabled={isPending}
                leftIcon={<KeyRound className="w-3.5 h-3.5" />}
              >
                {isPending ? "Hashing & Registering..." : "Provision Account"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
