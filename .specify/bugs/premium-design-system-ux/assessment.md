# Premium Design System & UX Elevation Audit Assessment (Phase 7)
**Project:** Arabic Language & Cultural Club — Kabi Nazrul Government College, Dhaka  
**Scope:** Design System, Arabic/Bangla/Latin Typography, Homepage Redesign, Reusable Components (SectionHeader, StatCounter, Timeline, Lightbox, Toasts), Responsive Layouts, Events/Publications/Resources Enhancement, Admin Dashboard UX, Contact Form & Notifications.  
**Date:** October 19, 2026  

---

## 1. Executive Summary
A comprehensive audit of the visual design, user experience, and component architecture was conducted across both public and administrative modules. While Phase 6 achieved 93–100 scores on Lighthouse mobile metrics, the design system requires cohesive elevation to an elite, scholarly collegiate standard honoring Islamic geometry, classical calligraphy, and seamless bilingual/trilingual (Arabic, English, Bengali) accessibility.

---

## 2. Gap Analysis by Dimension

### A. Design System & Typography
1. **Bangla Font Integration:** While Inter/Manrope (Latin) and Amiri/Noto Naskh Arabic (Arabic) are configured, Bengali text (`lang="bn"`) currently falls back to system fonts without institutional typographic pairing (such as Noto Sans Bengali or Anek Bangla).
2. **Design Tokens & Shadows:** Colors need consistent tokenization in `globals.css` and `@theme` extension for deep emerald green (`#173D32`), antique brass gold (`#8F6627` / `#B18A4A`), warm ivory (`#F5F0E5`), and midnight evergreen (`#17211D`), with refined shadow levels (`--shadow-soft`, `--shadow-elevated`, `--shadow-card`).

### B. Homepage Composition
1. **Missing Leadership & Committee Preview:** The homepage includes gateways and event/gallery previews, but lacks an executive leadership/committee circle preview showcasing active term officers.
2. **Missing Latest Announcements Strip:** The home page queries `getPublicAnnouncements`, but does not render a dedicated latest secretarial bulletin/news carousel or card grid.
3. **Missing Learning Resources Teaser:** A curated teaser highlighting the digital Arabic library and grammar treatises is needed on the flagship page.

### C. Reusable Component Primitives
1. **Section Header with Ornamental Divider:** Currently interior pages have `PageHeader`, but in-page sections need a standard `SectionHeader` featuring an authentic 8-point star or arabesque calligraphy divider (`OrnamentalDivider`).
2. **Gallery Lightbox:** Public gallery currently displays thumbnails and routes to slug pages, but lacks an interactive modal Lightbox for high-resolution inspection with keyboard escape/arrow navigation.
3. **Timeline Component:** The History page (`/history`) needs a structured, accessible collegiate timeline component.
4. **Stat Counter:** Animated/elevated numerical counter with Arabic-Latin bilingual labels.
5. **Universal Toast Notifications:** A global toast dispatcher for admin actions and public interactions.

### D. Public Domain Improvements
1. **Events Page:** Add past vs. upcoming event tabs, category filters, and calendar month selector.
2. **Publications Page:** Add real-time text search, publication type filters, and PDF preview/modal download action.
3. **Resources Page:** Add clickable topic tags and level filters with instant URL search parameters.
4. **Contact Form:** Ensure full server-side Zod validation, honeypot spam protection, sliding-window IP rate limiting, and administrative inbox viewing with status management.

### E. Admin Dashboard & Mobile Usability
1. **Dashboard Overview Metrics:** Ensure counts of events, news, media assets, active members, and inquiries are presented with visual distinction and trend indicators.
2. **Confirmation Dialogs & Toasts:** Standardize `AdminConfirmModal` for destructive actions (deletions) and integrate auto-dismissing toast feedback.
3. **Mobile Drawer Navigation:** Ensure admin sidebar seamlessly collapses into a mobile bottom-sheet/drawer without touch targets < 48px.

---

## 3. Implementation Plan
- **Step 1:** Enhance typography in `src/app/layout.tsx` and `src/app/globals.css` with Google Fonts `Noto_Sans_Bengali` alongside Latin and Arabic subsets.
- **Step 2:** Build reusable design system primitives in `src/components/ui/` (`SectionHeader.tsx`, `OrnamentalDivider.tsx`, `StatCounter.tsx`, `Timeline.tsx`, `Lightbox.tsx`, `Toast.tsx`).
- **Step 3:** Elevate `src/app/(public)/page.tsx` and home subcomponents with announcements, leadership preview, and learning resources teaser.
- **Step 4:** Polish Events, Publications, and Resources public routes with search, tags, and tabs.
- **Step 5:** Enhance Admin Dashboard (`src/app/admin/page.tsx`, `AdminSidebar.tsx`, `AdminHeader.tsx`) with toast integration and confirmation workflows.
- **Step 6:** Validate responsive layout at 360px, 768px, and 1280px viewports; verify Next.js production build and systemd daemon service.
