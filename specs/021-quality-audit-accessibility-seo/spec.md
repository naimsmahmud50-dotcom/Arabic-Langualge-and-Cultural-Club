# SPECIFICATION: 021 - Comprehensive Quality Pass, Accessibility Audit (WCAG 2.2 AA), SEO Hardening & Performance

## 1. Overview & Objectives
This specification directs a comprehensive quality pass across the public website and administrative dashboard of the Arabic Language & Cultural Club.
The objective is to achieve production-grade quality conforming to WCAG 2.2 AA accessibility guidelines, robust SEO metadata architecture (dynamic sitemaps, robots rules, Schema.org JSON-LD), high rendering performance, zero layout shift, and authentic Arabic-English bilingual ergonomics.

---

## 2. Requirements & Standards

### Accessibility (WCAG 2.2 AA Target)
- **Skip Navigation**: Accessible "Skip to main content" link at the top of the DOM allowing keyboard users to bypass header navigation.
- **Landmarks & Semantics**: Proper `<main id="main-content">`, `<header>`, `<nav>`, `<footer>`, and heading hierarchy (h1 -> h2 -> h3).
- **Interactive Focus Visibility**: Explicit high-contrast focus rings (`outline: 2px solid var(--focus-ring); outline-offset: 2px;`) for keyboard navigation.
- **Form Controls & Labels**: All inputs, selects, and textareas must possess accessible labels, helper text, and clear error associations (`aria-invalid`, `aria-describedby`).
- **Alternative Text**: All images must provide meaningful alt text or empty `alt=""` for decorative elements.
- **Reduced Motion**: Honoring `prefers-reduced-motion` with transition suppression.
- **Bilingual RTL Support**: Bidirectional text isolation (`<bdi>`, `bidi-ltr`, `bidi-rtl`), appropriate font stack (`Amiri`, `Noto Naskh Arabic`), and line-heights >= 1.75 for diacritic clarity.

### Search Engine Optimization (SEO)
- **Page Metadata**: Page-specific titles, descriptions, canonical URLs, and OpenGraph/Twitter cards across all public routes.
- **Dynamic Sitemap**: Dynamic Next.js sitemap (`src/app/sitemap.ts`) indexing published pages, articles, events, galleries, and publications.
- **Robots Rules**: Next.js robots configuration (`src/app/robots.ts`) allowing public indexing and explicitly disallowing `/admin/` and `/api/admin/`.
- **Admin Disallow & Noindex**: Ensure all `/admin/*` pages carry `robots: { index: false, follow: false, nocache: true }`.
- **Structured Data**: Schema.org JSON-LD for `EducationalOrganization` and `WebSite` describing institutional identity without fabricated data.

### Performance & Visual Ergonomics
- **Image Delivery**: `loading="lazy"` and `decoding="async"` for non-critical assets; responsive layout constraints to prevent Cumulative Layout Shift (CLS < 0.1).
- **Responsive Layout**: Fluid layouts across Mobile (375px), Tablet (768px), and Desktop (1280px+) with zero horizontal overflow.
- **Human Scholar Vibe**: Strictly zero AI emojis. Clean SVG icons from `lucide-react`.

---

## 3. User Stories

### User Story 1 (P1): Accessible Navigation & Assistive Technology Support
**As a** student or visitor using a screen reader or keyboard navigation,  
**I want** to navigate the site seamlessly with skip links, logical landmarks, visible focus rings, and proper ARIA attributes,  
**So that** I can access scholarship materials without usability barriers.

### User Story 2 (P1): Discoverability & Search Engine Metadata
**As an** academic researcher or prospective member searching online,  
**I want** search engines to present rich, accurate snippets, social cards, and direct links to published resources,  
**So that** club activities, events, and publications are easily discoverable while admin routes remain private.

### User Story 3 (P2): Responsive Performance & Visual Polish
**As a** mobile user on varying connection speeds,  
**I want** pages to load rapidly without layout shifts or clipped typography in either English or Arabic,  
**So that** the reading experience is dignified and immediate.

---

## 4. Deliverables
1. `specs/021-quality-audit-accessibility-seo/` (`spec.md`, `plan.md`, `tasks.md`)
2. `src/app/robots.ts` and `src/app/sitemap.ts`
3. `src/components/seo/JsonLd.tsx`
4. Metadata additions to all public pages (`events`, `gallery`, `news`, `publications`, `resources`, `policies`, `events/[slug]`)
5. Accessibility & performance fixes in layouts and components
6. Automated live quality verification suite `src/lib/db/test-quality-pass.ts`
7. `docs/QUALITY_AUDIT.md` and updated `docs/REQUIREMENTS_CHECKLIST.md`
