<!--
  DEVELOPER NOTE:
  File: specs/033-navigation-and-page-layout-decoupling/plan.md
  Feature: Website Navigation and Standalone Page Layout Decoupling
  Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)
  Society: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
  Strictly human vibe; zero AI emojis.
-->

# IMPLEMENTATION PLAN: 033 - Navigation and Standalone Page Layout Decoupling

## Phase 1: Home Dashboard Streamlining & Overview Restructuring
- Restructure `src/app/(public)/page.tsx` to serve as a focused institutional overview.
- Maintain:
  - `HeroSection` (Header emblem, tagline, and direct CTAs).
  - `IntroductionSection` (Institutional mandate and 4 core pillars).
  - Create `GatewayHubSection` or streamlined highlights:
    - Next Upcoming Event card (with link to `/events`).
    - Recent Gallery Album card (with link to `/gallery`).
    - Featured Learning Resource card (with link to `/resources`).
    - Latest Announcement card (with link to `/news`).
    - Leadership & Founders gateway card (linking to `/founders` and `/leadership`).
  - `MembershipInvitationSection` (Direct admissions invitation linking to `/membership`).
  - Retain `VerifiedContactSection` coordinates at the bottom.
- Eliminate raw duplication of exhaustive lists and full operational schedules from the root URL.

## Phase 2: Standalone Page Integration & Completeness Audit
- Ensure `CulturalProgramsSection` is integrated into `/about` under an "Academic Circles & Experiential Initiatives" section so that no content is lost.
- Audit each standalone page to verify it renders independently with header, breadcrumbs, data, and pagination/filtering:
  - `/about`
  - `/history`
  - `/founders`
  - `/leadership`
  - `/events`
  - `/gallery`
  - `/resources`
  - `/news`
  - `/publications`
  - `/contact`
  - `/membership`

## Phase 3: Desktop & Mobile Navigation Alignment
- Update `src/components/layout/Header.tsx` to include `/publications` alongside the primary navigation links.
- Update `src/components/layout/MobileNav.tsx` to include all routes cleanly with touch-friendly targets (min 44px).
- Verify `src/components/layout/Footer.tsx` has working links to all 11 public destinations.

## Phase 4: Verification, Automated Testing & Server Reload
- Execute `pnpm typecheck` (`tsc --noEmit`).
- Execute full test battery (`pnpm test`, `pnpm test:admin`, etc.).
- Build production bundle (`pnpm build`).
- Restart systemd service `arabic-club`.
- Test every HTTP endpoint using curl to guarantee 200 OK responses.
