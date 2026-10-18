# TASKS: 015 - Institutional Content CMS Modules

## Phase 1: Setup & Database Query Layer
- [x] T001 Update feature configuration in `.specify/feature.json`
- [x] T002 Add administrative database mutations for pages and sections in `src/lib/db/queries.ts`
- [x] T003 Add administrative database mutations for founders in `src/lib/db/queries.ts`
- [x] T004 Add administrative database mutations for committee terms and assignments in `src/lib/db/queries.ts`
- [x] T005 Add administrative database mutations for members in `src/lib/db/queries.ts`

## Phase 2: Secure Server Actions Layer (RBAC & Audit Logging)
- [x] T006 [P] Create `src/lib/actions/pages.ts` for page and section mutations with RBAC (`pages:manage`)
- [x] T007 [P] Create `src/lib/actions/founders.ts` for founder mutations with RBAC (`committees:manage`)
- [x] T008 [P] Create `src/lib/actions/committees.ts` for term and assignment mutations with RBAC (`committees:manage`)
- [x] T009 [P] Create `src/lib/actions/members.ts` for member profile and visibility mutations with RBAC (`members:manage`)

## Phase 3: User Story 1 - Website Pages & Sections CMS (`/admin/pages`)
- [x] T010 [US1] Create `PageSectionModal.tsx` in `src/app/admin/pages/PageSectionModal.tsx`
- [x] T011 [US1] Create `AdminPagesClient.tsx` in `src/app/admin/pages/AdminPagesClient.tsx`
- [x] T012 [US1] Upgrade `src/app/admin/pages/page.tsx` with dynamic DB data fetching and client management

## Phase 4: User Story 2 - Founders & Originators CMS (`/admin/founders`)
- [x] T013 [US2] Create `FounderFormModal.tsx` in `src/app/admin/founders/FounderFormModal.tsx`
- [x] T014 [US2] Create `AdminFoundersClient.tsx` in `src/app/admin/founders/AdminFoundersClient.tsx`
- [x] T015 [US2] Upgrade `src/app/admin/founders/page.tsx` with live database curation and status toggles

## Phase 5: User Story 3 - Committee Terms & Preservation Management (`/admin/committees`)
- [x] T016 [US3] Create `CommitteeTermModal.tsx` and `AssignMemberModal.tsx` in `src/app/admin/committees/`
- [x] T017 [US3] Create `AdminCommitteesClient.tsx` in `src/app/admin/committees/AdminCommitteesClient.tsx`
- [x] T018 [US3] Upgrade `src/app/admin/committees/page.tsx` with term preservation, current switch, and assignment roster

## Phase 6: User Story 4 - Member Records & Privacy Console (`/admin/members`)
- [x] T019 [US4] Create `MemberFormModal.tsx` in `src/app/admin/members/MemberFormModal.tsx`
- [x] T020 [US4] Create `AdminMembersClient.tsx` in `src/app/admin/members/AdminMembersClient.tsx`
- [x] T021 [US4] Upgrade `src/app/admin/members/page.tsx` with full database records, search, and visibility controls

## Phase 7: Verification & Quality Assurance
- [x] T022 Build automated verification test suite in `src/lib/db/test-institutional-content-cms.ts`
- [x] T023 Execute test suite and verify 100% pass rate
- [x] T024 Execute full regression suite across all test suites
- [x] T025 Run `pnpm exec next build` to guarantee 0 TypeScript/ESLint errors
- [x] T026 Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`
