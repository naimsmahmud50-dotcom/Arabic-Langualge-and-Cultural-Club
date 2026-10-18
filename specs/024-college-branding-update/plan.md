# PLAN: 024 - Official College Branding Update (Kabi Nazrul Government College)

## 1. Architecture & Modification Plan

This plan organizes the branding update into 5 atomic steps:

### Step 1: Layout Components (Header, Mobile Drawer, Footer)
- Update `src/components/layout/Header.tsx` to include "Kabi Nazrul Govt. College, Dhaka" / "كلية كابي نذرول الحكومية، دكا" in the masthead brand text.
- Update `src/components/layout/MobileNav.tsx` to display the college affiliation.
- Update `src/components/layout/Footer.tsx` column 1 identity block and bottom copyright line.

### Step 2: Multilingual Translation Dictionaries
- Update `src/lib/i18n/dictionaries/en.ts`: Update hero badges and collegiate society strings with Kabi Nazrul Government College, Dhaka.
- Update `src/lib/i18n/dictionaries/ar.ts`: Update Arabic collegiate society strings with كلية كابي نذرول الحكومية، دكا.
- Update `src/lib/i18n/dictionaries/bn.ts`: Update Bangla collegiate strings with কবি নজরুল সরকারি কলেজ, ঢাকা.

### Step 3: Homepage & Public Route Content
- Update `src/components/home/HeroSection.tsx`: Update collegiate badge to "Official Collegiate Society • Kabi Nazrul Govt. College, Dhaka" and Arabic bismillah heading.
- Update `src/components/home/IntroductionSection.tsx`: Reference Kabi Nazrul Government College, Dhaka in society overview.
- Update `src/components/home/VerifiedContactSection.tsx`: Campus secretariat address: "Kabi Nazrul Government College, Laxmibazar, Dhaka-1100, Bangladesh".
- Update `src/app/(public)/about/page.tsx`: Page metadata title and description.
- Update `src/app/(public)/contact/page.tsx`: Page metadata title and description.
- Update `src/app/(public)/policies/page.tsx`: Page metadata.

### Step 4: SEO, Structured Data & Metadata
- Update `src/app/layout.tsx`: Root metadata titles, OpenGraph siteName, and descriptions.
- Update `src/components/seo/JsonLd.tsx`: Organization name: "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka" with Arabic and Bangla alternate names.
- Update `.env.example`: Set `INITIAL_ADMIN_EMAIL=arabicclubkngc2025@gmail.com`.

### Step 5: Database Settings Update
- Update `src/lib/db/seed.ts` for future seed consistency.
- Update SQLite database `site_settings` table:
  - `club_name`: "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka"
  - `headquarters_address`: "Department of Arabic & Islamic Studies, Kabi Nazrul Government College, Laxmibazar, Dhaka-1100, Bangladesh"

## 2. Verification Strategy
- Type safety: `pnpm typecheck` (`tsc --noEmit`)
- Build compilation: `pnpm build`
- Regression testing: `pnpm test`
- Verification of RTL rendering and live HTTP responses
