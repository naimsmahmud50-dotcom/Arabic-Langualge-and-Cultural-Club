/**
 * @file src/lib/auth/rbac.ts
 * @description Role-Based Access Control (RBAC) Engine and Route Policy Enforcer.
 * 
 * ARCHITECTURE & DESIGN:
 * - Implements the Principle of Least Privilege.
 * - Every route in `/admin/*` maps to an explicit operational permission.
 * - Server actions and API routes must invoke `assertPermission()` before executing DB mutations.
 * - UI navigation items check `hasPermission()` to avoid showing dead links, but security is
 *   enforced server-side in `middleware.ts` and Server Actions.
 */

import { Role, Permission } from "./types";

/**
 * Human-readable metadata for each institutional role.
 */
export const ROLE_METADATA: Record<
  Role,
  { titleEn: string; titleAr: string; description: string; badgeVariant: "accent" | "outline" | "neutral" | "primary" }
> = {
  super_admin: {
    titleEn: "Super Administrator",
    titleAr: "المشرف العام",
    description: "Full institutional governance: user provisioning, system security, and audit logs.",
    badgeVariant: "accent",
  },
  administrator: {
    titleEn: "Institutional Administrator",
    titleAr: "مدير الشؤون العامة",
    description: "Operational management of club programs, committees, members, and content.",
    badgeVariant: "neutral",
  },
  content_editor: {
    titleEn: "Content & Editorial Manager",
    titleAr: "محرر المحتوى والنشر",
    description: "Publishes articles, news bulletins, learning resources, and media assets.",
    badgeVariant: "outline",
  },
  membership_manager: {
    titleEn: "Membership Officer",
    titleAr: "مسؤول شؤون الأعضاء",
    description: "Processes student and scholar membership applications and verifies credentials.",
    badgeVariant: "outline",
  },
  event_manager: {
    titleEn: "Events & Program Coordinator",
    titleAr: "منسق الفعاليات والبرامج",
    description: "Schedules calendar events, manages annual roadmaps, and oversees registrations.",
    badgeVariant: "outline",
  },
  president: {
    titleEn: "Executive President",
    titleAr: "رئيس النادي",
    description: "Executive oversight of club activities, official announcements, and academic programs.",
    badgeVariant: "accent",
  },
  secretary: {
    titleEn: "General Secretary",
    titleAr: "الأمين العام",
    description: "Coordinates club administration, member records, and meeting agendas.",
    badgeVariant: "neutral",
  },
  media_manager: {
    titleEn: "Media & Archive Secretary",
    titleAr: "أمين الإعلام والتوثيق",
    description: "Directs media archives, photography, and publication layout releases.",
    badgeVariant: "outline",
  },
  read_only: {
    titleEn: "Institutional Observer",
    titleAr: "مراقب معتمد",
    description: "Read-only access to club performance dashboards and member rosters.",
    badgeVariant: "outline",
  },
};

/**
 * Explicit permissions granted to each role.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  super_admin: [
    "users:manage",
    "users:read",
    "settings:manage",
    "audit:read",
    "members:manage",
    "members:read",
    "applications:manage",
    "pages:manage",
    "news:manage",
    "resources:manage",
    "gallery:manage",
    "publications:manage",
    "achievements:manage",
    "media:manage",
    "events:manage",
    "plans:manage",
    "committees:manage",
    "dashboard:view",
  ],
  administrator: [
    "users:read",
    "audit:read",
    "members:manage",
    "members:read",
    "applications:manage",
    "pages:manage",
    "news:manage",
    "resources:manage",
    "gallery:manage",
    "publications:manage",
    "achievements:manage",
    "media:manage",
    "events:manage",
    "plans:manage",
    "committees:manage",
    "dashboard:view",
  ],
  content_editor: [
    "pages:manage",
    "news:manage",
    "resources:manage",
    "gallery:manage",
    "publications:manage",
    "achievements:manage",
    "media:manage",
    "dashboard:view",
  ],
  membership_manager: [
    "members:manage",
    "members:read",
    "applications:manage",
    "dashboard:view",
  ],
  event_manager: [
    "events:manage",
    "plans:manage",
    "dashboard:view",
  ],
  // Legacy / Institutional specific configurations
  president: [
    "events:manage",
    "plans:manage",
    "news:manage",
    "publications:manage",
    "members:read",
    "committees:manage",
    "dashboard:view",
  ],
  secretary: [
    "plans:manage",
    "news:manage",
    "applications:manage",
    "members:read",
    "dashboard:view",
  ],
  media_manager: [
    "gallery:manage",
    "media:manage",
    "resources:manage",
    "publications:manage",
    "dashboard:view",
  ],
  read_only: [
    "members:read",
    "dashboard:view",
  ],
};

/**
 * Route protection rules mapping path prefixes to required permissions.
 */
const ROUTE_PERMISSION_RULES: Array<{ prefix: string; permission: Permission }> = [
  { prefix: "/admin/users", permission: "users:manage" },
  { prefix: "/admin/settings", permission: "settings:manage" },
  { prefix: "/admin/inquiries", permission: "settings:manage" },
  { prefix: "/admin/audit-logs", permission: "audit:read" },
  { prefix: "/admin/founders", permission: "committees:manage" },
  { prefix: "/admin/committees", permission: "committees:manage" },
  { prefix: "/admin/members", permission: "members:manage" },
  { prefix: "/admin/applications", permission: "applications:manage" },
  { prefix: "/admin/events", permission: "events:manage" },
  { prefix: "/admin/gallery", permission: "gallery:manage" },
  { prefix: "/admin/news", permission: "news:manage" },
  { prefix: "/admin/resources", permission: "resources:manage" },
  { prefix: "/admin/publications", permission: "publications:manage" },
  { prefix: "/admin/pages", permission: "pages:manage" },
  { prefix: "/admin", permission: "dashboard:view" },
];

/**
 * Checks if a given role possesses an operational permission.
 */
export function hasPermission(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Determines the required permission for a specific route pathname.
 * Returns null if the route does not require admin authentication (e.g. /admin/login).
 */
export function getRequiredPermissionForRoute(pathname: string): Permission | null {
  // Public auth pathways inside /admin
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password" ||
    pathname === "/admin/forbidden"
  ) {
    return null;
  }

  for (const rule of ROUTE_PERMISSION_RULES) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return rule.permission;
    }
  }

  // Any other /admin route defaults to dashboard view
  return "dashboard:view";
}

/**
 * Evaluates whether a role is authorized to visit a specific administrative pathname.
 */
export function canAccessRoute(role: Role | undefined | null, pathname: string): boolean {
  const required = getRequiredPermissionForRoute(pathname);
  if (!required) return true; // public or unmapped
  return hasPermission(role, required);
}

/**
 * Custom error class for authorization failures with HTTP status code support.
 */
export class AuthorizationError extends Error {
  statusCode: number;
  code: string;

  constructor(message = "You lack authorization to perform this institutional operation.", code = "FORBIDDEN") {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = 403;
    this.code = code;
  }
}

/**
 * Enforces server-side authorization. Throws AuthorizationError if insufficient.
 */
export function assertPermission(role: Role | undefined | null, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new AuthorizationError(
      `Access Denied: Role '${role || "unauthenticated"}' does not have required permission '${permission}'.`
    );
  }
}
