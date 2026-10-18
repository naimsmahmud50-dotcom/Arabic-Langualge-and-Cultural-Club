# SPECIFICATION: 019 - English-Arabic Bilingual Experience, RTL Layout Engine & Localization

## 1. Overview
The Arabic Language & Cultural Club requires a first-class, authentic bilingual experience covering English and Arabic (with optional foundational Bangla support for core institutional navigation). The system must dynamically adapt layout directionality (`dir="rtl"` vs `dir="ltr"`), document language tags (`lang="ar"` vs `lang="en"`), typography scaling, and line heights suitable for Arabic Naskh and Amiri script without visual clipping or horizontal overflow.

---

## 2. User Stories

### User Story 1 (P1): Seamless Language Switching & Directionality
**As a** student of Arabic or an institutional visitor,  
**I want to** toggle between English and Arabic (and Bangla when supported) using a prominent header switcher,  
**So that** the page text, navigation, and directionality immediately update to my chosen language.

- **Acceptance Criteria:**
  - Selecting "العربية" sets `html[dir="rtl"]` and `html[lang="ar"]`.
  - Selecting "English" sets `html[dir="ltr"]` and `html[lang="en"]`.
  - Layout flips naturally: sidebar, navigation links, and content flow from right to left in Arabic mode.
  - Directional icons (e.g., next/prev arrows, chevron progress indicators) mirror appropriately (`rtl:rotate-180`), while physical/non-directional icons (search magnifier, clock, calendar, email, shield) remain untampered.

### User Story 2 (P1): Persistent Language Preference
**As a** frequent visitor or member,  
**I want** my preferred language to be saved across browser sessions,  
**So that** I do not have to re-select Arabic every time I navigate to a new page or reload.

- **Acceptance Criteria:**
  - Preference is persisted in `localStorage` under `alc_locale` and also synchronized into an `alc_locale` cookie.
  - Page navigation preserves the current path without breaking queries or anchor links.
  - Initial server-side rendering respects the default institutional language or saved cookie.

### User Story 3 (P2): Authentic Arabic Typography & BiDi Isolation
**As an** Arabic reader,  
**I want** Arabic text to be rendered with proper ligatures, diacritic (`tashkeel`) spacing, and generous line-height,  
**So that** literary excerpts, mottos, and articles are dignified, legible, and never vertically clipped.

- **Acceptance Criteria:**
  - Font stack includes `Amiri`, `Noto Naskh Arabic`, and `Traditional Arabic`.
  - Arabic line-height is tuned to `1.75–1.85` to ensure diacritics do not collide with adjacent text lines.
  - Technical strings (e.g., Reference IDs like `REG-2026-XXXX`, `INQ-2026-XXXX`, phone numbers, email addresses, and URLs) are wrapped with `<bdi>` or `dir="ltr"` to prevent mixed-direction garbling.

### User Story 4 (P2): Maintainable Translation Architecture & Honest Fallbacks
**As a** software maintainer and developer,  
**I want** translations organized in modular, typed dictionaries with honest fallback handling,  
**So that** untranslated content gracefully defaults to English without crashes, blank fields, or robotic phrasing.

- **Acceptance Criteria:**
  - Strict TypeScript schema for translation keys.
  - Dictionaries for English (`en.ts`), Arabic (`ar.ts`), and Bangla (`bn.ts`).
  - Fallback logic: `t(key)` resolves `ar[key] -> en[key] -> key`.
  - Dynamic content resolution: when displaying entities from SQLite with both `titleEn` and `titleAr`, the component renders `titleAr` if present and locale is `ar`, otherwise `titleEn`.
  - Honest disclosure: incomplete pages are not falsely marked as 100% translated if source content is English-only.

### User Story 5 (P3): Mobile, Tablet & Responsive Mirroring
**As a** mobile user on a smartphone or tablet,  
**I want** the mobile navigation drawer, forms, tables, and dialogs to work flawlessly in RTL mode,  
**So that** there is no horizontal scrollbar or element overflow at 375px, 768px, or desktop widths.

- **Acceptance Criteria:**
  - Responsive test at 375px (mobile), 768px (tablet), and 1280px (desktop) verifies 0 horizontal overflow.
  - Mobile drawer opens from the right in RTL and from the left in LTR.
  - Dropdown menus and action popups align to the correct edge (`start` vs `end`).
  - Dark mode and light mode both maintain high contrast and legible typography in Arabic script.

---

## 3. Out of Scope
- Machine translation of arbitrary user inputs in real-time (inquiries, motivations).
- Auto-generation of translations via external third-party cloud APIs.
