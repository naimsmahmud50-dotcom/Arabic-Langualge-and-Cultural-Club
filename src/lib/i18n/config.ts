/**
 * @file src/lib/i18n/config.ts
 * @description Internationalization configurations, supported locales, and metadata registry.
 * 
 * DEVELOPER USAGE NOTE:
 * - Declares the 3 supported locales: 'en' (English), 'ar' (العربية), and 'bn' (বাংলা).
 * - Maps each locale to its natural script direction ('rtl' for Arabic, 'ltr' for English & Bengali).
 * - Provides helper functions `getLocaleDirection` and `isValidLocale`.
 */

import { Locale, LocaleMetadata } from "./types";

export const DEFAULT_LOCALE: Locale = "en";

export const SUPPORTED_LOCALES: Locale[] = ["en", "ar", "bn"];

export const LOCALES_METADATA: Record<Locale, LocaleMetadata> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    script: "Latin",
    symbol: "EN",
  },
  ar: {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    script: "Arabic",
    symbol: "عربي",
  },
  bn: {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    dir: "ltr",
    script: "Bengali",
    symbol: "বাং",
  },
};

/**
 * Resolves text layout direction for a given locale string.
 * @param locale Locale code
 * @returns 'rtl' or 'ltr'
 */
export function getLocaleDirection(locale: string): "rtl" | "ltr" {
  if (locale === "ar") return "rtl";
  return "ltr";
}

/**
 * Validates whether an arbitrary string is one of our supported locales.
 */
export function isValidLocale(locale: unknown): locale is Locale {
  return typeof locale === "string" && SUPPORTED_LOCALES.includes(locale as Locale);
}

export const STORAGE_KEY_LOCALE = "alc_locale";
export const COOKIE_KEY_LOCALE = "alc_locale";
