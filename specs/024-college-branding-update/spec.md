# SPECIFICATION: 024 - Official College Branding Update (Kabi Nazrul Government College)

## 1. Background & Purpose
The Arabic Language & Cultural Club belongs to Kabi Nazrul Government College, Dhaka, Bangladesh (কবি নজরুল সরকারি কলেজ, ঢাকা).
This specification governs Phase 2: updating the official institutional branding, college nomenclature, and associated metadata across the public and administrative website while preserving all existing architecture, design tokens, Arabic RTL layout, and authentication boundaries.

## 2. Official Nomenclature
- **Official English College Name:** Kabi Nazrul Government College, Dhaka
- **Official Bangla College Name:** কবি নজরুল সরকারি কলেজ, ঢাকা
- **Official Arabic College Name:** كلية كابي نذرول الحكومية، دكا
- **Official Club Name:** Arabic Language & Cultural Club
- **Full English Identity:** Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka
- **Full Arabic Identity:** نادي اللغة والثقافة العربية - كلية كابي نذرول الحكومية، دكا
- **Full Bangla Identity:** আরবি ভাষা ও সংস্কৃতি ক্লাব, কবি নজরুল সরকারি কলেজ, ঢাকা
- **Intended Administrative Email:** `arabicclubkngc2025@gmail.com` (configured for environment/settings; auth role changes deferred to later phase).

## 3. User Stories
- **US-01 (P1 - Navigation & Masthead Branding):** As a student or visitor, I want to see "Arabic Language & Cultural Club" with "Kabi Nazrul Govt. College, Dhaka" in the header masthead, mobile drawer, and footer so that the institutional affiliation is immediately clear.
- **US-02 (P1 - Multilingual Dictionaries):** As a bilingual user (English, Arabic, Bangla), I want the college name translated accurately in `en.ts`, `ar.ts`, and `bn.ts` dictionaries without introducing new translation systems or breaking key parity.
- **US-03 (P1 - Homepage & Institutional Narrative):** As a visitor, I want the Hero section, Introduction, About page, and Contact coordinates to reflect Kabi Nazrul Government College (Laxmibazar, Dhaka-1100) without inventing unverified claims.
- **US-04 (P1 - SEO, Metadata & Schema.org JSON-LD):** As a search engine crawler or social sharing preview, I want page titles, OpenGraph cards, and Schema.org `EducationalOrganization` to reference Kabi Nazrul Government College, Dhaka.
- **US-05 (P1 - Database Settings & Seed Fixture Consistency):** As an administrator, I want `site_settings` in SQLite and `seed.ts` to reflect the official college branding and address.

## 4. Constraints & Non-Goals
- Do not rebuild the website.
- Do not modify authentication system, sessions, or administrator roles in this phase.
- Do not alter Gallery, media storage, or event-management engines.
- Do not delete existing content or database records.
- Do not fabricate a college crest; preserve the verified calligraphic emblem (ض).
- Strictly zero AI emojis across all code and documentation.
