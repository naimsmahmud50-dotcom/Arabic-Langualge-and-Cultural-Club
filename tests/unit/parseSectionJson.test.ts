/**
 * DEVELOPER NOTE:
 * File: tests/unit/parseSectionJson.test.ts
 * Purpose: Vitest unit tests for parseSectionJson and safeParseSectionJson backward-compatibility.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 */

import { describe, it, expect } from "vitest";
import { parseSectionJson } from "@/lib/db/queries";
import { safeParseSectionJson } from "@/lib/schemas/sections";

describe("parseSectionJson & safeParseSectionJson Parser", () => {
  it("parses valid JSON string with complete section properties", () => {
    const rawJson = JSON.stringify({
      heading: "Our Vision for Arabic Classical Scholarship",
      subheading: "A Century of Eloquence at Kabi Nazrul College",
      badge: "Institutional Heritage",
      body: "The Arabic Language & Cultural Club fosters intellectual rigor and rhetorical mastery.",
      items: [
        { title: "Rhetoric", description: "Studies in Balaghah" },
        { title: "Grammar", description: "Studies in Nahw" },
      ],
      stats: [
        { label: "Active Fellows", value: "200+" },
      ],
    });

    const parsed = parseSectionJson(rawJson);
    expect(parsed.heading).toBe("Our Vision for Arabic Classical Scholarship");
    expect(parsed.subheading).toBe("A Century of Eloquence at Kabi Nazrul College");
    expect(parsed.badge).toBe("Institutional Heritage");
    expect(parsed.body).toContain("fosters intellectual rigor");
    expect(parsed.items).toHaveLength(2);
    expect(parsed.stats).toHaveLength(1);
    expect(parsed.items[0].title).toBe("Rhetoric");
  });

  it("normalizes 'subtitle' alias into 'subheading'", () => {
    const rawJson = JSON.stringify({
      heading: "Milestones",
      subtitle: "Historical Genesis",
      body: "Milestones of our academic journey.",
    });

    const parsed = parseSectionJson(rawJson);
    expect(parsed.subheading).toBe("Historical Genesis");
    expect(parsed.subtitle).toBe("Historical Genesis");
  });

  it("gracefully wraps unformatted plain text as { body: text } for backward compatibility", () => {
    const plainText = "This is legacy plain text stored directly into the database before Phase 2 structured editor.";
    const parsed = parseSectionJson(plainText);

    expect(parsed.body).toBe(plainText);
    expect(parsed.heading).toBe("");
    expect(parsed.items).toEqual([]);
    expect(parsed.stats).toEqual([]);
  });

  it("returns clean default object when given null or empty string", () => {
    const nullParsed = parseSectionJson(null);
    expect(nullParsed.heading).toBe("");
    expect(nullParsed.body).toBe("");
    expect(nullParsed.items).toEqual([]);

    const emptyParsed = parseSectionJson("");
    expect(emptyParsed.heading).toBe("");
    expect(emptyParsed.body).toBe("");
  });

  it("handles malformed JSON without crashing, falling back to body copy", () => {
    const malformedJson = "{ heading: 'Unclosed string, missing quotes ";
    const parsed = safeParseSectionJson(malformedJson);

    expect(parsed.body).toBe(malformedJson.trim());
    expect(parsed.items).toEqual([]);
  });

  it("preserves quotes and attributions cleanly", () => {
    const rawJson = JSON.stringify({
      heading: "Presidential Address",
      quote: {
        text: "Knowledge without rhetoric is like an unlit beacon.",
        attribution: "Prof. Dr. Muhammad Zakir",
        arabicText: "العلم بلا بيان كالسراج بلا ضياء",
      },
    });

    const parsed = parseSectionJson(rawJson);
    expect(parsed.quote?.text).toBe("Knowledge without rhetoric is like an unlit beacon.");
    expect(parsed.quote?.attribution).toBe("Prof. Dr. Muhammad Zakir");
    expect(parsed.quote?.arabicText).toBe("العلم بلا بيان كالسراج بلا ضياء");
  });
});
