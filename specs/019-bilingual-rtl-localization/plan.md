# TECHNICAL PLAN: 019 - English-Arabic Bilingual Experience, RTL Layout Engine & Localization

## 1. Architecture & Component Blueprint

```
src/lib/i18n/
├── types.ts          # Type definitions for Locales, Direction, Translation keys, Dictionary
├── config.ts         # Supported locales, metadata (English, العربية, বাংলা), default fallback
├── context.tsx       # React context provider, useTranslation hook, persistence engine
├── bidi.ts           # Bidirectional isolation helpers for technical codes, emails, phones
└── dictionaries/
    ├── en.ts         # Canonical English dictionary
    ├── ar.ts         # Scholarly Arabic dictionary (reviewed terminology, zero AI tone)
    └── bn.ts         # Supplementary Bengali dictionary for foundational navigation

src/components/layout/
├── LanguageSwitcher.tsx  # Accessible dropdown switcher with keyboard navigation
├── Header.tsx            # Integrated with LanguageSwitcher & translated nav links
├── MobileNav.tsx         # Integrated with LanguageSwitcher & RTL slide direction
└── AdminHeader.tsx       # Integrated with LanguageSwitcher for administrative staff
```

---

## 2. Technical Decisions & Mechanics

### A. State Persistence & Anti-FOUC
1. **Client Storage:** Saved in `localStorage.getItem("alc_locale")`.
2. **Cookie Synchronization:** Cookie `alc_locale` set with `path=/; SameSite=Lax; max-age=31536000`.
3. **HTML Attribute Synchronization:** The root `<html>` element is updated dynamically:
   - `document.documentElement.lang = locale`
   - `document.documentElement.dir = locale === "ar" ? "rtl" : "ltr"`
4. **Anti-FOUC Inline Script:** A minimal inline script in `<head>` executes synchronously prior to paint to prevent layout flip flashes on page load.

### B. Typography & Font Stack
- **English/Latin:** `Inter` (body), `Manrope` (headings).
- **Arabic:** `Noto Naskh Arabic` (body text), `Amiri` (dignified headings and mottos).
- **Arabic Line-Height Rule:** Global CSS specifies `line-height: 1.8` for `[dir="rtl"]` and `[lang="ar"]` to guarantee zero diacritic clipping.

### C. BiDi Formatting & Directional Integrity
- Pure numbers and institutional reference codes (`REG-2026-XXXX`, `INQ-2026-XXXX`, `APP-2026-XXXX`) must render LTR regardless of page direction.
- Wrapped in `<bdi dir="ltr">` or using CSS `unicode-bidi: isolate; direction: ltr`.

### D. Layout Mirroring Rules
- **Mirror:** Next/Prev arrows, Chevron progression indicators, flex row order for menus, drawer slide animation.
- **Do NOT Mirror:** Search magnifying glasses, clock icons, shield icons, calendars, camera/media icons, external link icons.

---

## 3. Verification & Testing Strategy
1. **Automated Test Suite:** `src/lib/db/test-bilingual-localization.ts` testing dictionary parity, fallback cascades, directionality, and bidi isolation.
2. **Cumulative Regression Pass:** Run all 15 test suites across the repository.
3. **Build Integrity:** `pnpm exec next build` verifying 0 TypeScript and Next.js compilation errors.
