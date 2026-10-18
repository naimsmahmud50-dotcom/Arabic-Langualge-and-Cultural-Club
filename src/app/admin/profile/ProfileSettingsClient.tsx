/**
 * @file src/app/admin/profile/ProfileSettingsClient.tsx
 * @description Interactive Client Console for Operator Profile & Self-Service Password Security.
 * 
 * ARCHITECTURE & USER EXPERIENCE:
 * - Allows operators to securely change their password with Scrypt hashing and complexity validation.
 * - Displays active session credentials, role scope, and assigned least-privilege permissions.
 * - Human-crafted UI: strictly zero AI emojis; uses authentic typography, Lucide SVG icons, and responsive cards.
 * - Meets Requirement REQ-ADM-11 and SPEC-SEC-01.
 */

"use client";

import React, { useActionState, useEffect } from "react";
import { Card, Badge, Button, Input, Alert } from "@/components/ui";
import { Shield, KeyRound, User, Mail, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { changeUserPasswordAction } from "@/lib/actions/governance";
import { ROLE_METADATA, ROLE_PERMISSIONS } from "@/lib/auth/rbac";
import { Role, ActionResponse } from "@/lib/auth/types";

interface ProfileSettingsClientProps {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
  };
}

export function ProfileSettingsClient({ user }: ProfileSettingsClientProps) {
  const [passwordState, passwordFormAction, isPasswordPending] = useActionState<
    ActionResponse | null,
    FormData
  >(changeUserPasswordAction, null);

  const roleMeta = ROLE_METADATA[user.role as Role] || ROLE_METADATA.read_only;
  const userPerms = ROLE_PERMISSIONS[user.role as Role] || [];

  return (
    <div className="space-y-6">
      {/* Operator Identity Summary Card */}
      <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[6px] bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] flex items-center justify-center font-bold text-lg font-mono">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {user.fullName}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono">
                Operator ID: {user.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">
              {user.isActive ? "Active Account" : "Suspended"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <Mail className="w-3.5 h-3.5" />
              <span>Institutional Email</span>
            </div>
            <div className="font-mono font-semibold text-[var(--text-primary)] truncate">
              {user.email}
            </div>
          </div>

          <div className="p-3.5 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <Shield className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
              <span>Institutional Role</span>
            </div>
            <div className="font-semibold text-[var(--text-primary)]">
              {roleMeta.titleEn}
            </div>
            <div className="text-[10px] font-arabic text-[var(--brand-accent)]" dir="rtl">
              {roleMeta.titleAr}
            </div>
          </div>

          <div className="p-3.5 rounded-[6px] bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <Clock className="w-3.5 h-3.5" />
              <span>Registered Date</span>
            </div>
            <div className="font-mono text-[var(--text-secondary)]">
              {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Assigned Operational Permissions */}
        <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
          <label className="text-xs font-semibold text-[var(--text-primary)] block">
            Granted Least-Privilege Permissions:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {userPerms.map((perm) => (
              <span
                key={perm}
                className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              >
                {perm}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Password Change Card */}
      <Card className="border-[var(--border-color)] p-6 sm:p-8 space-y-6">
        <div className="border-b border-[var(--border-color)] pb-4">
          <Badge variant="accent" size="sm">Credential Security</Badge>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
            Update Administrative Password
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Passwords are encrypted using native Node.js Scrypt memory-hard key derivation.
          </p>
        </div>

        {passwordState?.success && (
          <Alert variant="success" title="Password Updated">
            {passwordState.message}
          </Alert>
        )}

        {passwordState && !passwordState.success && (
          <Alert variant="error" title="Security Requirement Unmet">
            {passwordState.message}
          </Alert>
        )}

        <form action={passwordFormAction} className="space-y-4 max-w-lg">
          <input type="hidden" name="userId" value={user.id} />

          <Input
            label="Current Password"
            name="currentPassword"
            type="password"
            placeholder="••••••••••••"
            required
            helperText="Required to verify identity before modifying credentials."
          />

          <Input
            label="New Master Password"
            name="newPassword"
            type="password"
            placeholder="••••••••••••"
            required
            helperText="Must contain minimum 8 characters with uppercase, lowercase, number, and symbol."
          />

          <Input
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            placeholder="••••••••••••"
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="accent"
              size="md"
              disabled={isPasswordPending}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              {isPasswordPending ? "Hashing & Saving..." : "Update Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
