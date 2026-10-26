import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const VIEWPORTS = [
  { name: "360px", width: 360, height: 740 },
  { name: "390px", width: 390, height: 844 },
  { name: "430px", width: 430, height: 932 },
  { name: "768px", width: 768, height: 1024 },
  { name: "1280px", width: 1280, height: 800 },
];

const PAGES = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "History", path: "/history" },
  { name: "Founders", path: "/founders" },
  { name: "Leadership", path: "/leadership" },
  { name: "Events", path: "/events" },
  { name: "Gallery", path: "/gallery" },
  { name: "Resources", path: "/resources" },
  { name: "Publications", path: "/publications" },
  { name: "News", path: "/news" },
  { name: "Contact", path: "/contact" },
  { name: "Admin_Login", path: "/admin/login" },
];

const BASE_URL = "http://localhost:3005";
const SCREENSHOT_DIR = "/home/mahmud-hasan/.gemini/antigravity/brain/75b55b23-c3b4-406f-a026-11e629c89034/before_screenshots";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  const auditResults: any[] = [];

  for (const pageDef of PAGES) {
    const pageIssues: any = { page: pageDef.name, path: pageDef.path, viewports: {} };

    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      try {
        await page.goto(`${BASE_URL}${pageDef.path}`, { waitUntil: "networkidle", timeout: 15000 });
        
        // Take screenshot
        const screenshotPath = path.join(SCREENSHOT_DIR, `${pageDef.name}_${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        // Evaluate overflow & ergonomics
        const evaluation = await page.evaluate((vpWidth) => {
          const docWidth = document.documentElement.scrollWidth;
          const bodyWidth = document.body.scrollWidth;
          const hasHorizontalOverflow = docWidth > vpWidth || bodyWidth > vpWidth;

          // Find overflowing elements
          const overflowingElements: any[] = [];
          document.querySelectorAll("*").forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > vpWidth + 1) {
              const tag = el.tagName.toLowerCase();
              const className = (typeof el.className === "string" ? el.className : "").slice(0, 80);
              overflowingElements.push({
                tag,
                className,
                right: Math.round(rect.right),
                width: Math.round(rect.width)
              });
            }
          });

          // Check interactive tap targets (a, button)
          const smallTapTargets: any[] = [];
          document.querySelectorAll("button, a, input, select").forEach((el) => {
            const style = window.getComputedStyle(el);
            if (style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0") {
              const rect = el.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
                const text = (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30);
                smallTapTargets.push({
                  tag: el.tagName.toLowerCase(),
                  text,
                  width: Math.round(rect.width),
                  height: Math.round(rect.height),
                  className: (typeof el.className === "string" ? el.className : "").slice(0, 60)
                });
              }
            }
          });

          // Headings font sizes
          const headings: any[] = [];
          document.querySelectorAll("h1, h2, h3").forEach((h) => {
            const style = window.getComputedStyle(h);
            headings.push({
              tag: h.tagName.toLowerCase(),
              fontSize: style.fontSize,
              lineHeight: style.lineHeight,
              text: (h.textContent || "").slice(0, 30)
            });
          });

          return {
            vpWidth,
            docWidth,
            hasHorizontalOverflow,
            overflowCount: overflowingElements.length,
            sampleOverflows: overflowingElements.slice(0, 5),
            smallTapTargetCount: smallTapTargets.length,
            sampleTapTargets: smallTapTargets.slice(0, 5),
            headings: headings.slice(0, 4)
          };
        }, vp.width);

        pageIssues.viewports[vp.name] = evaluation;
      } catch (err: any) {
        pageIssues.viewports[vp.name] = { error: err.message };
      } finally {
        await page.close();
      }
    }
    auditResults.push(pageIssues);
  }

  await browser.close();
  fs.writeFileSync("/home/mahmud-hasan/.gemini/antigravity/brain/75b55b23-c3b4-406f-a026-11e629c89034/scratch/audit_results.json", JSON.stringify(auditResults, null, 2));
  console.log("Audit complete! Results written to audit_results.json");
}

runAudit().catch(console.error);
