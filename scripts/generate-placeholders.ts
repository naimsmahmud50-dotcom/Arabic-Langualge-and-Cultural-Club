/**
 * DEVELOPER NOTE:
 * Script: scripts/generate-placeholders.ts
 * Purpose: Generates high-efficiency WebP placeholder album covers using SVG composite + Sharp.
 * Prevents 404 console errors in Lighthouse audits and production environments.
 * Strictly human vibe; zero AI emojis.
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";

const targetDir = path.join(process.cwd(), "public", "assets", "placeholders");
fs.mkdirSync(targetDir, { recursive: true });

const placeholders = [
  {
    name: "gallery-symposium-cover.webp",
    title: "Arabic Linguistics & Scholarly Symposium",
    titleAr: "الندوة العلمية للغة العربية واللسانيات",
    category: "ACADEMIC",
    bgDark: "#17211D",
    bgAccent: "#173D32",
  },
  {
    name: "gallery-debate-cover.webp",
    title: "National Arabic Debate Championship",
    titleAr: "بطولة المناظرات العربية الوطنية",
    category: "COMPETITION",
    bgDark: "#101815",
    bgAccent: "#1F6B45",
  },
  {
    name: "gallery-calligraphy-cover.webp",
    title: "Masterclass in Classical Thuluth Calligraphy",
    titleAr: "ورشة عمل متقدمة في خط الثلث الكلاسيكي",
    category: "WORKSHOP",
    bgDark: "#17211D",
    bgAccent: "#24352E",
  },
  {
    name: "gallery-codicology-cover.webp",
    title: "Rare Arabic Manuscripts & Codicology",
    titleAr: "معرض المخطوطات العربية النادرة وعلم المخطوطات",
    category: "EXHIBITION",
    bgDark: "#141D19",
    bgAccent: "#1B2A23",
  },
  {
    name: "gallery-gala-cover.webp",
    title: "Annual World Arabic Language Day Gala",
    titleAr: "الاحتفال السنوي باليوم العالمي للغة العربية",
    category: "CULTURAL",
    bgDark: "#17211D",
    bgAccent: "#173D32",
  },
];

async function generate() {
  for (const item of placeholders) {
    const width = 800;
    const height = 450;

    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${item.bgDark}" />
            <stop offset="100%" stop-color="${item.bgAccent}" />
          </linearGradient>
          <pattern id="pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 40 20 L 20 40 L 0 20 Z" fill="none" stroke="#B18A4A" stroke-opacity="0.07" stroke-width="1" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grad)" />
        <rect width="100%" height="100%" fill="url(#pattern)" />

        <!-- Border frame -->
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#B18A4A" stroke-width="1" stroke-opacity="0.25" rx="8" />

        <!-- Category Badge -->
        <rect x="50" y="50" width="120" height="28" rx="4" fill="#B18A4A" fill-opacity="0.2" stroke="#B18A4A" stroke-width="1" stroke-opacity="0.5" />
        <text x="110" y="68" font-family="sans-serif" font-size="11" font-weight="bold" fill="#F5F0E5" text-anchor="middle" letter-spacing="1.5">
          ${item.category}
        </text>

        <!-- Academic Seal Text -->
        <text x="400" y="220" font-family="serif" font-size="28" font-weight="bold" fill="#F5F0E5" text-anchor="middle">
          ${item.title.replace(/&/g, "&amp;")}
        </text>

        <text x="400" y="270" font-family="sans-serif" font-size="20" font-weight="bold" fill="#B18A4A" text-anchor="middle">
          ${item.titleAr.replace(/&/g, "&amp;")}
        </text>

        <text x="400" y="340" font-family="sans-serif" font-size="12" fill="#8E9C92" text-anchor="middle" letter-spacing="1">
          KABI NAZRUL GOVT. COLLEGE • DHAKA
        </text>
      </svg>
    `;

    const outputPath = path.join(targetDir, item.name);
    await sharp(Buffer.from(svg))
      .webp({ quality: 85 })
      .toFile(outputPath);

    console.log(`Generated: ${outputPath}`);
  }
}

generate().catch(console.error);
