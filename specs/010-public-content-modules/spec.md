# SPECIFICATION: 010 - Public Content Modules (News, Learning Resources, Achievements & Publications)

## 1. Overview & Objective
Implement and verify three public content hubs for the Arabic Language & Cultural Club:
1. **News & Announcements (`/news`, `/news/[slug]`):** Filterable, searchable bulletin archive, pinned notifications, editorial detail dossiers, and dynamic SEO metadata.
2. **Arabic Learning Resources (`/resources`):** Curated pedagogical library with grammar (Nahw/Sarf), vocabulary, rhetoric, downloadable materials, skill levels, and authenticated typography.
3. **Achievements & Publications (`/publications`):** Official institutional press, magazine issues ("Al-Bayan"), quarterly bulletins, and historical debate/oratory honors roll.

---

## 2. User Stories

### Story 1: News & Announcements (Visitor & Student)
- **As a** university student or faculty member,
- **I want to** browse official club communiqués, circulars, and executive announcements with search and category filters,
- **So that** I stay informed about administrative decrees, schedule adjustments, and event reports.

### Story 2: News Article Detail & SEO
- **As a** visitor sharing a club bulletin,
- **I want to** read the complete bilingual announcement on a dedicated URL (`/news/[slug]`) with verified publication date, author attribution, and accurate OpenGraph metadata,
- **So that** official club news is easily cited, shared, and indexed.

### Story 3: Arabic Learning Resources
- **As an** Arabic language learner,
- **I want to** filter educational materials by category (Grammar, Morphology, Rhetoric, Vocabulary) and proficiency level (Beginner, Intermediate, Advanced),
- **So that** I can study vetted pedagogical charts, syntax guides, and download approved PDFs.

### Story 4: Achievements & Publications Showcase
- **As an** academic partner, student, or alumnus,
- **I want to** inspect the club's publication archive (official magazines, bulletins) and verified tournament distinctions,
- **So that** I can review the club's intellectual legacy and competitive record without encountering unverified claims or fake filler.

---

## 3. Acceptance Criteria

### Module A: News & Announcements
- **AC-NWS-01:** `/news` renders published announcements sorted by pinned status (`isPinned = true` first) followed by publication date in descending order.
- **AC-NWS-02:** Draft (`status: "draft"` or `isPublished: false`) or archived records are never returned by public queries.
- **AC-NWS-03:** Search by title/content in English or Arabic works accurately.
- **AC-NWS-04:** Category filtering (`notice`, `news`, `press`, `achievement`) filters records cleanly.
- **AC-NWS-05:** `/news/[slug]` renders the complete article with bilingual headlines, author attribution, publication timestamp, and back navigation.
- **AC-NWS-06:** Non-existent or unpublished slugs cleanly trigger `notFound()`.
- **AC-NWS-07:** `generateMetadata({ params })` dynamically generates accurate `<title>` and `<meta name="description">`.

### Module B: Arabic Learning Resources
- **AC-RES-01:** `/resources` renders curated materials categorized into grammar, morphology, rhetoric, vocabulary, and literature.
- **AC-RES-02:** Each resource displays skill level badge (`beginner`, `intermediate`, `advanced`) with color coding.
- **AC-RES-03:** Correct Arabic typography is enforced (`dir="rtl"`, Tajawal font, clear diacritical marks).
- **AC-RES-04:** Download button links to validated files and increments download counter safely.
- **AC-RES-05:** Empty state renders when a category has no published resources.

### Module C: Achievements & Publications
- **AC-PUB-01:** `/publications` displays official magazines and bulletins with cover imagery, issue reference numbers, publication dates, and download buttons.
- **AC-PUB-02:** Concurrently displays the Roll of Honor (competitive distinctions and institutional awards) with dates, award category, and verified descriptions.
- **AC-PUB-03:** Empty states render gracefully if no items are currently published in either category.

---

## 4. Security & Privacy Constraints (Strix Supabase / DB Guardrails)
- **Draft/Archived Isolation:** Only records where `isPublished === true` (and `status === "published"`) are accessible via public queries.
- **No Private Member Exposure:** Author attribution displays approved public author names or institutional titles only (e.g. "Executive Secretariat", "Editorial Board").
- **Safe URLs:** Downloadable documents must adhere to approved storage paths or verified external safe links.
- **Zero Fabrication:** Only verified historical awards, publications, and announcements are seeded. Unverified claims are strictly forbidden.
