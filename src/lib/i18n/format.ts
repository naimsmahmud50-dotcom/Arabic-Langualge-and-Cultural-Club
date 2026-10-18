/**
 * @file src/lib/i18n/format.ts
 * @description Dynamic bilingual content formatter and localization helpers.
 * 
 * DEVELOPER USAGE NOTE:
 * - Used across public and admin pages to resolve bilingual database entities.
 * - Enforces honest fallback: if Arabic text is not provided, gracefully falls back to English
 *   without crashing or leaving empty holes in the UI.
 * - Provides localized date and number formatting (`Intl.DateTimeFormat` and `Intl.NumberFormat`).
 */

import { Locale } from "./types";
import { DEFAULT_LOCALE } from "./config";

/**
 * Resolves a bilingual string pair based on the active locale.
 * If Arabic is active and `arVal` exists, returns `arVal`; otherwise returns `enVal`.
 */
export function resolveBilingual(
  enVal?: string | null,
  arVal?: string | null,
  locale: string = DEFAULT_LOCALE
): string {
  if (locale === "ar" && arVal && arVal.trim() !== "") {
    return arVal;
  }
  return enVal || "";
}

/**
 * Formats a Date object or ISO timestamp according to the specified locale.
 * - Arabic: Uses Arabic locale formatting with proper month names
 * - Bengali: Uses Bengali locale formatting
 * - English: Uses standard collegiate format (e.g. October 18, 2026)
 */
export function formatDateLocalized(
  dateInput: Date | string | number,
  locale: Locale | string = DEFAULT_LOCALE,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const date = typeof dateInput === "object" ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);

    const intlLocale = locale === "ar" ? "ar-EG" : locale === "bn" ? "bn-BD" : "en-US";
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return new Intl.DateTimeFormat(intlLocale, options || defaultOptions).format(date);
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats an integer or float with locale-specific digit glyphs and grouping.
 */
export function formatNumberLocalized(
  num: number,
  locale: Locale | string = DEFAULT_LOCALE
): string {
  try {
    const intlLocale = locale === "ar" ? "ar-EG" : locale === "bn" ? "bn-BD" : "en-US";
    return new Intl.NumberFormat(intlLocale).format(num);
  } catch {
    return String(num);
  }
}

/**
 * Checks if a string contains Arabic Unicode characters.
 */
export function containsArabic(text?: string | null): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}
