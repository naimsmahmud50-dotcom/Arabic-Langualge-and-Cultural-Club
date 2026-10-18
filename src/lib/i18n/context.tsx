/**
 * @file src/lib/i18n/context.tsx
 * @description React Context Provider and Custom Hooks for Bilingual State Management and Translation.
 * 
 * DEVELOPER USAGE NOTE:
 * - Wrap the application tree with `<LanguageProvider>`.
 * - Consume via `useTranslation()` or `useLocale()`.
 * - Synchronizes `localStorage`, document cookie, `document.documentElement.lang`,
 *   and `document.documentElement.dir`.
 * - Provides nested key lookup with honest fallback cascade (`locale -> en -> fallback -> key`).
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { Locale, Direction, TranslationDictionary } from "./types";
import { 
  DEFAULT_LOCALE, 
  getLocaleDirection, 
  isValidLocale, 
  STORAGE_KEY_LOCALE, 
  COOKIE_KEY_LOCALE 
} from "./config";
import { getDictionary, en } from "./dictionaries";

export interface LanguageContextType {
  locale: Locale;
  direction: Direction;
  isRTL: boolean;
  setLocale: (newLocale: Locale) => void;
  t: (path: string, fallback?: string) => string;
  dict: TranslationDictionary;
  formatBilingual: (enVal?: string | null, arVal?: string | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: LanguageProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [mounted, setMounted] = useState(false);

  // Synchronize with client storage and document attributes on mount
  useEffect(() => {
    setMounted(true);
    let resolvedLocale: Locale = initialLocale;

    // Check localStorage first
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOCALE);
      if (isValidLocale(stored)) {
        resolvedLocale = stored;
      } else {
        // Check cookie fallback
        const match = document.cookie.match(new RegExp(`(^| )${COOKIE_KEY_LOCALE}=([^;]+)`));
        if (match && isValidLocale(match[2])) {
          resolvedLocale = match[2];
        }
      }
    } catch {
      // LocalStorage access may fail in private mode; silently retain initialLocale
    }

    setLocaleState(resolvedLocale);
    applyDocumentLocale(resolvedLocale);
  }, [initialLocale]);

  // Synchronize document attributes whenever locale changes
  const applyDocumentLocale = (targetLocale: Locale) => {
    const dir = getLocaleDirection(targetLocale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = targetLocale;
      document.documentElement.dir = dir;
      if (dir === "rtl") {
        document.documentElement.classList.add("rtl");
      } else {
        document.documentElement.classList.remove("rtl");
      }
    }
  };

  const setLocale = (newLocale: Locale) => {
    if (!isValidLocale(newLocale)) return;
    setLocaleState(newLocale);
    applyDocumentLocale(newLocale);

    try {
      localStorage.setItem(STORAGE_KEY_LOCALE, newLocale);
      document.cookie = `${COOKIE_KEY_LOCALE}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Storage access failure resilience
    }
  };

  const dict = useMemo(() => getDictionary(locale), [locale]);
  const direction = useMemo(() => getLocaleDirection(locale), [locale]);
  const isRTL = direction === "rtl";

  /**
   * Translates a dot-notated key (e.g. "nav.about", "common.search")
   * Falls back to English dictionary, then explicit fallback, then the key itself.
   */
  const t = (path: string, fallback?: string): string => {
    const parts = path.split(".");
    if (parts.length === 2) {
      const [section, key] = parts;
      const dictSection = (dict as unknown as Record<string, Record<string, string>>)[section];
      if (dictSection && dictSection[key]) {
        return dictSection[key];
      }
      // Fallback to English dictionary
      const enSection = (en as unknown as Record<string, Record<string, string>>)[section];
      if (enSection && enSection[key]) {
        return enSection[key];
      }
    }
    return fallback || path;
  };

  /**
   * Dynamic bilingual database field resolver:
   * If current locale is Arabic and Arabic value exists, return it;
   * otherwise return English value, or empty string.
   */
  const formatBilingual = (enVal?: string | null, arVal?: string | null): string => {
    if (locale === "ar" && arVal && arVal.trim() !== "") {
      return arVal;
    }
    return enVal || "";
  };

  const contextValue: LanguageContextType = {
    locale,
    direction,
    isRTL,
    setLocale,
    t,
    dict,
    formatBilingual,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook providing translation function and current dictionary.
 */
export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a graceful non-breaking fallback if used outside LanguageProvider
    return {
      t: (path: string, fallback?: string) => fallback || path,
      locale: DEFAULT_LOCALE,
      direction: "ltr" as Direction,
      isRTL: false,
      dict: en,
      setLocale: () => {},
      formatBilingual: (enVal?: string | null, arVal?: string | null) => enVal || "",
    };
  }
  return context;
}

/**
 * Hook providing locale state and directionality.
 */
export function useLocale() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      locale: DEFAULT_LOCALE,
      direction: "ltr" as Direction,
      isRTL: false,
      setLocale: () => {},
    };
  }
  return {
    locale: context.locale,
    direction: context.direction,
    isRTL: context.isRTL,
    setLocale: context.setLocale,
  };
}
