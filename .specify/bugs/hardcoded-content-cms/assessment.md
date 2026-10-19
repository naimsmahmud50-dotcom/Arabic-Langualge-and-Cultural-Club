# Bug Assessment: Hardcoded Site Content and Static Navigation

- **Bug ID**: BUG-PHASE4-HARDCODED-CONTENT-CMS
- **Component**: Public Header (`src/components/layout/Header.tsx`), Footer (`src/components/layout/Footer.tsx`), Hero Section (`src/components/home/HeroSection.tsx`), Introduction (`src/components/home/IntroductionSection.tsx`), Root Metadata (`src/app/layout.tsx`), Admin Settings (`src/app/admin/settings/SettingsManagerClient.tsx`)
- **Severity**: High (Content Inflexibility / Administrator Inability to Update Core Identity, Navigation, and Homepage)
- **Status**: Remediating

## 1. Problem Statement
Critical public website content across the Arabic Language & Cultural Club platform remains statically hardcoded in React TSX components rather than reading from SQLite database settings. Consequently, administrators cannot update the phone number, social links, menu items, hero banners, or footer copy without code modifications and redeployments.

### Audit of Hardcoded Content:
1. **Header (`src/components/layout/Header.tsx`)**:
   - Brand name ("Arabic Language & Cultural Club")
   - Subtitle / Collegiate institution ("Kabi Nazrul Government College, Dhaka")
   - Arabic nomenclature ("نادي اللغة والثقافة العربية - كلية كابي نذرول الحكومية")
   - Hardcoded 10-item navigation array (About, History, Founders, Leadership, Calendar, Gallery, Resources, Publications, News, Contact)
   - CTA button ("Join Club" -> `/membership`)
   - Logo path (`/images/logo/club-crest-transparent.png`)
2. **Footer (`src/components/layout/Footer.tsx`)**:
   - Institutional identity block, mission bio, and Arabic motto
   - Hardcoded sitemap links
   - Copyright notice line
3. **Homepage Hero (`src/components/home/HeroSection.tsx`)**:
   - Collegiate badge ("Official Collegiate Society • Kabi Nazrul Govt. College, Dhaka")
   - Arabic Bismillah header
   - English headline ("Preserving Heritage, Advancing Eloquence, Cultivating Leadership.")
   - Editorial narrative lead paragraph
   - Action buttons ("Apply for Membership", "Explore Our Legacy", "12-Month Calendar")
   - Classical star background pattern (no custom hero banner support)
   - Emblem card title, quote, and badge
4. **Introduction & Mission (`src/components/home/IntroductionSection.tsx`)**:
   - Mandate badge, heading, Arabic quote, and descriptive paragraph
   - Four pillars overview
5. **Layout Metadata (`src/app/layout.tsx`)**:
   - Static `export const metadata: Metadata` instead of dynamic `generateMetadata()` driven by `site_settings`.

## 2. Root Cause Analysis
1. Absence of a centralized, cached `getSiteSettings()` typed helper connected to Next.js tag-based revalidation (`revalidateTag("site-settings")`).
2. Missing setting keys in `site_settings` for navigation menus, hero elements, footer text, and custom logo URLs.
3. Lack of an administrative Navigation Manager UI for reordering, adding, editing, or toggling menu visibility.
4. Public layout and homepage components did not accept or consume dynamic settings props.

## 3. Remediation Strategy
1. **Database Migration (`scripts/migrate-phase4-site-settings.ts`)**:
   - Seed missing `site_settings` keys with defaults matching current hardcoded content so the site remains visually identical.
2. **Typed Settings Helper (`src/lib/settings.ts`)**:
   - `getSiteSettings()` with React `cache()` and Next.js `unstable_cache` tagged with `"site-settings"`.
   - Comprehensive default fallbacks for every property.
3. **Admin Navigation Manager (`src/app/admin/settings/SettingsManagerClient.tsx`)**:
   - Interactive Navigation Tab: Add, edit labels (EN/AR), change links, reorder (move up/down), toggle visibility, and configure CTA button.
4. **Admin Hero & Homepage Tab**:
   - Edit Hero badge, title, subtitle, Arabic heading, CTA labels & links, background image URL, emblem card copy, and footer text.
5. **Component Updates (`Header.tsx`, `Footer.tsx`, `HeroSection.tsx`, `IntroductionSection.tsx`, `PublicLayout`)**:
   - Supply settings props from Server Components down to client headers/footers with graceful fallbacks.
6. **Dynamic SEO Metadata (`src/app/layout.tsx`)**:
   - Replace static `metadata` with `generateMetadata()` fetching `getSiteSettings()`.
7. **Cache Invalidation (`src/lib/actions/governance.ts`)**:
   - Revalidate tag `"site-settings"` and root layout path `"/"` upon saving settings.
