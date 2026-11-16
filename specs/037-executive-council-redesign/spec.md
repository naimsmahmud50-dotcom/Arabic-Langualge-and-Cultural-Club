# SPEC-037: Executive Council & Committee Section Redesign

## 1. Overview & Context
This specification defines the transformation of the **Executive Council & Committee** section on the homepage (`src/components/home/CommitteePreviewSection.tsx`). The goal is to replace the static 3-column grid and plain square initials ("Z", "F", "B" letter boxes) with a world-class, premium interactive carousel featuring royal Islamic Mihrab arch portraits, gold-accented rank ribbons, calligraphic watermarks, and smooth responsive touch/navigation controls.

---

## 2. User Stories
- **US-1 (Visitor/Member Experience):** As a website visitor, I want to view the club's governing executive council in a smooth, high-end interactive carousel so that I can easily browse all active leadership officers on both desktop and mobile without overwhelming the page height.
- **US-2 (Visual Dignity & Prestige):** As an alumnus, donor, or prospective student, I want to see royal Islamic aesthetic details—such as arched Mihrab frames, authentic calligraphic seals, and gold foil accents—rather than crude, flat placeholder boxes, conveying the institutional prestige of Kabi Nazrul Government College.
- **US-3 (Seamless Leadership Navigation):** As an interested reader, I want each officer card to offer a clear link to the official leadership archive (`/leadership`) so that I can explore historical rosters and detailed portfolios.

---

## 3. Acceptance Criteria
1. **Interactive Carousel Controls:**
   - On desktop ($\ge 1024$px), displays 3 cards per view.
   - Smooth horizontal slide transition (left/right) with previous and next arrow buttons in the section header.
   - On mobile/tablet ($< 1024$px), supports 1:1 touch swipe drag with momentum snap.
   - Auto-plays every 5 seconds, pausing automatically on hover, touch, or when explicitly paused via the play/pause button.
   - Features active dot pagination indicators reflecting current slide index.
2. **Royal Islamic Mihrab Arch Frame & Insignia:**
   - Replaces the generic flat letter box (`w-10 h-10 rounded-[6px]`) with an elegant arched Mihrab frame.
   - Displays the member's profile photo (`photoUrl`) when present.
   - When no photo is uploaded (e.g. fixtures or pending uploads), renders a dignified executive insignia with gold border and Arabic monogram.
3. **Card Structure & Typography:**
   - Includes metallic gold ribbon rank badge (`الرتبة الأولى • Rank #1`, `الرتبة الثانية • Rank #2`, etc.).
   - English and Arabic names (`fullNameEn`, `fullNameAr`) with appropriate typographic line heights.
   - Position badge with official shield icon.
   - Subtle 8-fold Islamic geometric rosette watermark and Arabic calligraphy watermark (`المجلس التنفيذي`).
   - "View Profile & Portfolio →" button linking to `/leadership#officer-[assignmentId]`.
4. **Boundary & Non-Regression:**
   - Only `src/components/home/CommitteePreviewSection.tsx` and necessary interface wiring in `src/app/(public)/page.tsx` are modified.
   - No other homepage sections, components, routes, or database schemas are altered.
   - `pnpm typecheck`, `pnpm test:unit`, and `pnpm build` must pass cleanly with zero errors.

---

## 4. Out of Scope
- Modifying other homepage sections (Four Pillars, News, Visual Archives, Events, Contacts).
- Changing database schema or SQLite tables.
- Inventing fabricated historical facts or altering official club constitution text.
