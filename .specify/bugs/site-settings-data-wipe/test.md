# Bug Verification: Site Settings Data Wipe Across Tabs

- **Slug**: site-settings-data-wipe
- **Tested**: 2026-10-19T11:18:30+06:00
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: verified

## Summary
The site settings data-wipe bug is completely resolved. Extensive automated testing confirmed that editing and saving fields in an isolated tab (e.g. SEO & Metadata) leaves all other tabs' data (Brand Identity, Secretariat Contact Coordinates, Social Channels, System Defaults) 100% intact in the database. Client-side persistent DOM mounting (`hidden` toggle) and defensive server-side `formData.has()` filtering successfully eliminate unintentional field overwrites.

## Checks Performed

| Check | Command / Action | Result | Notes |
|-------|------------------|--------|-------|
| Reproduction (post-fix) | Simulated partial SEO tab submission | pass | Verified that unsubmitted database rows remained identical |
| New / updated tests | `pnpm exec tsx scripts/test-settings-preserve.ts` | pass | 16/16 tests passed (100% pass rate) |
| Zod validation checks | RFC 5322 email, URLs, max length limits | pass | Rejects malformed email, javascript: URI injection, invalid protocols |
| Lint / type-check | `pnpm typecheck` (`tsc --noEmit`) | pass | Clean compilation, 0 type errors |
| Production build | `pnpm build` | pass | All 23 static and dynamic routes compiled with zero errors |
| Runtime health | `systemctl --user status arabic-club.service` | pass | Service active and running on port 3005 |

## Output Excerpts
```text
[Suite 1] Zod Schema Validation Rules
  ✓ PASS: Accepts valid RFC email format
  ✓ PASS: Rejects malformed email address
  ✓ PASS: Accepts valid http and https URLs
  ✓ PASS: Rejects non-http/https URL protocol
  ✓ PASS: Rejects javascript: URI injection
  ✓ PASS: Rejects tagline exceeding maximum length (300 chars)

[Suite 2] Partial Tab Submission & Data Non-Destruction
  ✓ PASS: Initial club_name exists in database baseline
  ✓ PASS: Initial contact_email exists in database baseline
  ✓ PASS: SEO partial input passes Zod validation
  ✓ PASS: Only 3 entries queued for update from SEO tab
  ✓ PASS: General tab (club_name) remains exactly identical after SEO-only update
  ✓ PASS: Contact tab (contact_email) remains exactly identical after SEO-only update
  ✓ PASS: Social tab (social_facebook) remains exactly identical after SEO-only update
  ✓ PASS: Contact tab (office_hours) remains exactly identical after SEO-only update
  ✓ PASS: System tab (theme_default) remains exactly identical after SEO-only update
  ✓ PASS: SEO canonical_url successfully updated in database
RESULTS: 16 / 16 tests passed (100%)
```

## Residual Risks
- None identified for settings persistence.
- Any new settings tabs added in the future should follow this standard: maintain elements mounted inside `<form>` using CSS visibility and declare fields in `src/lib/validations/settings.ts`.

## Recommendation
Close the bug — verified end-to-end.
