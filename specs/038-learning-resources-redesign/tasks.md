# TASKS-038: Arabic Learning Resources Section Redesign

## Phase 1: Architecture & State Setup
- [x] T001: Convert `src/components/home/LearningResourcesSection.tsx` to a Client Component with `"use client"`.
- [x] T002: Set up responsive state (`activeIndex`, `visibleCards`, `stepPx`, `isPaused`, `isHovered`, `isTouching`).

## Phase 2: Visual & Heritage Redesign
- [x] T003: Implement the Royal Islamic Moorish arched medallion and format-specific insignias.
- [x] T004: Implement metallic gold skill level ribbons with authentic Arabic labels (`المستوى التمهيدي`, `المستوى المتوسط`, `المستوى المتقدم`).
- [x] T005: Embed the 8-fold Islamic rosette watermark and Arabic calligraphic watermark (`المكتبة التراثية`).
- [x] T006: Upgrade card typography, metadata badges, and "Access Scholarly Material →" action buttons.

## Phase 3: Auto-Slide Engine & Navigation Controls
- [x] T007: Implement 4500ms continuous auto-advance timer with auto-pause on hover, touch, and focus.
- [x] T008: Implement dual navigation controls (floating desktop side arrows, header controls, and pagination progress pill dots).
- [x] T009: Implement 1:1 real-time touch-swipe drag tracking with momentum and rubber-band bounds.

## Phase 4: Quality Assurance & Verification
- [x] T010: Verify static typing with `pnpm typecheck`.
- [x] T011: Run unit test suite with `pnpm test:unit`.
- [x] T012: Compile full production build with `pnpm build`.
- [x] T013: Verify git status to confirm strictly zero collateral changes in untouched files.
- [x] T014: Commit and push changes to `origin/master` and `origin/main`.
