# PLAN-039: Technical Architecture & Implementation Plan

## 1. Component Architecture
- **Target File:** `src/components/home/OverviewGatewaySection.tsx`
- **Client Conversion:** Marked `"use client"` for React hooks, timers, touch handlers, and resize observers.
- **Props Preservation:** Preserves `OverviewGatewaySectionProps` with all live summary stats (`upcomingEventsCount`, `albumsCount`, `resourcesCount`, `announcementsCount`, `activeTermTitle`, `publicationsCount`).

## 2. Motion & Auto-Advance Architecture
- **5000ms Auto-Advance Timer:**
  - `useEffect` setting `setInterval` calling `goToNext()` every 5 seconds.
  - Pauses when `isPaused`, `isHovered`, `isTouching`, `isFocused`, or `prefersReducedMotion`.
  - Timer clears on unmount or on navigation reset.
- **Exact Pixel Step Translation:**
  - Measured via `ResizeObserver` on `trackRef`.
  - `stepPx = firstArticle.getBoundingClientRect().width + 24px (gap-6)`.
  - `style={{ transform: translateX(calc(-${activeIndex * stepPx}px + ${dragOffset}px)) }}`.
  - Fallback formula if `stepPx === 0` during SSR / initial paint.

## 3. Visual & Style Enhancements
- **Moorish Arched Medallion:**
  - `w-14 h-18 sm:w-16 sm:h-20 shrink-0 rounded-t-full rounded-b-md p-[2px] bg-gradient-to-b from-[var(--brand-accent)] via-[var(--brand-accent)]/50 to-transparent shadow-sm`.
  - Top diamond keystone jewel (`w-2 h-2 rotate-45 bg-[var(--brand-accent)]`).
- **Metallic Gold Status Ribbons:**
  - Gradient gold pill badge with Arabic category translation.
- **Watermarks:**
  - 8-fold Islamic rosette SVG in bottom-right corner.
  - Arabic watermark: `البوابات الأكاديمية`.
- **Card Interactive Structure:**
  - Wrapped as a comprehensive accessible portal link with hover gold elevation.

## 4. Verification & Testing Strategy
- Static type analysis: `pnpm typecheck`
- Unit test suite: `pnpm test:unit`
- Production Next.js build: `pnpm build`
- Git commits and dual-branch push (`master` and `main`).
