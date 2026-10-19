# Bug Fix: Site Settings Data Wipe Remediation

- **Slug**: site-settings-data-wipe
- **Status**: Implemented

## Changes Applied

1. **Persistent Form Mounting & Unified State**:
   - In `src/app/admin/settings/SettingsManagerClient.tsx`, all 5 settings tab panels remain permanently mounted inside `<form>` and are toggled using CSS `hidden` and `aria-hidden`.
   - Unified state object manages all inputs and submits them in unified form state.
   - Added unsaved-changes protection with `beforeunload` warning.
   - Added interactive toast alerts and button loading spinner.

2. **Defensive Server-Side Mutation**:
   - In `src/lib/actions/governance.ts`, refactored `saveSiteSettingsAction` to inspect `formData.has()` for every field.
   - Only explicitly provided keys are passed to `updateSiteSettings`.
   - Missing fields are strictly omitted from update batches.

3. **Zod Schema Validation**:
   - Added `src/lib/validations/settings.ts` enforcing RFC 5322 email patterns, phone formats, valid http/https URLs, and field length boundaries.

4. **Safety & Verification**:
   - Backed up `arabic_club.db` and exported JSON snapshot in `site_settings_backup_phase1.json`.
   - Created automated isolation test suite `scripts/test-settings-preserve.ts`.
