# PLAN-037: Technical Architecture & Implementation Plan

## 1. Component Architecture
- **Target Component:** `src/components/home/CommitteePreviewSection.tsx`
- **Data Source:** `src/app/(public)/page.tsx` passing `officers` from `getCommitteeMembersByTerm(activeTerm.id)`.

## 2. State & Interaction Design
- **Carousel State:**
  - `currentIndex`: Tracks the active card index ($0 \le \text{currentIndex} \le \max(0, \text{officers.length} - \text{itemsPerPage})$).
  - `itemsPerPage`: Dynamic based on viewport width (1 on mobile $< 640\text{px}$, 2 on tablet $< 1024\text{px}$, 3 on desktop $\ge 1024\text{px}$).
  - `isPaused`: Boolean toggle for auto-play (default `false`).
  - `touchStart`, `touchDelta`: Touch gesture tracking for 1:1 mobile swipe.
- **Auto-Play Effect:**
  - 5000ms timer interval that calls `nextSlide()` when `!isPaused`.
  - Cleared on component unmount or when paused on mouse enter.

## 3. Visual & Style Enhancements
- **Royal Mihrab Arch Frame:**
  - Curved top border radius (`rounded-t-[20px] rounded-b-[6px]`) with a 1.5px gold accent border (`border-[var(--brand-accent)]/40`).
  - Subtle golden background gradient with an embossed crest / seal icon.
  - Smooth image object-cover when `photoUrl` is available.
- **Metallic Gold Rank Ribbon:**
  - Subtle gold gradient pill (`bg-gradient-to-r from-[var(--brand-accent)]/15 to-transparent text-[var(--brand-accent-text)] border border-[var(--brand-accent)]/30`).
- **Watermark & Accents:**
  - SVG 8-fold geometric rosette in card background (`opacity-5 dark:opacity-10 pointer-events-none`).
  - Arabic calligraphic watermark (`المجلس التنفيذي`).
- **Action Button:**
  - Subtle secondary outline button `View Profile & Portfolio →` with hover gold border and arrow slide effect.

## 4. Verification & Testing Strategy
- Unit test verification: `pnpm test:unit`
- TypeScript static check: `pnpm typecheck`
- Production Next.js build: `pnpm build`
- Visual inspection on mobile & desktop viewport simulations.
