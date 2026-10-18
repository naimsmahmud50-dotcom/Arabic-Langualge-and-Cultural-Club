# TASKS: 024 - Official College Branding Update (Kabi Nazrul Government College)

## Phase 1: Layout Components
- [x] T001 Update `src/components/layout/Header.tsx` with Kabi Nazrul Govt. College, Dhaka branding
- [x] T002 Update `src/components/layout/MobileNav.tsx` with college branding
- [x] T003 Update `src/components/layout/Footer.tsx` identity block and copyright bar

## Phase 2: Translation Dictionaries
- [x] T004 Update `src/lib/i18n/dictionaries/en.ts` with official college name
- [x] T005 Update `src/lib/i18n/dictionaries/ar.ts` with official Arabic college name
- [x] T006 Update `src/lib/i18n/dictionaries/bn.ts` with official Bangla college name

## Phase 3: Homepage, Public Pages & SEO
- [x] T007 Update `src/components/home/HeroSection.tsx` badge, Arabic heading, and text
- [x] T008 Update `src/components/home/IntroductionSection.tsx` and `VerifiedContactSection.tsx`
- [x] T009 Update `src/app/layout.tsx` metadata and `src/components/seo/JsonLd.tsx`
- [x] T010 Update page metadata in `src/app/(public)/about/page.tsx`, `contact/page.tsx`, `policies/page.tsx`
- [x] T011 Update `.env.example` with intended admin email `arabicclubkngc2025@gmail.com`

## Phase 4: Database Settings & Seed Consistency
- [x] T012 Update `src/lib/db/seed.ts` site_settings values
- [x] T013 Update SQLite database `site_settings` table directly using safe script

## Phase 5: Verification & Testing
- [x] T014 Run `pnpm typecheck` (`tsc --noEmit`) to verify 0 errors
- [x] T015 Run `pnpm build` with Turbopack
- [x] T016 Run automated E2E test suite and verify live server responses on port 3000
- [x] T017 Git commit all changes and author report in Bengali with zero AI emojis
