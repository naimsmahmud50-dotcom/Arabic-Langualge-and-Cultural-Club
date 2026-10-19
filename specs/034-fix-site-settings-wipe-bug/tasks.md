# Tasks: Fix Site Settings Data-Wipe Bug (034-fix-site-settings-wipe-bug)

## Phase 1: Setup & Safety Safeguards
- [x] T001 Export database backup snapshot and JSON dump of `site_settings` in `site_settings_backup_phase1.json`
- [x] T002 Update `.specify/feature.json` to point to `specs/034-fix-site-settings-wipe-bug`

## Phase 2: Foundational & Defensive Server Action (US2)
- [x] T003 [US2] Implement Zod validation schema for site settings with email, phone, URL, and length constraints in `src/lib/validations/settings.ts`
- [x] T004 [US2] Refactor `saveSiteSettingsAction` in `src/lib/actions/governance.ts` to defensively check `formData.has()` and only update provided keys

## Phase 3: Client Form State & UI Resilience (US1 & US3)
- [x] T005 [US1] Refactor `SettingsManagerClient.tsx` to maintain unified state and keep all tab forms mounted with CSS `hidden`
- [x] T006 [US3] Add toast notification feedback, active loading button spinner, and `beforeunload` unsaved changes warning in `SettingsManagerClient.tsx`

## Phase 4: Automated Verification & Regression Testing (US4)
- [x] T007 [US4] Write automated isolation test script in `scripts/test-settings-preserve.ts` verifying partial tab updates preserve other tabs
- [x] T008 [US4] Execute test script, verify zero data leakage or unintentional wipes in `arabic_club.db`

## Phase 5: Build, Typecheck & Verification
- [x] T009 Run TypeScript typecheck, linting, and Next.js build verification
- [x] T010 Final audit report and documentation handover
