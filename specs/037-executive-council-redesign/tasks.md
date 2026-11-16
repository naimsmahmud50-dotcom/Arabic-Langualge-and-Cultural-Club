# TASKS-037: Executive Council Section Redesign

## Phase 1: Data Contract Alignment
- [x] T001: Inspect `CommitteeMemberItem` in `src/components/home/CommitteePreviewSection.tsx` and verify `photoUrl` prop support.
- [x] T002: Ensure `src/app/(public)/page.tsx` passes `photoUrl` to `CommitteePreviewSection`.

## Phase 2: Component Engineering & Royal Visual Redesign
- [x] T003: Implement the Royal Islamic Mihrab arch frame, fallback calligraphic seals, and rank ribbons in `CommitteePreviewSection.tsx`.
- [x] T004: Implement the responsive multi-item interactive carousel (3 on desktop, 2 on tablet, 1 on mobile) with left/right golden arrow navigation, dot indicators, and play/pause toggle.
- [x] T005: Add touch-swipe gesture support for mobile devices with momentum and bounds checking.
- [x] T006: Integrate the 8-fold Islamic rosette watermark and Arabic calligraphic watermark (`المجلس التنفيذي`).
- [x] T007: Wire the "View Profile & Portfolio →" button to `/leadership#officer-[assignmentId]`.

## Phase 3: Quality Assurance & Non-Regression
- [x] T008: Run static analysis with `pnpm typecheck` to confirm zero TypeScript errors.
- [x] T009: Run unit tests with `pnpm test:unit` to ensure no regression.
- [x] T010: Run full production build with `pnpm build` to verify clean compilation.
- [x] T011: Verify git status to confirm strictly zero collateral changes in untouched files.
- [x] T012: Commit and push changes to git repository.
