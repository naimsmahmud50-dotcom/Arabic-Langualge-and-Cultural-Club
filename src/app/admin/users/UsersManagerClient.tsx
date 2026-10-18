/**
 * @file src/app/admin/users/UsersManagerClient.tsx
 * @description Comprehensive Administrative Identity & Role Governance Console.
 * 
 * ARCHITECTURE & USER EXPERIENCE:
 * - Provides Super Admins with secure operator provisioning, role assignment, and status toggles.
 * - Enforces anti-self-lockout (administrators cannot suspend their own account).
 * - Enforces anti-self-demotion (sole active Super Admin cannot demote themselves).
 * - Provides self-service and administrative password update with Scrypt verification.
 * - Renders the institutional Least-Privilege RBAC Permission Matrix.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography, Lucide SVG icons, and responsive cards.
 * - Meets Requirements REQ-ADM-11, REQ-SEC-01, and SPEC-SEC-01 through SPEC-SEC-03.
 */

"use client";

import React, { useState, useActionState, useEffect, useTransition } from "react";
import {
  Card,
  Badge,
  Button,
  Input,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Modal,
  Alert,
} from "@/components/ui";
import {
  ShieldCheck,
  Plus,
  Shield,
  KeyRound,
  Info,
  Search,
  UserX,
  UserCheck,
  UserCog,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { provisionUserAction } from "@/lib/auth/actions";
import {
  updateUserStatusAction,
  updateUserRoleAction,
  changeUserPasswordAction,
} from "@/lib/actions/governance";
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
  currentUserId: string;
}

export function UsersManagerClient({
  usersList,
  currentRole,
  currentUserId,
}: UsersManagerClientProps) {
  const [showMatrix, setShowMatrix] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<UserRecord | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<UserRecord | null>(null);

  // General feedback alert
  const [generalFeedback, setGeneralFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [isPendingAction, startTransition] = useTransition();

  const canManageUsers = hasPermission(currentRole, "users:manage");

  // Provisioning form state
  const [provisionState, provisionFormAction, isProvisionPending] = useActionState<
    ActionResponse | null,
    FormData
  >(provisionUserAction, null);

  // Password change form state
  const [passwordState, passwordFormAction, isPasswordPending] = useActionState<
    ActionResponse | null,
    FormData
  >(changeUserPasswordAction, null);

  useEffect(() => {
    if (provisionState?.success) {
      const timer = setTimeout(() => {
        setIsProvisionOpen(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [provisionState?.success]);

  useEffect(() => {
    if (passwordState?.success) {
      const timer = setTimeout(() => {
        setPasswordModalUser(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [passwordState?.success]);

  const institutionalRoles: Array<{ value: Role; label: string; desc: string }> = [
    { value: "super_admin", label: "Super Administrator", desc: "Full root access, audit logs, system config, user provisioning" },
    { value: "administrator", label: "General Administrator", desc: "Operational management of club programs, committees, and content" },
    { value: "content_editor", label: "Content Editor", desc: "CMS pages, announcements, Arabic resources, publications, gallery" },
    { value: "membership_manager", label: "Membership Manager", desc: "Applications queue review, member directory & verification" },
    { value: "event_manager", label: "Event Manager", desc: "Calendar events, 12-month annual plan, event registration lists" },
  ];

  // Status Toggle Handler
  const handleToggleStatus = (target: UserRecord) => {
    if (target.id === currentUserId) {
      setGeneralFeedback({
        success: false,
        message: "Security Violation: You cannot suspend your own administrative account.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateUserStatusAction(target.id, !target.isActive);
        setGeneralFeedback({
          success: res.success,
          message: res.message || "",
        });
      } catch (err: any) {
        setGeneralFeedback({
          success: false,
          message: err.message || "Failed to update account status.",
        });
      }
    });
  };

  // Role Update Handler
  const handleRoleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!roleModalUser) return;
    const formData = new FormData(e.currentTarget);
    const newRole = formData.get("role") as Role;

    startTransition(async () => {
      try {
        const res = await updateUserRoleAction(roleModalUser.id, newRole);
        setGeneralFeedback({
          success: res.success,
          message: res.message || "",
        });
        if (res.success) {
          setRoleModalUser(null);
        }
      } catch (err: any) {
        setGeneralFeedback({
          success: false,
          message: err.message || "Failed to update user role.",
        });
      }
    });
  };

  // Filtered List
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "suspended" && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

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
              onClick={() => setIsProvisionOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Provision Administrator Account
            </Button>
          )}
        </div>
      </div>

      {/* General Alert Feedback */}
      {generalFeedback && (
        <Alert
          variant={generalFeedback.success ? "success" : "error"}
          title={generalFeedback.success ? "Operation Succeeded" : "Action Blocked"}
        >
          {generalFeedback.message}
        </Alert>
      )}

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
              Enforced at Middleware, Server Action & Query layers
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

      {/* Filter & Search Bar */}
      <Card className="border-[var(--border-color)] p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by name, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden"
            >
              <option value="all">All Roles</option>
              {institutionalRoles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border-[var(--border-color)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Identity</TableHead>
              <TableHead>Institutional Email</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead className="text-right">Governance Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => {
                const roleMeta = ROLE_METADATA[u.role as Role] || ROLE_METADATA.read_only;
                const isSelf = u.id === currentUserId;

                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-bold text-xs text-[var(--text-primary)]">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[4px] bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] flex items-center justify-center font-bold text-xs shrink-0">
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{u.fullName}</span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--brand-accent)]">
                                You
                              </span>
                            )}
                          </div>
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
                    <TableCell>
                      <Badge variant={u.isActive ? "accent" : "outline"} size="sm">
                        {u.isActive ? "Active Account" : "Suspended"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[var(--text-secondary)] font-mono">
                      {new Date(u.createdAt).toISOString().split("T")[0]}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Change Role Button */}
                        {canManageUsers && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRoleModalUser(u)}
                            leftIcon={<UserCog className="w-3.5 h-3.5" />}
                            title="Modify Role"
                          >
                            Role
                          </Button>
                        )}

                        {/* Change Password Button */}
                        {(canManageUsers || isSelf) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPasswordModalUser(u)}
                            leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                            title="Update Password"
                          >
                            Password
                          </Button>
                        )}

                        {/* Status Toggle Button */}
                        {canManageUsers && !isSelf && (
                          <Button
                            variant={u.isActive ? "outline" : "accent"}
                            size="sm"
                            onClick={() => handleToggleStatus(u)}
                            disabled={isPendingAction}
                            leftIcon={u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          >
                            {u.isActive ? "Suspend" : "Activate"}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-[var(--text-secondary)]">
                  No administrative operators matching current search or filter criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* PROVISIONING MODAL */}
      <Modal
        isOpen={isProvisionOpen}
        onClose={() => setIsProvisionOpen(false)}
        title="Provision Administrative User"
        description="Create an institutional account with designated least-privilege role permissions."
      >
        <div className="space-y-4">
          {provisionState?.success && (
            <Alert variant="success" title="Account Provisioned">
              {provisionState.message}
            </Alert>
          )}

          {provisionState && !provisionState.success && (
            <Alert variant="error" title="Provisioning Error">
              {provisionState.message}
            </Alert>
          )}

          <form action={provisionFormAction} className="space-y-4">
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
                onClick={() => setIsProvisionOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="accent"
                size="md"
                disabled={isProvisionPending}
                leftIcon={<KeyRound className="w-3.5 h-3.5" />}
              >
                {isProvisionPending ? "Hashing & Registering..." : "Provision Account"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* CHANGE ROLE MODAL */}
      {roleModalUser && (
        <Modal
          isOpen={Boolean(roleModalUser)}
          onClose={() => setRoleModalUser(null)}
          title={`Modify Role: ${roleModalUser.fullName}`}
          description="Update administrative authorization tier under least-privilege governance."
        >
          <form onSubmit={handleRoleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-primary)] block">
                Select Institutional Role
              </label>
              <select
                name="role"
                defaultValue={roleModalUser.role}
                className="w-full px-3 py-2 text-xs rounded-[6px] border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--brand-primary)]"
              >
                {institutionalRoles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} — {r.desc}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[var(--border-subtle)]">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setRoleModalUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="accent"
                size="md"
                disabled={isPendingAction}
              >
                {isPendingAction ? "Updating..." : "Save Role Assignment"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* PASSWORD CHANGE MODAL */}
      {passwordModalUser && (
        <Modal
          isOpen={Boolean(passwordModalUser)}
          onClose={() => setPasswordModalUser(null)}
          title={`Update Password: ${passwordModalUser.fullName}`}
          description="Enforce Scrypt encryption with mandatory complexity validation."
        >
          <div className="space-y-4">
            {passwordState?.success && (
              <Alert variant="success" title="Password Updated">
                {passwordState.message}
              </Alert>
            )}

            {passwordState && !passwordState.success && (
              <Alert variant="error" title="Update Error">
                {passwordState.message}
              </Alert>
            )}

            <form action={passwordFormAction} className="space-y-4">
              <input type="hidden" name="userId" value={passwordModalUser.id} />

              {passwordModalUser.id === currentUserId && (
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  placeholder="••••••••••••"
                  required
                  helperText="Required to verify identity for self-service password update."
                />
              )}

              <Input
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="••••••••••••"
                required
                helperText="Must be min 8 chars with uppercase, lowercase, number, and symbol."
              />

              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••••••"
                required
              />

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[var(--border-subtle)]">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setPasswordModalUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="md"
                  disabled={isPasswordPending}
                  leftIcon={<KeyRound className="w-3.5 h-3.5" />}
                >
                  {isPasswordPending ? "Hashing & Saving..." : "Save Password"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
