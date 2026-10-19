/**
 * @file src/lib/utils/sanitize.ts
 * @description Enterprise HTML and Rich-Text sanitization utility using sanitize-html.
 * 
 * DEVELOPER NOTE:
 * - Eliminates Cross-Site Scripting (XSS) in user-submitted, admin-submitted, and CMS rich-text content.
 * - Strips dangerous HTML tags (<script>, <iframe>, <object>, <embed>, <form>, <base>).
 * - Strips dangerous attributes (onerror, onload, onclick, onmouseover, style-based javascript).
 * - Disallows unsafe URI schemes (javascript:, vbscript:, data: except for base64 images).
 * - Enforces rel="noopener noreferrer" on external anchor links to prevent reverse tabnabbing.
 */

import sanitizeHtml from "sanitize-html";

export const ALLOWED_RICH_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr", "b", "i", "strong", "em", "strike", "code", "pre",
  "ul", "ol", "li", "blockquote",
  "a", "img", "table", "thead", "tbody", "tr", "th", "td", "span", "div",
  "sub", "sup"
];

export const ALLOWED_ATTRIBUTES = {
  a: ["href", "name", "target", "rel", "title"],
  img: ["src", "alt", "title", "width", "height", "loading"],
  "*": ["class", "id", "dir", "lang"],
};

/**
 * Sanitizes rich HTML content, stripping dangerous tags, scripts, and attributes
 * while allowing safe educational and typographical formatting tags.
 */
export function sanitizeRichHtml(dirty?: string | null): string {
  if (!dirty || typeof dirty !== "string") {
    return "";
  }

  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_RICH_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}

/**
 * Strips ALL HTML tags, returning strictly pure text.
 * Ideal for titles, summary fields, slugs, and single-line metadata.
 */
export function sanitizePlainText(text?: string | null): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}
