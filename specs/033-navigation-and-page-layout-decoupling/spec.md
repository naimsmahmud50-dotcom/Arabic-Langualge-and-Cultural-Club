<!--
  DEVELOPER NOTE:
  File: specs/033-navigation-and-page-layout-decoupling/spec.md
  Feature: Website Navigation and Standalone Page Layout Decoupling
  Institution: Kabi Nazrul Government College, Dhaka (কবি নজরুল সরকারি কলেজ, ঢাকা)
  Society: Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)
  Strictly human vibe; zero AI emojis.
-->

# SPECIFICATION: 033 - Navigation and Standalone Page Layout Decoupling

## 1. Problem Statement
The primary public entrance / home dashboard (`/`) currently concatenates 13 separate institutional sections into a monolithic, vertically cascading document exceeding 330KB. Rather than serving as an overview and gateway, the landing page duplicates the complete content of separate pages (Founders, Leadership, Events, Annual Plan, Resources, Publications, News, Gallery, and Contacts) in an endless vertical scroll.

## 2. Target Architecture & Scope
1. **Focused Home Dashboard (`/`)**:
   - Curated to serve strictly as an executive institutional overview.
   - Includes:
     - Hero Section (collegiate branding, crest, key calls-to-action).
     - Institutional Overview & Core Pillars (Mission, Vision, and Scholarly Framework).
     - Gateway Navigation Hub (concise cards linking directly to standalone sub-pages).
     - Brief Highlights (Next upcoming event highlight, latest bulletin, and featured gallery album).
     - Membership Fellowship Invitation CTA.
   - Removes excessive duplication of full archives from the root page.

2. **Dedicated Standalone Pages**:
   - Ensure each major page is fully rendered on its dedicated route with rich, self-contained layouts:
     - `/about` — Narrative, Mission, Vision, Constitution & Cultural Circles.
     - `/history` — Chronological historical timeline.
     - `/founders` — Dedicated Founders Roll of Honor.
     - `/leadership` — Governing Councils & Committee term archives.
     - `/events` — Academic Calendar & 12-Month Annual Plan.
     - `/gallery` — Archival Photo & Media Collections.
     - `/resources` — Arabic Linguistic Guides & Digital Library.
     - `/news` — Official Gazettes & Announcements.
     - `/publications` — Literary Periodicals & Tournament Awards.
     - `/contact` — Secretariat Office, Coordinates & Direct Inquiries.
     - `/membership` — Admissions Portal & Application Form.

3. **Desktop & Mobile Navigation Alignment**:
   - Desktop Header (`src/components/layout/Header.tsx`): complete links with active indicators.
   - Mobile Drawer (`src/components/layout/MobileNav.tsx`): accessible, touch-friendly menu linking to every standalone route.
   - Institutional Footer (`src/components/layout/Footer.tsx`): structured sitemap linking to all pages.

## 3. Invariants & Constraints
- Zero AI emojis in UI, code, or documentation.
- Maintain prominent top-of-file `DEVELOPER NOTE` on every modified file.
- Port 3000 must NOT be modified or killed (reserved for PID 23123).
- Platform runs strictly on port 3005.
- Zero loss of existing features, content, authentication, or admin functionality.
