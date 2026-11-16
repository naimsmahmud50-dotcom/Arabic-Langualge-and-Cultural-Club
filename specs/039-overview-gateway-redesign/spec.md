# SPEC-039: Society Divisions & Archives Gateway Redesign

## 1. Overview & Context
This specification defines the transformation of the **Explore Society Divisions & Archives** homepage section (`src/components/home/OverviewGatewaySection.tsx`). The objective is to replace the static 6-card grid with a world-class, continuous, 5-second relaxed auto-sliding carousel featuring royal Moorish arched medallions, metallic gold live status ribbons, 8-fold Islamic geometric rosette watermarks, and dual navigation controls.

---

## 2. User Stories
- **US-1 (Passive Continuous Discovery):** As a university student or scholar, I want the institutional divisions to slide automatically from right to left every 5 seconds so that I can passively survey the full depth of club activities without repetitive clicking.
- **US-2 (Comfortable Reading on Hover):** As an interested reader, I want the automatic sliding to pause smoothly when I hover my mouse or touch a division card so that I can read the highlighted milestone and description without interruption.
- **US-3 (Seamless Portal Navigation):** As a club member or prospective applicant, I want each gateway card to act as a prestigious, fully clickable portal leading directly to its dedicated standalone archive (`/events`, `/gallery`, `/resources`, `/news`, `/leadership`, `/publications`).

---

## 3. Acceptance Criteria
1. **Continuous 5-Second Auto-Sliding Carousel:**
   - Advances automatically every 5000ms in an infinite loop from right to left.
   - Automatically pauses on mouse hover (`isHovered`), touch interaction (`isTouching`), or keyboard focus (`isFocused`).
   - Supports 3 cards per view on desktop ($\ge 1024$px), 2 cards on tablet ($640$px – $1023$px), and 1 card on mobile ($< 640$px).
   - Dynamic pixel step translation (`transform: translateX(...)`) calculated via `ResizeObserver` to prevent percentage clipping or layout bugs.
   - 1:1 real-time mobile touch swipe with rubber-band edge physics.
2. **Royal Islamic Moorish Arched Medallions:**
   - Replaces flat square icons with an arched Moorish Mihrab frame, 1.5px gold accent border, and diamond keystone jewel.
   - Portal-specific Lucide SVG icons (`Calendar`, `ImageIcon`, `BookOpen`, `Bell`, `Users`, `Award`).
3. **Metallic Gold Ribbon & Metadata:**
   - Dynamic live-count badges converted into metallic gold ribbons (`الفعاليات المجدولة • 1 Scheduled`, etc.).
   - Refined italic micro-highlight snippet rendered in an elevated preview banner.
4. **Card Structure & Typography:**
   - Background 8-fold Islamic geometric rosette watermark and Arabic calligraphic watermark (`البوابات الأكاديمية`).
   - Top gold foil hairline accent on hover (`h-[2px] bg-gradient-to-r from-transparent via-[var(--brand-accent)]/70 to-transparent`).
   - Fully interactive card linking to destination portal with animated CTA arrow.
5. **Dual Navigation Controls:**
   - Header controls (Previous, Play/Pause toggle, Next).
   - Prominent floating side arrows on desktop viewport.
   - Interactive progress pill indicators at the bottom.
6. **Strict Non-Regression:**
   - Exclusively modifies `src/components/home/OverviewGatewaySection.tsx`.
   - Zero modifications to any other component or route.
   - `pnpm typecheck`, `pnpm test:unit`, and `pnpm build` pass with zero errors.
