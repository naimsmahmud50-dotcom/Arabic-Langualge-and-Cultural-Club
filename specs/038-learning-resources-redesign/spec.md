# SPEC-038: Arabic Learning Resources & Curated Library Redesign

## 1. Overview & Context
This specification covers the elevation of the **Arabic Learning Resources & Curated Library** homepage section (`src/components/home/LearningResourcesSection.tsx`). The objective is to replace the static 4-column card grid and plain square icons with an automatic, smooth, continuous auto-sliding carousel featuring royal Islamic arched medallions, illuminated manuscript insignias, metallic gold skill ribbons, calligraphic watermarks, and full touch/gesture support.

---

## 2. User Stories
- **US-1 (Automated Discoverability):** As a university student or researcher, I want the library resources to slide automatically without having to manually click buttons, so that I can passively discover all featured pedagogical treatises.
- **US-2 (Interactive Exploration):** As an active reader, I want the auto-slide to pause smoothly when I hover my mouse or touch a resource card so that I can read its summary and details comfortably.
- **US-3 (Prestige Academic Aesthetics):** As a visiting Arabic philologist or donor, I want to see royal Islamic aesthetic details—such as arched Moorish Mihrab medallions, calligraphic watermarks (`المكتبة التراثية`), and metallic gold skill ribbons—reflecting the academic excellence of Kabi Nazrul Government College, Dhaka.

---

## 3. Acceptance Criteria
1. **Continuous & Smooth Auto-Slide Carousel:**
   - Automatically advances every 4.5 to 5 seconds without user intervention.
   - Pauses on mouse hover (`onMouseEnter`), touch interaction (`onTouchStart`), or keyboard focus (`onFocus`).
   - Supports 3 cards per view on desktop ($\ge 1024$px), 2 cards on tablet ($640$px – $1023$px), and 1 card on mobile ($< 640$px).
   - Provides accessible manual controls (play/pause toggle, header next/prev arrows, floating side arrows, and pagination progress dots).
   - Real-time 1:1 mobile touch-swipe gesture with rubber-band bounds.
2. **Royal Islamic Arched Medallion & Format Insignias:**
   - Replaces the generic flat square icon (`w-10 h-10 bg-[var(--brand-primary)]/10`) with an arched Moorish Mihrab medallion featuring gold accent borders and ambient glow.
   - Format-specific insignias (e.g. `BookOpenCheck` for grammar/syntax, `ScrollText` for morphology, `Library` for rhetoric, `Headphones` for audio diction).
3. **Metallic Skill Level Ribbon & Metadata:**
   - Metallic gold gradient badge with authentic Arabic level designation:
     - Beginner: `المستوى التمهيدي • Beginner`
     - Intermediate: `المستوى المتوسط • Intermediate`
     - Advanced: `المستوى المتقدم • Advanced`
   - Clean category and file format tags (e.g. `PDF | Grammar`).
4. **Card Structure & Typography:**
   - 8-fold Islamic geometric rosette watermark (`viewBox="0 0 100 100"`) and Arabic calligraphic watermark (`المكتبة التراثية`).
   - English title with dignified serif/sans typography; Arabic title with Amiri typography.
   - Direct action button: "Access Scholarly Material →" with animated hover arrow linking to `/resources`.
5. **Boundary & Non-Regression:**
   - Exclusively modifies `src/components/home/LearningResourcesSection.tsx`.
   - Zero modifications to other homepage sections, routes, database tables, or server files.
   - `pnpm typecheck`, `pnpm test:unit`, and `pnpm build` pass with zero errors.
