/**
 * @file src/lib/i18n/dictionaries/index.ts
 * @description Central dictionary registry exporting typed dictionaries and fallback resolver.
 * 
 * DEVELOPER USAGE NOTE:
 * - Exports `en`, `ar`, and `bn` dictionaries.
 * - Provides `getDictionary(locale)` which gracefully falls back to English (`en`) if a locale is unknown.
 */

import { Locale, TranslationDictionary } from "../types";
import { en } from "./en";
import { ar } from "./ar";
import { bn } from "./bn";

export const dictionaries: Record<Locale, TranslationDictionary> = {
  en,
  ar,
  bn,
};

/**
 * Retrieves the translation dictionary for the specified locale, falling back to English.
 */
export function getDictionary(locale?: string): TranslationDictionary {
  if (locale === "ar") return ar;
  if (locale === "bn") return bn;
  return en;
}

export { en, ar, bn };
