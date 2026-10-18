# TASKS: 016 - Events & Annual Plans CMS Modules

## Phase 1: Database Query Layer
- [x] T001 Update feature configuration in `.specify/feature.json`
- [x] T002 Implement event management queries (`getAdminEvents`, `getAdminEventById`, `createEvent`, `updateEvent`, `deleteEvent`) in `src/lib/db/queries.ts`
- [x] T003 Implement annual plans admin queries (`getAdminAnnualPlans`, `getAnnualPlanById`) in `src/lib/db/queries.ts`

## Phase 2: Secure Server Actions Layer (RBAC & Audit Logging)
- [x] T004 Create event CRUD and status transition actions (`saveEventAction`, `updateEventStatusAction`, `deleteEventAction`) in `src/lib/actions/events.ts`
- [x] T005 Create attendance verification action (`updateRegistrationAttendanceAction`) in `src/lib/actions/events.ts`
- [x] T006 Create annual plan activity actions (`saveAnnualPlanActivityAction`, `deleteAnnualPlanActivityAction`) in `src/lib/actions/events.ts`

## Phase 3: Administrative UI Components & Modals
- [x] T007 Create `EventFormModal.tsx` in `src/app/admin/events/EventFormModal.tsx`
- [x] T008 Create `EventAttendeesModal.tsx` in `src/app/admin/events/EventAttendeesModal.tsx`
- [x] T009 Create `AnnualPlanActivityModal.tsx` in `src/app/admin/events/AnnualPlanActivityModal.tsx`
- [x] T010 Create `AdminEventsClient.tsx` in `src/app/admin/events/AdminEventsClient.tsx`
- [x] T011 Upgrade `src/app/admin/events/page.tsx` with dynamic DB data fetching and dual-tab layout

## Phase 4: Automated Verification & QA
- [x] T012 Build automated test suite in `src/lib/db/test-events-annual-plans-cms.ts`
- [x] T013 Execute test suite and verify 100% pass rate
- [x] T014 Execute full regression test suite across all 12 database test suites
- [x] T015 Run `pnpm exec next build` verifying clean production build
- [x] T016 Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`
