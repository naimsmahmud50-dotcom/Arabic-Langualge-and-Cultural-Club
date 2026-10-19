<!--
  DEVELOPER NOTE:
  File: specs/033-navigation-and-page-layout-decoupling/tasks.md
  Feature: Website Navigation and Standalone Page Layout Decoupling
  Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)
  Society: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
  Strictly human vibe; zero AI emojis.
-->

# TASKS: 033 - Navigation and Standalone Page Layout Decoupling

## Phase 1: Setup & Foundational
- [x] T001 [Setup] Initialize feature branch tracking and verify server status on port 3005

## Phase 2: User Story 1 - Home Dashboard Overview Restructuring [US1]
- [x] T002 [US1] Implement Overview Hub Gateway in `src/components/home/OverviewGatewaySection.tsx`
- [x] T003 [US1] Restructure `src/app/(public)/page.tsx` to display focused overview without monolithic section cascade
- [x] T004 [US1] Export `OverviewGatewaySection` from `src/components/home/index.ts`

## Phase 3: User Story 2 - Standalone Page Content Completeness [US2]
- [x] T005 [P] [US2] Integrate Cultural Programs & Rhetoric Circles into `src/app/(public)/about/page.tsx`
- [x] T006 [P] [US2] Verify independent rendering of `/events`, `/gallery`, `/resources`, `/news`, `/publications`, `/founders`, `/leadership`

## Phase 4: User Story 3 - Navigation Alignment Across Desktop & Mobile [US3]
- [x] T007 [US3] Update primary navigation items in `src/components/layout/Header.tsx` including `/publications`
- [x] T008 [US3] Update mobile drawer menu in `src/components/layout/MobileNav.tsx` with complete standalone links
- [x] T009 [US3] Verify footer sitemap links in `src/components/layout/Footer.tsx`

## Phase 5: Verification & Quality Assurance [US4]
- [x] T010 [US4] Run `pnpm typecheck` to verify 0 compiler errors
- [x] T011 [US4] Run automated regression test suite (`pnpm test`)
- [x] T012 [US4] Execute production build (`pnpm build`) and restart systemd service
- [x] T013 [US4] Curl test all 11 standalone routes to confirm HTTP 200 OK
- [x] T014 [US4] Deliver comprehensive handover report in Bengali
