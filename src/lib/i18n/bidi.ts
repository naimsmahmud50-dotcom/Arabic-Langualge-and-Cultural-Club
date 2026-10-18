/**
 * @file src/lib/i18n/bidi.ts
 * @description Bidirectional (BiDi) text formatting and isolation utilities.
 * 
 * DEVELOPER USAGE NOTE:
 * - Solves mixed Arabic-Latin text display issues (e.g. phone numbers, reference IDs, emails).
 * - Prevents hyphens, parentheses, and digits in strings like "REG-2026-1042" or "+880 1712-345678"
 *   from inverting or jumping across words when rendered inside RTL text.
 * - Human-crafted: lightweight, zero external dependencies.
 */

import React from "react";

/**
 * Unicode control characters for directional isolation
 */
export const BIDI_LRO = "\u202D"; // Left-to-Right Override
export const BIDI_RLO = "\u202E"; // Right-to-Left Override
export const BIDI_LRE = "\u202A"; // Left-to-Right Embedding
export const BIDI_RLE = "\u202B"; // Right-to-Left Embedding
export const BIDI_PDF = "\u202C"; // Pop Directional Formatting
export const BIDI_LRI = "\u2066"; // Left-to-Right Isolate
export const BIDI_RLI = "\u2067"; // Right-to-Left Isolate
export const BIDI_PDI = "\u2069"; // Pop Directional Isolate

/**
 * Checks if a string contains Arabic Unicode glyphs.
 */
export function hasArabicGlyphs(text: string): boolean {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

/**
 * Wraps technical reference codes, telephone numbers, emails, or URLs with
 * Unicode Left-to-Right Isolate characters so they never corrupt surrounding RTL context.
 */
export function isolateLtrText(text: string | number): string {
  if (text === null || text === undefined) return "";
  const str = String(text);
  return `${BIDI_LRI}${str}${BIDI_PDI}`;
}

/**
 * Optional converter converting Western Arabic numerals (0-9) to Eastern Arabic-Indic numerals (٠-٩).
 */
export function toArabicNumerals(num: number | string): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/[0-9]/g, (w) => arabicDigits[Number(w)]);
}

export interface BidiCodeProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: "span" | "bdi" | "code";
  className?: string;
}

/**
 * React Component that guarantees strict LTR isolation for reference numbers,
 * telephone numbers, emails, and code tokens inside both LTR and RTL page layouts.
 */
export function BidiCode({
  children,
  as: Component = "bdi",
  className = "",
  ...props
}: BidiCodeProps) {
  return React.createElement(
    Component,
    {
      dir: "ltr",
      className: `inline-block font-mono tracking-normal text-left ${className}`,
      style: { unicodeBidi: "isolate", direction: "ltr" },
      ...props,
    },
    children
  );
}
