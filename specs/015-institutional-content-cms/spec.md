# SPECIFICATION: 015 - Institutional Content CMS Modules

## Overview
Implement the production-ready administrative CMS modules for managing institutional legacy and structural content for the Arabic Language & Cultural Club:
1. **Website Pages & Sections CMS (`/admin/pages`):** Manage public pages and dynamic sections (About, Mission, Vision, Values, History, Timeline milestones, Policies) without touching source code.
2. **Founders & Originators CMS (`/admin/founders`):** Manage permanent verified founder profiles, portraits, founding years, citations, and biographies in English and Arabic.
3. **Committees & Terms Preservation CMS (`/admin/committees`):** Manage academic governing terms with strict historical preservation (creating a new term preserves previous terms intact), executive council designation, and officer portfolio assignments.
4. **Member Records & Visibility Console (`/admin/members`):** Comprehensive internal registry with private contact management, student verification, status transitions (active, alumni, suspended), and public directory visibility consent toggles.

## User Stories & Acceptance Criteria

### User Story 1 (P1): Website Pages & Dynamic Sections CMS (`/admin/pages`)
**Goal**: Authorized administrators can update institutional narratives (mission, vision, values, historical timeline milestones) dynamically through the CMS, updating the public site immediately without developer code edits.
- **Criteria 1.1**: List all editable pages with slug, title (EN & AR), active sections count, and publication status.
- **Criteria 1.2**: Edit page metadata (titleEn, titleAr, metaDescriptionEn, metaDescriptionAr, isPublished).
- **Criteria 1.3**: Manage page sections: list sections for a page, add new sections, edit bilingual content (English & Arabic JSON/text), update sort order, and toggle published status.
- **Criteria 1.4**: Public routes (`/about`, `/history`) dynamically reflect updated content from the database.

### User Story 2 (P1): Founders & Originators CMS (`/admin/founders`)
**Goal**: The Secretariat can curate authenticated founder profiles with verified archival records, preventing historical fabrication while maintaining an authentic historical record.
- **Criteria 2.1**: List view displaying verified founders with portrait thumbnail, English & Arabic names, designations, inception year, sort order, and publish status.
- **Criteria 2.2**: Search and filter by name, designation, or publication status.
- **Criteria 2.3**: Create and Edit forms with server-side validation (Zod) for nameEn, nameAr, roleTitleEn, roleTitleAr, bioEn, bioAr, foundingYear, portraitUrl, and sortOrder.
- **Criteria 2.4**: Safe delete/unpublish with confirmation modal dialog (`AdminConfirmModal`).
- **Criteria 2.5**: Audit log recorded on create, update, or deletion.

### User Story 3 (P1): Committee Terms & Preservation Management (`/admin/committees`)
**Goal**: The club can inaugurate new executive terms while permanently preserving all past councils and officeholders without data loss or overwrites.
- **Criteria 3.1**: List all academic governing terms with term year, title, dates, active status, and officeholder count.
- **Criteria 3.2**: Create new term with server-side validation: if marked as `isCurrent`, atomically demote previously active terms to `isCurrent: false` while keeping their records and assignments intact.
- **Criteria 3.3**: Manage committee assignments: assign members to a term with position title (EN & AR), rank order, and role description. Support members serving in multiple terms over time.
- **Criteria 3.4**: Delete/remove assignments or unassign officers with confirmation.
- **Criteria 3.5**: Changes immediately update public `/leadership` term selector.

### User Story 4 (P1): Member Records & Privacy-Safe Visibility Console (`/admin/members`)
**Goal**: Maintain the internal membership registry with complete private contact data while strictly safeguarding personal identifiable information (PII) from unauthorized public exposure.
- **Criteria 4.1**: List view with search (name, email, student ID, ref), status filter (`all`, `active`, `alumni`, `suspended`), and visibility filter (`all`, `public`, `private`).
- **Criteria 4.2**: Pagination with `AdminPagination` supporting large rosters.
- **Criteria 4.3**: Manual fellow registration form and edit modal for member details (name, email, phone, student ID, department, status, bio).
- **Criteria 4.4**: Explicit directory visibility toggle (`isPublic`) enforcing consent: only members with `isPublic: true` ever appear in the public `/members` directory; private emails and phone numbers are never exposed in public queries.
- **Criteria 4.5**: Audit logs generated for all status and visibility changes.

## Security & Architectural Constraints
- Strictly zero AI emojis; only authentic academic design, refined typography, and Lucide SVG icons.
- Complete JSDoc developer headers on every modified and newly created file.
- Server-side RBAC validation (`assertPermission`) on all mutations.
- 100% automated test verification before completion.
