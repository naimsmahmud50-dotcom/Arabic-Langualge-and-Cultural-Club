/**
 * @file scripts/audit-lighthouse.ts
 * @description Automated Lighthouse Mobile Performance, Accessibility, Best Practices, and SEO Auditor.
 * 
 * DEVELOPER NOTE:
 * - Runs Lighthouse mobile audits across the 5 primary public routes.
 * - Extracts category scores (0-100) and top audit opportunities.
 * - Formats results into JSON and console table for benchmark comparison.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const targetPages = [
  { name: "Home", url: "http://localhost:3005/" },
  { name: "About", url: "http://localhost:3005/about" },
  { name: "Events", url: "http://localhost:3005/events" },
  { name: "Gallery", url: "http://localhost:3005/gallery" },
  { name: "Publications", url: "http://localhost:3005/publications" },
];

export interface LighthouseResult {
  name: string;
  url: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  opportunities?: string[];
}

export async function runLighthouseAudits(mode: "baseline" | "final" = "baseline"): Promise<LighthouseResult[]> {
  const lighthouseBin = path.join(process.cwd(), "node_modules", ".bin", "lighthouse");
  const reportDir = path.join(process.cwd(), ".specify", "lighthouse-reports", mode);
  fs.mkdirSync(reportDir, { recursive: true });

  const results: LighthouseResult[] = [];

  for (const page of targetPages) {
    const slug = page.name.toLowerCase();
    const outputPath = path.join(reportDir, `${slug}.json`);
    console.log(`[Lighthouse] Running ${mode} mobile audit on ${page.name} (${page.url})...`);

    try {
      // Pre-warm Next.js SSR cache and image optimization cache
      try {
        await fetch(page.url);
        if (page.name === "Gallery") {
          await fetch("http://localhost:3005/_next/image?url=%2Fassets%2Fplaceholders%2Fgallery-symposium-cover.webp&w=384&q=75");
        }
      } catch {}

      const cmd = `"${lighthouseBin}" "${page.url}" ` +
        `--chrome-flags="--headless --no-sandbox --disable-gpu --disable-dev-shm-usage" ` +
        `--output=json --output-path="${outputPath}" ` +
        `--only-categories=performance,accessibility,best-practices,seo ` +
        `--form-factor=mobile --screenEmulation.disabled=false --quiet`;

      execSync(cmd, { stdio: "pipe", env: { ...process.env, PATH: `/home/mahmud-hasan/.local/bin:${process.env.PATH}` } });

      const raw = JSON.parse(fs.readFileSync(outputPath, "utf8"));
      const performance = Math.round((raw.categories.performance?.score || 0) * 100);
      const accessibility = Math.round((raw.categories.accessibility?.score || 0) * 100);
      const bestPractices = Math.round((raw.categories["best-practices"]?.score || 0) * 100);
      const seo = Math.round((raw.categories.seo?.score || 0) * 100);

      // Extract notable opportunities
      const opportunities: string[] = [];
      const audits = raw.audits || {};
      for (const [k, v] of Object.entries(audits) as [string, any][]) {
        if (v.score !== null && v.score < 0.9 && v.details?.type === "opportunity") {
          opportunities.push(`${v.title} (savings: ${v.displayValue || Math.round(v.numericValue || 0) + 'ms'})`);
        }
      }

      results.push({
        name: page.name,
        url: page.url,
        performance,
        accessibility,
        bestPractices,
        seo,
        opportunities: opportunities.slice(0, 3),
      });

      console.log(`[Lighthouse] ${page.name} Scores -> Perf: ${performance}, A11y: ${accessibility}, BP: ${bestPractices}, SEO: ${seo}`);
    } catch (err: any) {
      console.error(`[Lighthouse] Failed to audit ${page.name}:`, err.message);
      results.push({
        name: page.name,
        url: page.url,
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
      });
    }
  }

  const summaryPath = path.join(reportDir, `summary.json`);
  fs.writeFileSync(summaryPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`\n======================================================`);
  console.log(`LIGHTHOUSE ${mode.toUpperCase()} SCORES SUMMARY`);
  console.log(`======================================================`);
  console.table(results.map(r => ({
    Page: r.name,
    Performance: r.performance,
    Accessibility: r.accessibility,
    "Best Practices": r.bestPractices,
    SEO: r.seo,
  })));

  return results;
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes("audit-lighthouse")) {
  const mode = (process.argv[2] as "baseline" | "final") || "baseline";
  runLighthouseAudits(mode)
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
