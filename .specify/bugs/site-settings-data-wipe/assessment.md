# Bug Assessment: Site Settings Data Wipe Across Inactive Tabs

- **Slug**: site-settings-data-wipe
- **Severity**: High / Data Loss
- **Component**: Administrative Settings Console (`SettingsManagerClient.tsx`, `governance.ts`)
- **Institution**: Kabi Nazrul Government College, Dhaka (Arabic Language & Cultural Club)

## Problem Summary
When an administrator edits and saves settings on any single tab (e.g. SEO & Metadata) in `/admin/settings`, all fields belonging to inactive tabs (e.g. General Identity, Secretariat Contact, Social Channels) are wiped from the database and replaced with empty strings or default fallbacks.

## Reproduction Steps
1. Navigate to `/admin/settings`.
2. Notice existing settings in database (e.g. `contact_email: "arabicclubkngc2025@gmail.com"`).
3. Switch to "Search & Metadata" (SEO) tab.
4. Only SEO inputs are rendered into the DOM.
5. Click "Save Settings".
6. In `saveSiteSettingsAction`, `formData.get("contact_email")` returns `null` which evaluates to `""`.
7. `updateSiteSettings` executes `UPDATE site_settings SET value_en = '', value_ar = '' WHERE key = 'contact_email'`.
8. Contact email, telephone, social media URLs, and identity values are wiped.

## Root Cause
1. `SettingsManagerClient.tsx` used conditional rendering (`{activeTab === 'general' && ...}`) which unmounted inactive tabs from the form DOM, omitting their keys from `FormData`.
2. `saveSiteSettingsAction` in `governance.ts` unconditionally iterated an array of all 18 keys and wrote empty strings for any missing keys without checking `formData.has()`.
