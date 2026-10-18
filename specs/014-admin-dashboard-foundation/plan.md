# IMPLEMENTATION PLAN: 014 - Admin Dashboard Foundation & CMS Shell

## Architecture Overview
The Administrative Dashboard Foundation establishes the CMS application shell for the Arabic Language & Cultural Club platform.
It bridges server-side session authentication with client-side responsive interactions (desktop sidebar, mobile navigation drawer, user profile dropdown, and theme toggle), computes truthful database metrics without mocked numbers, and introduces standardized administrative building blocks for subsequent CMS modules.

## Component Architecture & Data Flow

```
                      +-----------------------------+
                      |   Browser / Client Device   |
                      +--------------+--------------+
                                     |
                       HTTP Request to /admin/*
                                     |
                                     v
                      +-----------------------------+
                      |     middleware.ts (Edge)    |
                      |  Session validation & RBAC  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    src/app/admin/layout     |
                      |  Server-Side Session Check  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    AdminShell.tsx (Client)  |
                      |  Drawer State & Layout Grid |
                      +-------+-------------+-------+
                              |             |
            Desktop View      |             | Mobile View (< 768px)
            (>= 768px)        v             v
       +-----------------------+   +-----------------------+
       |   AdminSidebar.tsx    |   |   AdminMobileNav.tsx  |
       | Role-aware nav groups |   | Slide-out drawer/trap |
       +-----------------------+   +-----------------------+
                              \             /
                               \           /
                                v         v
                      +-----------------------------+
                      |     AdminHeader.tsx         |
                      | Hamburger, Breadcrumbs,     |
                      | ThemeToggle, UserProfileMenu|
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |       /admin/page.tsx       |
                      | Real SQLite Metrics, Cards, |
                      | Quick Actions, Audit Stream |
                      +-----------------------------+
```

## Reusable Admin UI Building Blocks (`src/components/admin/`)
1. `AdminDataTable.tsx`: Standard data table with sortable columns, responsive wrapper, empty states, and action menus.
2. `AdminFilterBar.tsx`: Status tabs, search input with instant clear, category selector, and active counter.
3. `AdminPagination.tsx`: Accessible pagination controls with page links and range details.
4. `AdminConfirmModal.tsx`: Accessible confirmation modal with focus trap, ESC listener, and destructive styling.
5. `AdminEmptyState.tsx`: Reusable empty state with icon, headline, narrative, and call to action.
6. `index.ts`: Export barrel.

## Database & Query Layer (`src/lib/db/queries.ts`)
Update `getAdminDashboardMetrics()`:
- `totalEvents`: count of all events
- `totalUpcoming`: count of confirmed future events
- `totalMembers`: count of active members
- `pendingApplications`: count of pending applications
- `totalAlbums`: count of gallery albums
- `totalAnnouncements`: count of published announcements
- `unreadInquiries`: count of unread contact inquiries (`contact_inquiries.status = 'unread'`)
- `recentLogs`: top 8 most recent entries from `audit_logs` ordered by `createdAt DESC`

## Security & Access Control
- Unauthenticated requests are redirected to `/admin/login`.
- Navigation items in `AdminSidebar` and `AdminMobileNav` dynamically respect role permissions (`ROLE_PERMISSIONS`).
- Strictly zero fake stats: if an entity has 0 records, render 0 with explicit zero state.
- Strictly no AI emojis; only clean Lucide SVG icons.
- Complete JSDoc developer headers on all files.
