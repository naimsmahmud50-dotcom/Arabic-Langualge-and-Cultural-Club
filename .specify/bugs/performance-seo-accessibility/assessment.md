# Performance, SEO & Accessibility Audit Assessment (Phase 6)
**Project:** Arabic Language & Cultural Club — Kabi Nazrul Government College, Dhaka  
**Scope:** Mobile Performance, Core Web Vitals (FCP, LCP, CLS), SEO Metadata, Accessibility (WCAG AA), RTL BiDi Layout, and CDN/Cache Optimization  
**Date:** October 19, 2026  

---

## 1. Executive Summary
A comprehensive baseline mobile audit was conducted across the 5 core public pages (`/`, `/about`, `/events`, `/gallery`, `/publications`) using Lighthouse 13.5.0 with simulated mobile network and CPU throttling.

### Baseline Mobile Scores:
| Page | Performance | Accessibility | Best Practices | SEO | Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Home (`/`)** | 77 | 95 | 100 | 100 | Performance below 90 |
| **About (`/about`)** | 83 | 96 | 100 | 100 | Performance below 90 |
| **Events (`/events`)** | 82 | 92 | 100 | 100 | Performance below 90 |
| **Gallery (`/gallery`)** | 82 | 95 | 96 | 100 | Performance & BP below 90/100 |
| **Publications (`/publications`)** | 83 | 96 | 100 | 100 | Performance below 90 |

---

## 2. Root Cause Analysis

### A. Performance Bottlenecks (Scores: 77–83)
1. **Render-Blocking External Fonts:** `src/app/layout.tsx` imports Google Fonts via external `<link rel="stylesheet">` tags (`fonts.googleapis.com`). This introduces external round trips and delays First Contentful Paint (FCP: 3.1s) and Largest Contentful Paint (LCP: 4.2s).
2. **Missing Image Optimization in Core Components:** Raw `<img>` tags in `ClubLogo.tsx` and other sections bypass Next.js WebP/AVIF generation and responsive `srcset`.
3. **Missing Static Asset Caching Headers:** Next.js static chunks and `/images/` assets do not explicitly declare `immutable` cache-control headers for downstream CDN caching.

### B. Accessibility Opportunities (Scores: 92–96)
1. **Color Contrast:** `--text-muted: #77766F` on Ivory `#F5F0E5` achieves only ~3.8:1, falling short of WCAG AA 4.5:1 requirement.
2. **Accessible Names (WCAG 2.5.3):** Visible text in `<Link href="/">` and language button does not match their overridden `aria-label`.
3. **Missing Form Select Labels:** Filter `<select>` elements in the Events list lack explicit labels or `aria-label` attributes.
4. **Heading Hierarchy:** Skipped heading levels (jumping from `h2` directly to `h4` in cards/footer).

### C. Best Practices (Gallery: 96)
- **404 Console Errors:** Seed gallery albums reference non-existent placeholder cover paths (`/assets/placeholders/gallery-*-cover.webp`). Missing images trigger network 404 errors in the browser console.

### D. Architectural Goals for Phase 6
- Eliminate external render-blocking font stylesheets using `next/font/google` with `display: 'swap'`.
- Enforce WCAG AA contrast tokens (`#545E56` for text-muted, `#8A6424` for gold accents).
- Fix heading hierarchies and provide explicit `aria-label` attributes.
- Add branded `loading.tsx`, `error.tsx`, and `not-found.tsx` to `src/app/(public)/`.
- Add Open Graph, Twitter cards, canonical tags, `hreflang` alternate tags, and JSON-LD schema across public routes.
- Implement proper RTL logical CSS properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`).
- Provide Nginx/Cloudflare caching directives.
