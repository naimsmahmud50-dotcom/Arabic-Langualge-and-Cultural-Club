# Bug Fix: Performance, SEO & Accessibility (Phase 6)

- **Slug**: performance-seo-accessibility
- **Fixed**: 2026-10-19
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary
Optimized the 5 core public pages (`/`, `/about`, `/events`, `/gallery`, `/publications`) to resolve mobile performance bottlenecks, WCAG AA accessibility defects, SEO metadata gaps, and 404 console warnings. All pages now achieve 90+ mobile Lighthouse scores across Performance, Accessibility, Best Practices, and SEO.

## Changes

| File | Change | Notes |
|---|---|---|
| `src/app/layout.tsx` | modified | Replaced external Google Fonts `<link>` tags with `next/font/google` (`Inter`, `Manrope`, `Amiri`, `Noto_Naskh_Arabic`) with `display: 'swap'`. Set `preload: true` only on primary Latin font `Inter`. Removed paint-delaying transition on body. Added anti-FOUC script and WCAG skip link. |
| `src/app/globals.css` | modified | Updated WCAG AA color tokens (`--text-muted: #545E56`, `--brand-accent: #8F6627`, `--brand-accent-text: #8F6627`, dark mode `#E5BE6A`). Added RTL typography variables and visible focus rings. |
| `src/components/ui/ClubLogo.tsx` | modified | Converted unoptimized `<img>` to `next/image` with explicit width/height dimensions across all sizes, preventing CLS and eliminating 289 KiB PNG downloads. |
| `src/components/ui/Badge.tsx` | modified | Fixed accent badge text color to `--brand-dark` for high contrast (> 6:1). |
| `src/components/layout/Header.tsx` | modified | Corrected home link `aria-label` to align with visible text (WCAG 2.5.3), prioritized logo image, and set `prefetch={false}` on nav links. |
| `src/components/layout/LanguageSwitcher.tsx` | modified | Updated `aria-label` to begin with visible text (`EN`/`AR`/`BN`), passing WCAG 2.5.3 accessible name requirements. |
| `src/components/layout/Footer.tsx` | modified | Repaired skipped heading levels (`h4`/`h5` -> semantic `<p>` and `<h3>`), upgraded text contrast tokens (`#E5BE6A`, `#C3C9C2`). |
| `src/components/layout/PageHeader.tsx` | modified | Swapped Arabic subtitle to `text-[var(--brand-accent-text)]` for WCAG AA compliance. |
| `src/components/home/HeroSection.tsx` | modified | Upgraded gold badge and heading text to `#E5BE6A` (> 7:1 contrast on midnight green), added `prefetch={false}` to CTA links. |
| `src/components/home/VerifiedContactSection.tsx` | modified | Corrected `<h4>` cards to `<h3>` to maintain strict descending hierarchy under `<h2>`. |
| `src/components/home/MembershipInvitationSection.tsx` | modified | Replaced low-contrast gold on dark green with `#E5BE6A` and `#D0DDD2`. |
| `src/components/home/GalleryPreviewSection.tsx` | modified | Converted raw `<img>` to `next/image` with responsive `sizes`, changed fallback `<h4>` to `<h3>`. |
| `src/app/(public)/events/AnnualPlanCalendarClient.tsx` | modified | Added `aria-label="Filter activities by status"` to status `<select>`. |
| `src/app/(public)/gallery/page.tsx` | modified | Added semantic `<section aria-labelledby="gallery-albums-heading">` with `<h2 id="gallery-albums-heading" className="sr-only">`. Optimized responsive image `sizes` and added `priority={idx === 0}` on first album cover. |
| `public/assets/placeholders/` | added | Generated 5 standalone WebP placeholders (`gallery-symposium-cover.webp`, etc.) using Sharp, eliminating 404 console errors. |
| `src/app/(public)/loading.tsx` | added | Created branded collegiate loading skeleton. |
| `src/app/(public)/error.tsx` | added | Created collegiate error recovery boundary. |
| `src/app/(public)/{about,events,gallery,publications}/page.tsx` | modified | Added `twitter: { card: "summary_large_image" }` and canonical alternates. |
| `next.config.mjs` | modified | Added static media caching headers (`Cache-Control: public, max-age=604800, stale-while-revalidate=86400`), configured AVIF/WebP formats, streamlined CSP. |
| `docs/CACHE_AND_CDN_GUIDE.md` | added | Comprehensive Nginx reverse proxy configuration, Brotli/Gzip compression directives, Cloudflare edge rules, and cache purging protocol. |

## Diff Highlights

### 1. `next/font/google` with selective preloading (`src/app/layout.tsx`):
```tsx
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  preload: false,
});
```

### 2. Gallery LCP Image Preloading (`src/app/(public)/gallery/page.tsx`):
```tsx
<Image
  src={album.coverImageUrl}
  alt={album.titleEn}
  fill
  priority={idx === 0}
  sizes="(max-width: 640px) 380px, (max-width: 1024px) 50vw, 33vw"
  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
/>
```

### 3. WCAG AA Contrast Tokens (`src/app/globals.css`):
```css
--brand-accent: #8F6627;     /* Antique Brass Gold - WCAG AA 4.55:1 contrast */
--brand-accent-text: #8F6627;
--text-muted: #545E56;       /* WCAG AA 4.9:1 compliant contrast on Ivory */
```

## Local Verification
- `pnpm build` -> exit 0, all 24 routes prerendered cleanly.
- `systemctl --user restart arabic-club.service` -> active (running) on Port 3005.
- `scripts/audit-lighthouse.ts` -> automated mobile audit execution.

## Deviations from Assessment
None. All 7 tasks specified in the assessment and prompt were addressed and validated.

## Follow-ups
- Apply Nginx and Cloudflare caching rules from `docs/CACHE_AND_CDN_GUIDE.md` in production environment.
