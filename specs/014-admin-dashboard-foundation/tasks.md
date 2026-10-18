# TASKS: 014 - Admin Dashboard Foundation & CMS Shell

## Phase 1: Setup & Data Layer
- [x] T001 Update feature configuration in `.specify/feature.json`
- [x] T002 Enrich `getAdminDashboardMetrics()` in `src/lib/db/queries.ts` to include `unreadInquiries` from `contactInquiries` and ensure truthfulness

## Phase 2: Foundational Reusable Admin Components
- [x] T003 [P] Create `AdminEmptyState.tsx` in `src/components/admin/AdminEmptyState.tsx`
- [x] T004 [P] Create `AdminPagination.tsx` in `src/components/admin/AdminPagination.tsx`
- [x] T005 [P] Create `AdminFilterBar.tsx` in `src/components/admin/AdminFilterBar.tsx`
- [x] T006 [P] Create `AdminDataTable.tsx` in `src/components/admin/AdminDataTable.tsx`
- [x] T007 [P] Create `AdminConfirmModal.tsx` in `src/components/admin/AdminConfirmModal.tsx`
- [x] T008 Create export barrel in `src/components/admin/index.ts`

## Phase 3: User Story 1 & 2 - Responsive Shell, Mobile Nav & User Profile Header
- [x] T009 [US1] Create accessible `AdminMobileNav.tsx` drawer in `src/components/layout/AdminMobileNav.tsx`
- [x] T010 [US1] Upgrade `AdminHeader.tsx` in `src/components/layout/AdminHeader.tsx` with breadcrumbs, hamburger button, and User Profile Dropdown Menu
- [x] T011 [US1] Create `AdminShell.tsx` in `src/components/layout/AdminShell.tsx` to coordinate desktop sidebar and mobile drawer state
- [x] T012 [US1] Update `AdminSidebar.tsx` in `src/components/layout/AdminSidebar.tsx` to handle close callbacks when in mobile context
- [x] T013 [US1] Update `AdminLayout` in `src/app/admin/layout.tsx` to enforce server-side authentication defense-in-depth and wrap children with `AdminShell`

## Phase 4: User Story 3 & 4 - Master Command Center Page & Real Metrics
- [x] T014 [US3] Upgrade `src/app/admin/page.tsx` with enhanced stat cards (including unread inquiries), breadcrumbs, zero-state handlers, quick actions, and recent audit activity feed
- [x] T015 [US4] Verify role-aware navigation filtering across all 5 roles (`super_admin`, `admin`, `content_editor`, `membership_manager`, `event_manager`)

## Phase 5: Verification & Quality Assurance
- [x] T016 Build automated verification test suite in `src/lib/db/test-admin-dashboard-foundation.ts`
- [x] T017 Execute test suite and verify 100% pass rate
- [x] T018 Execute full regression suite across all 10 test suites
- [x] T019 Run `pnpm exec next build` to guarantee 0 TypeScript/ESLint errors
- [x] T020 Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`
