# Implementation Plan: 034-fix-site-settings-wipe-bug

## Architecture & Design

### 1. Client Architecture (`SettingsManagerClient.tsx`)
- **Single State Object**: Manage all ~18 form values in a single React state object `formDataState` initialized from `initialSettings`.
- **CSS-based Tab Visibility**: Instead of unmounting inactive tabs with `{activeTab === 'general' && ...}`, keep all five settings tabs mounted in the DOM inside `<form>`. Apply `className={activeTab === tabId ? "space-y-6" : "hidden"}` and `aria-hidden={activeTab !== tabId}`.
- **Unsaved Changes Tracking**: Compare `formDataState` with `initialSettings` to determine `isDirty`. Register `beforeunload` listener when `isDirty` is true.
- **Toast Notifications & Loading**: Replace inline only alerts with a toast notification banner and dynamic loading spinner on the submit button.

### 2. Server Action Architecture (`src/lib/actions/governance.ts`)
- **Defensive Key Presence (`formData.has(key)`)**:
  - Rather than reading an unconditional array of 18 keys, dynamically inspect submitted keys.
  - Group keys by category.
  - Only include a key in `entries` if `formData.has(key)` or if both language variants (e.g., `club_name_en` or `club_name_ar`) are present.
- **Zod Schema Validation**:
  - Define `siteSettingsSchema` using Zod.
  - Validate email using `z.string().email()`.
  - Validate optional URLs using `z.string().url().or(z.literal(""))`.
  - Validate SEO fields with max lengths.
  - If validation fails, return structured `{ success: false, message: ... }`.

### 3. Database Safety
- Back up `site_settings` before modifications.
- Existing query `updateSiteSettings(entries)` in `src/lib/db/queries.ts` already handles updating only the keys passed to it in `entries`. By filtering `entries` defensively, unmentioned keys remain completely untouched in the database.

### 4. Verification Strategy
- Create automated test script `tests/test-site-settings-preservation.ts` to execute `saveSiteSettingsAction` with only SEO fields and verify that all other records in `arabic_club.db` retain their original values.
- Verify production build with `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
