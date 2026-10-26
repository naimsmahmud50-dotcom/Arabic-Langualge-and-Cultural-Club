# Bug Assessment: Public Route Link Navigation Latency & Jarring Loading Spinner

- **Slug**: `link-navigation-loading-latency`
- **Assessed**: 2026-10-20
- **Status**: valid
- **Severity**: high

## Symptom

When users click any navigation link in the site header or on pages (e.g., About, History, Founders, Leadership, Events, Gallery, News, Publications, Resources), the site immediately wipes the viewport and mounts a full-screen 60vh spinning loader with the message "Loading Institutional Archive..." before rendering the requested page.

The user states: "site a load beshi hoy link a click korle aita somadhan kroe dew atto ghore kno" (Too much loading when clicking links; solve this; why does it spin so much?).

## Root Causes Identified

1. **Intrusive Segment Loading Boundary (`src/app/(public)/loading.tsx` and `src/app/loading.tsx`):**
   - In Next.js App Router, placing a `loading.tsx` inside `src/app/(public)/` causes Next.js to wrap every page in a `<Suspense fallback={<PublicLoading />}>`.
   - On any client-side route navigation (`<Link href="...">`), Next.js immediately swaps the currently rendered DOM out and mounts `PublicLoading()`, rendering a 60vh container, a large spinning wheel (`<LoadingSpinner size="lg" />`), and animated skeleton cards.
   - Even a momentary 100–200ms transition causes a jarring full-screen flash and rotation, giving the perception that the site is heavily spinning and sluggish.

2. **Uncached Public Database Queries (`src/lib/db/queries.ts`):**
   - Queries like `getPublicEvents`, `getPublicGalleryAlbums`, `getPublicFounders`, `getCommitteeTerms`, `getPublicAnnouncements`, `getPublicLearningResources`, `getPublicPublications`, `getPublicMembers`, and `getPublicAnnualPlans` run raw SQL/Drizzle queries on every request without caching.
   - On remote databases (like Turso LibSQL), this incurs network latency round-trips (100–300ms) on every navigation click.

3. **N+1 Serial Query Pattern in `/leadership` (`src/app/(public)/leadership/page.tsx`):**
   - Lines 87–96 execute:
     `await Promise.all(rawMembers.map(m => getMemberCommitteeHistory(m.memberId)))`
   - When viewing a committee term with 15 members, 15 individual database round trips are executed in parallel.

4. **Disabled Link Prefetching:**
   - In `src/components/layout/Header.tsx`, flat links like News and Contact had `prefetch={false}`, preventing Next.js from pre-warming route data when links hover into view.

## Proposed Remediation

1. **Remove Disruptive Full-Page Viewport Loaders:**
   - Remove or replace `src/app/(public)/loading.tsx` and `src/app/loading.tsx` with a lightweight, non-blocking top progress bar or localized skeleton loading.
   - Next.js default behavior without full-page `loading.tsx` retains the current page smoothly while the next page's Server Component streams in, providing instant, flicker-free transitions.

2. **Cache Public Read Queries with `unstable_cache`:**
   - Wrap public queries in `src/lib/db/queries.ts` with Next.js `unstable_cache` (60s revalidation TTL and relevant cache tags: `'events'`, `'gallery'`, `'leadership'`, `'news'`, `'publications'`, `'resources'`, `'founders'`, `'annual-plans'`).
   - Add revalidation helpers or hooks so admin mutations can invalidate tags if needed.

3. **Batch Committee History Query in `src/app/(public)/leadership/page.tsx`:**
   - Create `getMembersCommitteeHistoryBatch(memberIds: string[])` using `inArray(committeeAssignments.memberId, memberIds)`.
   - Update `src/app/(public)/leadership/page.tsx` to fetch all member histories in 1 single query instead of N queries.

4. **Ensure Link Prefetching is Enabled:**
   - Remove `prefetch={false}` from `src/components/layout/Header.tsx` so Next.js automatically pre-fetches route bundles on viewport entry and hover.

## Files Likely to Change

- `src/app/(public)/loading.tsx`
- `src/app/loading.tsx`
- `src/lib/db/queries.ts`
- `src/app/(public)/leadership/page.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/RouteProgressBar.tsx` (optional top indicator)

## Verification Plan

- Run TypeScript compiler `tsc --noEmit` and `pnpm lint`.
- Run unit test suite `pnpm test:unit`.
- Verify Next.js build `pnpm build`.
- Benchmark route transitions to ensure zero screen wipes and rapid page rendering.
