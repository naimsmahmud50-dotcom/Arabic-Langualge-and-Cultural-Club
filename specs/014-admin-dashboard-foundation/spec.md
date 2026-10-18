# SPECIFICATION: 014 - Admin Dashboard Foundation & CMS Shell

## Overview
Build the real administrative dashboard foundation and CMS shell for the Arabic Language & Cultural Club.
This provides the secure architectural container for all subsequent administrative operations and modules, featuring server-side access protection, responsive navigation with mobile drawer support, breadcrumbs, user profile dropdown with session management, role-aware navigation based on granular permissions, real database metrics (with strict zero-state anti-fabrication enforcement), and reusable administrative UI building blocks (data tables, filter bars, pagination, confirmation modals, and empty states).

## User Stories & Acceptance Criteria

### User Story 1 (P1): Secure Admin Shell & Server-Side Access Protection
**Goal**: Authorized executive members and staff can access their administrative workspace while unauthorized visitors and anonymous sessions are strictly prevented from viewing administrative data or interfaces.
- **Criteria 1.1**: Server layout (`AdminLayout`) verifies active session tokens via `getSession()`. Direct anonymous requests to `/admin/*` are redirected to `/admin/login?next=/admin`.
- **Criteria 1.2**: Edge middleware and route handlers enforce role-based access control (RBAC) based on least privilege.
- **Criteria 1.3**: Admin layout renders responsive sidebar on desktop (>= 768px) and accessible mobile navigation drawer on mobile (< 768px).

### User Story 2 (P1): Responsive Mobile Navigation & Admin Header
**Goal**: Administrators on any device (mobile, tablet, desktop) can navigate across CMS modules without broken layouts or lost navigation context.
- **Criteria 2.1**: `AdminHeader` provides mobile hamburger button that toggles the slide-out navigation drawer with smooth animation, backdrop blur overlay, and ESC key listener.
- **Criteria 2.2**: `AdminHeader` renders accessible breadcrumbs (`<nav aria-label="Breadcrumb">`) displaying current location hierarchy (e.g. `Admin / Overview`, `Admin / Inquiries`).
- **Criteria 2.3**: `AdminHeader` features an accessible User Profile Dropdown Menu showing the logged-in administrator's avatar monogram, full name, role badge, email address, role description, and a one-click Sign Out action that clears session cookies and logs to `audit_logs`.
- **Criteria 2.4**: Seamless theme switching (Light / Dark) persisting user preference with zero layout shift.

### User Story 3 (P1): Real Database Dashboard Metrics & Audit Activity
**Goal**: Club executives can review genuine operational counts on the command center without decorative or fabricated statistics.
- **Criteria 3.1**: Dashboard stat cards query real SQLite database counts:
  - Active Members (`members.status = 'active'`)
  - Pending Membership Applications (`membership_applications.status = 'pending'`)
  - Scheduled & Upcoming Events (`events`)
  - Curated Gallery Albums (`gallery_albums`)
  - Published Announcements (`announcements.isPublished = true`)
  - Unread Inquiries from Secretariat Inbox (`contact_inquiries.status = 'unread'`)
- **Criteria 3.2**: Strictly zero fake stats: if a count is 0, render an honest "0" count with clear zero-state explanation (never fill with demo figures).
- **Criteria 3.3**: Real-time Recent Activity feed queries the `audit_logs` table, displaying action names, target entities, timestamps, and status badges. If no logs exist, show an accessible empty state.

### User Story 4 (P1): Role-Aware Navigation
**Goal**: Club staff with limited roles (e.g. Content Editor, Membership Manager, Event Manager) only see navigation items and tools corresponding to their assigned permissions.
- **Criteria 4.1**: Navigation links in both desktop sidebar and mobile drawer are filtered using `hasPermission(role, permission)`.
- **Criteria 4.2**: Restricted roles cannot view navigation items for Users & Roles, Site Settings, or System Audit Logs.

### User Story 5 (P2): Reusable Admin UI Building Blocks
**Goal**: Subsequent CMS modules can utilize unified, accessible, and high-quality administrative UI primitives.
- **Criteria 5.1**: `AdminDataTable`: Accessible data table with responsive horizontal overflow, empty state support, header sorting indicators, and custom row actions.
- **Criteria 5.2**: `AdminFilterBar`: Status filter tabs, keyword search with clear button, category selector, and active result counter.
- **Criteria 5.3**: `AdminPagination`: Accessible pagination controls with page numbers, prev/next buttons, and range summary ("Showing 1 to 10 of 42 results").
- **Criteria 5.4**: `AdminConfirmModal`: Accessible modal dialog for critical destructive actions (Delete, Archive, Revoke) with confirmation dialog styling, ESC key trap, and focus management.
- **Criteria 5.5**: `AdminEmptyState`: Contextual empty state with icon, title, description, and action button.

## Security & Compliance Rules (Strix-Supabase & Human Vibe)
- Strictly zero AI emojis; only authentic academic design, refined typography, and Lucide SVG icons.
- Complete JSDoc developer headers on every modified and newly created file.
- Strict server-side verification and zero PII leaks.
- 100% automated test verification before completion.
