<!--
  DEVELOPER NOTE:
  File: specs/032-club-logo-integration/tasks.md
  Purpose: Task checklist for authentic club logo extraction and website integration
  Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)
  Society: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
  Strictly human vibe; zero AI emojis.
-->

# TASKS: 032 - Official Club Logo Integration

**Institution:** Kabi Nazrul Government College, Dhaka  
**Society:** Arabic Language & Cultural Club  
**Status:** Completed  

---

## Phase 1: Asset Extraction & Web-Optimization
- [x] **Task 1.1: Web-Ready Asset Generation**
  - Extract and generate `club-logo-original.png`, `club-logo-full.png`, `club-crest.png`, and `club-crest-transparent.png` in `public/images/logo/`.
- [x] **Task 1.2: Favicon & App Icon Generation**
  - Generate `favicon.ico`, `favicon-32x32.png`, `favicon-16x16.png`, and `apple-touch-icon.png` in `public/`.
- [x] **Task 1.3: Visual Quality Inspection**
  - Inspect transparency, edge anti-aliasing, and clarity on both light and dark backgrounds.

## Phase 2: Reusable UI Component Engineering
- [x] **Task 2.1: Implement `<ClubLogo />` Component**
  - Create `src/components/ui/ClubLogo.tsx` with variants (`crest`, `full`, `badge`) and responsive sizes.
- [x] **Task 2.2: Export Component from UI Library**
  - Export `ClubLogo` from `src/components/ui/index.ts`.

## Phase 3: Public Website Integration
- [x] **Task 3.1: Public Masthead & Desktop Header**
  - Update `src/components/layout/Header.tsx` to render the authentic crest.
- [x] **Task 3.2: Mobile Navigation Drawer**
  - Update `src/components/layout/MobileNav.tsx` with the authentic crest.
- [x] **Task 3.3: Public Institutional Footer**
  - Update `src/components/layout/Footer.tsx` with the authentic crest.
- [x] **Task 3.4: Homepage Hero Section**
  - Update `src/components/home/HeroSection.tsx` right emblem card with the authentic crest.
- [x] **Task 3.5: Key Institutional Pages (About, Membership, Contact)**
  - Integrate official logo in `src/app/(public)/about/page.tsx`, `src/app/(public)/membership/MembershipPortalView.tsx`, and `src/app/(public)/contact/page.tsx`.

## Phase 4: Administrative Dashboard & Authentication Integration
- [x] **Task 4.1: Admin Login & Authentication Screens**
  - Update `src/app/admin/login/page.tsx` and `src/app/admin/forgot-password/page.tsx`.
- [x] **Task 4.2: Admin Dashboard Navigation**
  - Update `src/components/layout/AdminSidebar.tsx` and `src/components/layout/AdminMobileNav.tsx`.

## Phase 5: Favicon & Global Layout Metadata
- [x] **Task 5.1: Root Layout Metadata**
  - Update `src/app/layout.tsx` to link to new favicons and apple-touch-icon.

## Phase 6: Verification, Typecheck & Production Build
- [x] **Task 6.1: TypeScript Validation**
  - Execute `pnpm typecheck` to verify 0 compiler errors.
- [x] **Task 6.2: Production Build**
  - Execute `pnpm build` to confirm clean compilation of all static and dynamic pages.
- [x] **Task 6.3: Automated Regression Tests**
  - Execute `pnpm test:admin`, `pnpm test:gallery`, and `pnpm test`.
- [x] **Task 6.4: Live Server Probe & Visual Verification**
  - Verify live rendering on `http://localhost:3005`.

## Phase 7: Reporting & Documentation
- [x] **Task 7.1: Comprehensive Handover Report**
  - Document all extracted assets, changed files, integration locations, and test results in Bengali without AI emojis.
