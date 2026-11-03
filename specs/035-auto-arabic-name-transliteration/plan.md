# Implementation Plan: Automatic English-to-Arabic Name Transliteration

## 1. Technical Architecture & Approach
We will build a high-performance, deterministic bilingual name transliteration engine:
- Location: `src/lib/utils/arabic-transliteration.ts`
- Layer: Client-side utility function `transliterateEnglishToAr(name: string): string`
- Architecture:
  1. **Canonical Token Dictionary:**
     - Maps high-frequency Islamic, Arabic, and South Asian collegiate names (e.g., Abdullah, Muhammad, Ahmed, Hasan, Mahmud, Naim, Rahman, Fatima, Ali, etc.) to canonical Arabic script.
     - Supports common compound prefixes: "Al-", "El-", "Bin", "Ibn", "Abu", "Umm", "Abdul-", "Abdur-".
  2. **Heuristic Phonetic Transliteration Fallback:**
     - For tokens not found in the dictionary, a rule-based phonetic converter maps digraphs and characters (e.g., `sh` -> `ش`, `kh` -> `خ`, `th` -> `ث`, `gh` -> `غ`, `dh` -> `ذ`, `ch` -> `تش`, etc.) into Arabic consonants and long vowels.
  3. **UI Integration in `MembershipApplicationForm.tsx`:**
     - Add `hasManualArEdit` boolean ref/state.
     - On `applicantName` change, if `!hasManualArEdit`, update `applicantNameAr` with `transliterateEnglishToAr(val)`.
     - When user directly inputs into `applicantNameAr`, set `hasManualArEdit` to `true`.
     - Provide a small, unobtrusive reset/re-sync button ("Sync from English" / "تحويل تلقائي") so the user can easily re-enable auto-sync if desired.

---

## 2. Blast Radius & Non-Regression Safeguards
- **Zero Schema Change:** The database table `membership_applications` already accepts `applicantNameAr: text`.
- **Zero Server Action Change:** `submitMembershipApplicationAction` in `src/lib/actions/membership-application.ts` and `src/lib/validations/membership.ts` already validate and persist `applicantNameAr`.
- **Existing Tests:** All existing membership tests, settings tests, and E2E specs remain 100% compliant.

---

## 3. Verification Strategy
- **Unit Tests:** `tests/unit/arabic-transliteration.test.ts` testing 25+ common and compound names.
- **Typecheck:** `pnpm typecheck` with 0 errors.
- **Unit Suite:** `pnpm test:unit` with 100% pass rate.
- **Build:** `pnpm build` with clean generation across all 24 routes.
- **E2E / Browser Verification:** Verify live on `http://localhost:3005/membership` and Cloudflare tunnel.
