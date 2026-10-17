/**
 * @file src/lib/auth/types.ts
 * @description Core Authentication and Role-Based Access Control (RBAC) Type Definitions.
 * 
 * ARCHITECTURE & GOVERNANCE:
 * - Implements strict principle of least privilege across 5 institutional roles:
 *   1. Super Admin: Root system governance, user provisioning, audit inspection, system config.
 *   2. Administrator: General administrative operations across all club activities.
 *   3. Content Editor: Archival and public messaging, news, pages, library, publications.
 *   4. Membership Manager: Student/scholar membership applications, directory verification.
 *   5. Event Manager: Annual 12-month plan, event scheduling, registration rosters.
 * 
 * NOTE FOR DEVELOPERS:
 * When adding a new privileged action or route, define an explicit Permission string below,
 * map it into the ROLE_PERMISSIONS matrix in `rbac.ts`, and guard both the route (in `middleware.ts`)
 * and the Server Action / DB query (using `assertPermission`).
 */

export type Role =
  | "super_admin"
  | "administrator"
  | "content_editor"
  | "membership_manager"
  | "event_manager"
  // Legacy / Institutional Title Aliases
  | "president"
  | "secretary"
  | "media_manager"
  | "read_only";

export type Permission =
  // User & Identity Governance
  | "users:manage"        // Create, update, deactivate administrative users
  | "users:read"          // View administrative users list
  // System Configuration & Auditing
  | "settings:manage"     // Modify global site settings, branding, metadata
  | "audit:read"          // View immutable audit logs
  // Membership & Identity
  | "members:manage"      // Edit and verify member records, export roster
  | "members:read"        // View member directory
  | "applications:manage" // Review, approve, reject membership applications
  // Content & Academic Resources
  | "pages:manage"        // Edit CMS pages and sections
  | "news:manage"         // Publish announcements and press releases
  | "resources:manage"    // Upload and curate Arabic learning resources
  | "gallery:manage"      // Create albums and manage photo assets
  | "publications:manage" // Publish academic papers, journals, newsletters
  | "achievements:manage" // Manage club awards and historical milestones
  | "media:manage"        // Manage media library files
  // Events & Operations
  | "events:manage"       // Create and manage calendar events, export registrations
  | "plans:manage"        // Manage 12-month annual operational plan
  | "committees:manage"   // Manage executive terms, positions, and appointments
  // General Dashboard Access
  | "dashboard:view";     // Access base admin dashboard metrics

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  role: Role;
  userEmail: string;
  fullName: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface RateLimitStatus {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: T;
}
