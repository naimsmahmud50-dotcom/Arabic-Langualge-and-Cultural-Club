# TASKS: 007 - Founders, Committee & Member Directory

## Phase 1: Data Operations & Seed Fixtures
- [x] T001: Implement administrative and helper data operations in `src/lib/db/queries.ts` (`createCommitteeTerm`, `assignMemberToCommittee`, `getMemberCommitteeHistory`, `setMemberPublicVisibility`, `getAdminFounders`, `getAdminMembers`).
- [x] T002: Enrich seed fixtures in `src/lib/db/seed.ts` with complete founders, multi-term committee assignments across 3 terms, and verified public + private test members.
- [x] T003: Write automated test suite in `src/lib/db/test-founders-leadership-members.ts` verifying historical preservation, multi-term service, privacy filtering, and date validation.

## Phase 2: Implement `/founders` Page
- [x] T004: Enhance `src/app/(public)/founders/page.tsx` with founding narrative, charter citation, verified founder cards with elegant neutral avatar fallbacks, and cross-links.

## Phase 3: Implement `/leadership` Page
- [x] T005: Enhance `src/app/(public)/leadership/page.tsx` with dynamic term-by-term selector, active vs historical term badges, date ranges, multi-term service indicators, and officer roster sorted by rank.

## Phase 4: Implement `/members` Page
- [x] T006: Enhance `src/app/(public)/members/page.tsx` with privacy notice banner, search/filter toolbar, pagination, member cards with neutral avatar fallbacks, and committee service tags.

## Phase 5: Verification & Checklists
- [x] T007: Run automated test suite `test-founders-leadership-members.ts` and confirm 100% pass rate.
- [x] T008: Run full build check `pnpm next build` and verify 0 errors.
- [x] T009: Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`.
