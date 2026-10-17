# TECHNICAL ARCHITECTURE PLAN: 006 - Institutional Information Pages

## 1. System Overview
This plan establishes the dynamic rendering architecture for the `/about` and `/history` pages, connecting them directly to the `editable_pages` and `page_sections` tables in the database layer.

---

## 2. Data Flow & Models

```mermaid
flowchart TD
    DB[("SQLite Database<br/>editable_pages & page_sections")] -->|getPageWithSections(slug)| QL["src/lib/db/queries.ts"]
    QL -->|Page & Sections JSON| AboutPage["src/app/(public)/about/page.tsx"]
    QL -->|Page & Sections JSON| HistoryPage["src/app/(public)/history/page.tsx"]
    AboutPage --> Components["Mission, Vision, Values, Constitution, Pillars Components"]
    HistoryPage --> Timeline["Historical Milestones Timeline & Archives Components"]
    Components --> EmptyState["Fallback EmptyState (When DB record empty or unpublished)"]
```

---

## 3. Data Model & Helper Types
In `src/lib/db/queries.ts`:
- Define `SectionContentData` and `SectionContentItem` interfaces.
- Add `getPageWithSections(slug: string)`:
  Queries `editablePages` where `slug = slug` and `isPublished = true`.
  Queries associated `pageSections` ordered by `sortOrder ASC`.
  Safely parses `contentEn` and `contentAr` as structured JSON, with fallback to `{ body: text }` if plain text.
- Add seed data in `src/lib/db/seed.ts` for `page_about` and `page_history` with complete sections.

---

## 4. Component Structure
- `src/app/(public)/about/page.tsx`:
  - PageHeader with title, titleAr, breadcrumbs (`Home > About`).
  - Mission & Vision dual grid cards with Arabic quotes.
  - Core Values 5-card grid with scholarly icons.
  - The Four Pillars grid.
  - Constitution & Bylaws banner with downloadable PDF card and archival citation.
  - Cross-link banner to `/founders` and `/history`.
  - EmptyState fallback if no sections or unpublished.
- `src/app/(public)/history/page.tsx`:
  - PageHeader with title, titleAr, breadcrumbs (`Home > About > History`).
  - Institutional Genesis narrative section.
  - Chronological Timeline with verified milestone nodes, dates, Arabic titles, and archival citations.
  - Archival Preservation Policy card explaining immutable records.
  - Cross-link banner to `/founders`, `/about`, and `/events`.
  - EmptyState fallback if no milestones or unpublished.

---

## 5. Verification Strategy
1. Run `tsx` database test to verify `getPageWithSections("about")` and `getPageWithSections("history")`.
2. Verify empty-state rendering when an unknown slug is queried.
3. Verify `pnpm next build` produces 0 TypeScript errors and successfully prerenders `/about` and `/history`.
