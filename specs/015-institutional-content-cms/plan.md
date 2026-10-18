# IMPLEMENTATION PLAN: 015 - Institutional Content CMS Modules

## Architecture Overview
This plan implements the administrative CMS modules for managing the club's core institutional assets: Website Pages & Dynamic Sections, Founders Archive, Committee Terms with Historical Preservation, and Member Records with Privacy Consent.

## Data Layer & Server Actions Design

```
+-----------------------------------------------------------------------------------+
|                           ADMINISTRATIVE CLIENT PAGES                             |
|  /admin/pages    |  /admin/founders    |  /admin/committees    |  /admin/members   |
+--------+------------------+---------------------+-------------------+-------------+
         |                  |                     |                   |
         v                  v                     v                   v
+-----------------------------------------------------------------------------------+
|                        SECURE SERVER ACTIONS & RBAC ENFORCEMENT                   |
|  src/lib/actions/pages.ts       -> assertPermission("pages:manage")               |
|  src/lib/actions/founders.ts    -> assertPermission("committees:manage")          |
|  src/lib/actions/committees.ts  -> assertPermission("committees:manage")          |
|  src/lib/actions/members.ts     -> assertPermission("members:manage")             |
+-----------------------------------------------------------------------------------+
         |
         v
+-----------------------------------------------------------------------------------+
|                       DATABASE OPERATIONS LAYER (Drizzle ORM)                     |
|  editablePages & pageSections | founders | committeeTerms & committeeAssignments   |
|  members & auditLogs                                                              |
+-----------------------------------------------------------------------------------+
```

## Detailed File Modifications & Additions

### 1. Database Queries & Mutations (`src/lib/db/queries.ts`)
Add administrative queries & mutations:
- `getAdminPages()`, `getAdminPageWithSections(slug)`, `updateEditablePage(id, data)`, `savePageSection(data)`, `deletePageSection(id)`
- `updateFounder(id, data)`, `deleteFounder(id)`, `toggleFounderPublish(id, isPublished)`
- `getAdminCommitteeTerms()`, `updateCommitteeTerm(id, data)`, `deleteCommitteeTerm(id)`, `getAdminCommitteeAssignments(termId)`, `deleteCommitteeAssignment(id)`
- `createMember(data)`, `updateMember(id, data)`, `deleteMember(id)`, `updateMemberStatus(id, status)`

### 2. Secure Server Actions
- `src/lib/actions/pages.ts`: `savePageMetadataAction`, `savePageSectionAction`, `deletePageSectionAction`
- `src/lib/actions/founders.ts`: `saveFounderAction`, `deleteFounderAction`, `toggleFounderPublishAction`
- `src/lib/actions/committees.ts`: `saveCommitteeTermAction`, `deleteCommitteeTermAction`, `assignCommitteeMemberAction`, `removeCommitteeMemberAction`
- `src/lib/actions/members.ts`: `saveMemberAction`, `updateMemberVisibilityAction`, `updateMemberStatusAction`, `deleteMemberAction`

### 3. Client Admin Views & Modals
- `/admin/pages`:
  - `AdminPagesClient.tsx`: Interactive page and section management with section editor drawer/modal.
  - Page sections editor with live preview link and JSON/text fields.
- `/admin/founders`:
  - `AdminFoundersClient.tsx`: Interactive table with search, status tabs, and `FounderFormModal.tsx`.
- `/admin/committees`:
  - `AdminCommitteesClient.tsx`: Term management with `isCurrent` toggle, term creation modal, and committee assignment roster editor (`AssignMemberModal.tsx`).
- `/admin/members`:
  - `AdminMembersClient.tsx`: Member roster with status filter tabs, search, directory visibility toggle, and `MemberFormModal.tsx`.

### 4. Automated Verification Suite
- `src/lib/db/test-institutional-content-cms.ts`:
  - Test CRUD and persistence for pages and sections.
  - Test founder creation, editing, publishing, and deletion.
  - Test committee term creation, preservation of old terms, and member assignments.
  - Test member creation, status change, and privacy visibility toggle.
  - Test server-side RBAC validation and audit log generation.
