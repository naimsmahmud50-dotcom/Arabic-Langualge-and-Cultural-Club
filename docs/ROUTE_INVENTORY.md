# Institutional Route Inventory
**Arabic Language & Cultural Club (نادي اللغة والثقافة العربية)**

*Generated for Phase 3 (Prompt 04) — Application Foundation & Routing*  
*Last Verified: 2026-10-17 • Build Status: 100% Passing (`pnpm next build`)*

---

## 1. Overview & Architectural Boundaries

The application enforces a strict separation of concerns between:
1. **Public Domain (`src/app/(public)/...`)**: Served under the institutional layout (`Header` + `Footer` + `MobileNav`), providing fast static/ISR delivery with zero exposure of private member information.
2. **Administrative Domain (`src/app/admin/...`)**: Served under the secure workspace layout (`AdminSidebar` + `AdminHeader`), restricted to authorized executive officers and archival trustees.
3. **Global Fallbacks & Suspense (`src/app/...`)**: Institutional loading skeleton (`loading.tsx`), bilingual 404 handler (`not-found.tsx`), and error boundary (`error.tsx`).

---

## 2. Public Route Catalog (16 Routes)

| Route Path | File Target | Layout | Data Sources / Queries | Rendering Mode | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `src/app/(public)/page.tsx` | Public | `getCommitteeTerms()`, `getPublicEvents({ limit: 3 })`, `getPublicAnnouncements({ limit: 3 })` | Static + 1m ISR | **Active Foundation** (Phase 3) |
| `/about` | `src/app/(public)/about/page.tsx` | Public | Institutional Charter & Values | Static | **Active Foundation** (Phase 3) |
| `/founders` | `src/app/(public)/founders/page.tsx` | Public | `getPublicFounders()` | Static + 1m ISR | **Active Foundation** (Phase 3) |
| `/history` | `src/app/(public)/history/page.tsx` | Public | Archival Timeline Milestones | Static | **Active Foundation** (Phase 3) |
| `/leadership` | `src/app/(public)/leadership/page.tsx` | Public | `getCommitteeTerms()`, `getCommitteeMembersByTerm(termId)` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/members` | `src/app/(public)/members/page.tsx` | Public | `getPublicMembers({ search, page })` *(Strict privacy projection)* | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/events` | `src/app/(public)/events/page.tsx` | Public | `getPublicEvents({ category })` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/events/[slug]` | `src/app/(public)/events/[slug]/page.tsx` | Public | `getPublicEventBySlug(slug)` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/gallery` | `src/app/(public)/gallery/page.tsx` | Public | `getPublicGalleryAlbums()` | Static + 1m ISR | **Active Foundation** (Phase 3) |
| `/gallery/[slug]` | `src/app/(public)/gallery/[slug]/page.tsx` | Public | `getPublicGalleryAlbumBySlug(slug)` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/resources` | `src/app/(public)/resources/page.tsx` | Public | `getPublicLearningResources({ category, skillLevel })` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/publications` | `src/app/(public)/publications/page.tsx` | Public | `getPublicPublications()`, `getPublicAchievements()` | Static + 1m ISR | **Active Foundation** (Phase 3) |
| `/news` | `src/app/(public)/news/page.tsx` | Public | `getPublicAnnouncements({ limit: 30 })` | Static + 1m ISR | **Active Foundation** (Phase 3) |
| `/membership` | `src/app/(public)/membership/page.tsx` | Public | Application form & Application reference status lookup | Static | **Active Foundation** (Phase 3) |
| `/contact` | `src/app/(public)/contact/page.tsx` | Public | Secretariat coordinates & dispatch form | Static | **Active Foundation** (Phase 3) |
| `/policies` | `src/app/(public)/policies/page.tsx` | Public | Privacy, Photo consent, WCAG 2.2 AA accessibility | Static | **Active Foundation** (Phase 3) |

---

## 3. Administrative Route Catalog (15 Modules)

| Route Path | File Target | Layout | Data Sources / Queries | Rendering Mode | Implementation Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/admin` | `src/app/admin/page.tsx` | Admin | `getAdminDashboardMetrics()` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/admin/login` | `src/app/admin/login/page.tsx` | Minimal | Administrator Auth Gateway | Static | **Active Foundation** (Phase 3) |
| `/admin/pages` | `src/app/admin/pages/page.tsx` | Admin | Static CMS pages inventory | Static | **Active Foundation** (Phase 3) |
| `/admin/founders` | `src/app/admin/founders/page.tsx` | Admin | `getPublicFounders()` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/admin/committees`| `src/app/admin/committees/page.tsx` | Admin | `getCommitteeTerms()` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/admin/members` | `src/app/admin/members/page.tsx` | Admin | Private member records & verification | Static | **Active Foundation** (Phase 3) |
| `/admin/applications`| `src/app/admin/applications/page.tsx`| Admin | `getAdminMembershipApplications("pending")` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/admin/events` | `src/app/admin/events/page.tsx` | Admin | `getPublicEvents({ limit: 50 })` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/admin/gallery` | `src/app/admin/gallery/page.tsx` | Admin | `getPublicGalleryAlbums()` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/admin/news` | `src/app/admin/news/page.tsx` | Admin | `getPublicAnnouncements({ limit: 50 })` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/admin/resources` | `src/app/admin/resources/page.tsx` | Admin | `getPublicLearningResources({ limit: 50 })` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/admin/publications`| `src/app/admin/publications/page.tsx`| Admin | `getPublicPublications()`, `getPublicAchievements()` | Dynamic SSR | **Active Foundation** (Phase 3) |
| `/admin/users` | `src/app/admin/users/page.tsx` | Admin | System users & RBAC roles | Static | **Active Foundation** (Phase 3) |
| `/admin/settings` | `src/app/admin/settings/page.tsx` | Admin | Institutional settings & DB snapshot | Static | **Active Foundation** (Phase 3) |
| `/admin/audit-logs`| `src/app/admin/audit-logs/page.tsx`| Admin | `getAdminAuditLogs(50)` | Dynamic SSR | **Active Foundation** (Phase 3) |

---

## 4. Shared Foundation Infrastructure

1. **`src/app/layout.tsx`**: Root layout configuring Google Web Fonts (`Inter`, `Manrope`, `Noto Naskh Arabic`), base HTML metadata, `suppressHydrationWarning`, and theme CSS token attachments.
2. **`src/app/loading.tsx`**: Global suspense loader displaying institutional Arabic text (`نادي اللغة والثقافة العربية`) and pulsing skeleton blocks.
3. **`src/app/not-found.tsx`**: High-prestige bilingual 404 handler with direct navigation options.
4. **`src/app/error.tsx`**: Client-side error boundary with error digest logging and retry triggers.
5. **`src/components/layout/Header.tsx`**: Sticky public navigation with desktop links, brand badge, theme toggle, and mobile trigger.
6. **`src/components/layout/MobileNav.tsx`**: Accessible slide-over drawer with body scroll lock.
7. **`src/components/layout/Footer.tsx`**: Comprehensive institutional footer with 4 domain link clusters and legal disclaimer.
8. **`src/components/layout/AdminSidebar.tsx`**: Categorized administrative module navigation.
9. **`src/components/layout/AdminHeader.tsx`**: Fixed administrator topbar with role badges and security logout.
