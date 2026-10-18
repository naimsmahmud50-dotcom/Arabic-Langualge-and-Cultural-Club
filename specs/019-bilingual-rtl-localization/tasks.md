# TASKS: 019 - English-Arabic Bilingual Experience, RTL Layout Engine & Localization

## Phase 1: Setup & Internationalization Dictionaries
- [x] T001 Define i18n types and contracts in `src/lib/i18n/types.ts`
- [x] T002 Implement locale configuration and metadata in `src/lib/i18n/config.ts`
- [x] T003 [P] Author canonical English dictionary in `src/lib/i18n/dictionaries/en.ts`
- [x] T004 [P] Author scholarly Arabic dictionary with reviewed terminology in `src/lib/i18n/dictionaries/ar.ts`
- [x] T005 [P] Author foundational Bengali dictionary for navigation in `src/lib/i18n/dictionaries/bn.ts`

## Phase 2: Core Foundation & Context Engine
- [x] T006 Implement bidirectional text isolation utilities in `src/lib/i18n/bidi.ts`
- [x] T007 Implement LanguageContext and useTranslation hook in `src/lib/i18n/context.tsx`
- [x] T008 Build accessible LanguageSwitcher component with keyboard support in `src/components/layout/LanguageSwitcher.tsx`

## Phase 3: Layout Integration & Language Switching (US1 & US2)
- [x] T009 [US1] Update root layout with LanguageProvider and anti-FOUC script in `src/app/layout.tsx`
- [x] T010 [US1] Update public Header with LanguageSwitcher and translated nav in `src/components/layout/Header.tsx`
- [x] T011 [US1] Update MobileNav drawer with RTL mirroring and LanguageSwitcher in `src/components/layout/MobileNav.tsx`
- [x] T012 [US2] Update AdminHeader with LanguageSwitcher and RTL breadcrumbs in `src/components/layout/AdminHeader.tsx`

## Phase 4: Typography, CSS & Dynamic Content Formatting (US3 & US4)
- [x] T013 [US3] Enhance Arabic typography, font variables, and RTL rules in `src/app/globals.css`
- [x] T014 [US4] Add dynamic bilingual content formatter and fallback helper in `src/lib/i18n/format.ts`

## Phase 5: Verification, Regression & Handover (US5)
- [x] T015 [US5] Build automated verification test suite in `src/lib/db/test-bilingual-localization.ts`
- [x] T016 [US5] Run bilingual automated test suite and fix any discovered defects
- [x] T017 [US5] Run cumulative regression testing across all 15 test suites
- [x] T018 [US5] Run Next.js production build (`next build`) to ensure 0 compilation errors
- [x] T019 Update `docs/REQUIREMENTS_CHECKLIST.md` and `docs/PHASE_STATUS.md`
