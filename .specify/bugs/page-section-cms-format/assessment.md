# Bug Assessment: Page Section Plain Text vs. JSON CMS Mismatch

- **Date:** 2026-10-19
- **Scope:** Feature 015 - CMS Editable Pages and Narrative Sections
- **Target Files:**
  - `src/app/admin/pages/PageSectionModal.tsx`
  - `src/lib/schemas/sections.ts`
  - `src/lib/db/queries.ts`
  - `src/app/(public)/about/page.tsx`
  - `src/app/(public)/history/page.tsx`

---

## 1. Problem Description
In the administrative console (`/admin/pages`), `PageSectionModal.tsx` rendered a single raw `<textarea>` for English and Arabic content. When administrators modified section narratives or typed unformatted plain text, plain text was saved directly into SQLite columns `page_sections.content_en` and `content_ar`.

Public pages (`/about`, `/history`) invoked `getPageWithSections()` which executed `parseSectionJson()`. When plain text was encountered:
- `parseSectionJson` returned `{ body: trimmed }`.
- Public templates expected structured JSON keys: `heading`, `subheading`, `badge`, `quote`, `items` (repeatable cards), `documentTitle`, `documentUrl`.
- Because these properties were `undefined`, pages silently fell back to hardcoded default strings (e.g. `"Institutional Mission"`), or empty arrays (causing Values cards and Milestones timelines to vanish).
- Consequently, legitimate administrative edits never surfaced on the live public site.

---

## 2. Root Cause Analysis
1. **Unstructured Admin Input:** The modal provided no form inputs for structured fields (Heading, Subtitle, Badge, Quote, Items, Documents).
2. **Brittle Fallback Logic:** Any non-JSON input or missing JSON property caused the public renderer to use hardcoded strings.
3. **No Validation Schema:** There was no shared Zod schema between the admin editor, server action, and database query layer.
4. **No RTL Support:** Arabic inputs lacked explicit `dir="rtl"` and font-arabic styling in the modal.
