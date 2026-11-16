# PLAN-038: Technical Architecture & Implementation Plan

## 1. Component Architecture
- **Target Component:** `src/components/home/LearningResourcesSection.tsx`
- **Client Component:** Converted to `"use client"` for dynamic carousel animation, touch gestures, resize observers, and auto-slide timers.

## 2. Carousel & Motion Architecture
- **Auto-Advance Timer:**
  - 4500ms continuous timer using `setInterval`.
  - Automatically resets whenever manual navigation occurs.
  - Pauses gracefully on hover (`isHovered`), touch (`isTouching`), focus (`isFocused`), or manual pause toggle (`isPaused`).
- **Translation Calculation:**
  - Uses exact pixel step measurement via `ResizeObserver` observing the track container.
  - `stepPx = cardWidth + 24px (gap-6)`.
  - `transform: translateX(calc(-${activeIndex * stepPx}px + ${dragOffset}px))`.
  - Fallback to responsive percentage step if `stepPx === 0`.
- **Navigation Controls:**
  - Header controls: Prev, Play/Pause, Next.
  - Floating side navigation arrows for desktop viewport.
  - Bottom progress pill dots indicating current slide group.

## 3. Visual & Heritage System
- **Arched Moorish Medallion:**
  - `rounded-t-full rounded-b-md` with 1.5px gold border and diamond keystone accent.
  - Iconography: `BookOpenCheck`, `ScrollText`, `Library`, `Headphones`, `BookText`.
- **Metallic Level Ribbon:**
  - `getSkillLevelAr(level: string)` generating Arabic level designations.
  - Subtle gold border and gradient fill.
- **Card Accents:**
  - 8-fold Islamic rosette watermark and Arabic calligraphic watermark (`المكتبة التراثية`).
  - Top gold foil hairline accent on hover (`h-[2px] bg-gradient-to-r from-transparent via-[var(--brand-accent)]/70 to-transparent`).

## 4. Verification & Testing Strategy
- TypeScript typecheck: `pnpm typecheck`
- Unit tests: `pnpm test:unit`
- Production Next.js build: `pnpm build`
- Git commit and dual-branch push (`master` and `main`).
