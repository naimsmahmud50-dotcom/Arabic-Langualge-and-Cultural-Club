/**
 * DEVELOPER NOTE:
 * File: tests/unit/arabic-transliteration.test.ts
 * Purpose: Vitest unit tests for English-to-Arabic name transliteration utility.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 */

import { describe, it, expect } from "vitest";
import { transliterateEnglishToAr } from "@/lib/utils/arabic-transliteration";

describe("English to Arabic Name Transliteration Engine", () => {
  it("accurately translates canonical example: 'Abdullah Bin Salem'", () => {
    const result = transliterateEnglishToAr("Abdullah Bin Salem");
    expect(result).toBe("عبد الله بن سالم");
  });

  it("translates compound theophoric names (Abdul / Abdur combinations)", () => {
    expect(transliterateEnglishToAr("Abdul Rahman")).toBe("عبد الرحمن");
    expect(transliterateEnglishToAr("Abdur Rahim")).toBe("عبد الرحيم");
    expect(transliterateEnglishToAr("Abdul Karim")).toBe("عبد الكريم");
    expect(transliterateEnglishToAr("Abdullah")).toBe("عبد الله");
  });

  it("handles classical collegiate Arabic tripartite names", () => {
    const result = transliterateEnglishToAr("Muhammad Mahmud Hasan");
    expect(result).toBe("محمد محمود حسن");
  });

  it("handles popular collegiate abbreviations (Md. / Md)", () => {
    const result = transliterateEnglishToAr("Md. Tariqul Islam");
    expect(result).toContain("محمد");
    expect(result).toContain("الإسلام");
  });

  it("handles compound -uddin and -ullah patterns", () => {
    expect(transliterateEnglishToAr("Salahuddin Ahmed")).toContain("الدين");
    expect(transliterateEnglishToAr("Saifullah")).toContain("الله");
  });

  it("handles common female student names", () => {
    expect(transliterateEnglishToAr("Fatima")).toBe("فاطمة");
    expect(transliterateEnglishToAr("Aisha")).toBe("عائشة");
    expect(transliterateEnglishToAr("Maryam")).toBe("مريم");
  });

  it("gracefully handles edge cases (whitespace, empty, punctuation)", () => {
    expect(transliterateEnglishToAr("")).toBe("");
    expect(transliterateEnglishToAr("   ")).toBe("");
    expect(transliterateEnglishToAr("   Naim   ")).toBe("نعيم");
    expect(transliterateEnglishToAr("Ali-Hasan")).toBe("علي حسن");
  });

  it("falls back to phonetic transliteration for unlisted names", () => {
    const res = transliterateEnglishToAr("Shamsul Alam");
    expect(res.length).toBeGreaterThan(0);
    // Should contain Arabic characters
    expect(/[\u0600-\u06FF]/.test(res)).toBe(true);
  });
});
