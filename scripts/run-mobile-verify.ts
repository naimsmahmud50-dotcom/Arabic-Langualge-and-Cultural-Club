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
const SCREENSHOT_DIR = "/home/mahmud-hasan/.gemini/antigravity/brain/75b55b23-c3b4-406f-a026-11e629c89034/after_screenshots";

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVerify() {
  const browser = await chromium.launch({ headless: true });
  const verifyResults: any[] = [];
  let totalOverflows = 0;

  for (const pageDef of PAGES) {
    const pageIssues: any = { page: pageDef.name, path: pageDef.path, viewports: {} };

    for (const vp of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      try {
        await page.goto(`${BASE_URL}${pageDef.path}`, { waitUntil: "networkidle", timeout: 15000 });
        
        // Take screenshot
        const screenshotPath = path.join(SCREENSHOT_DIR, `${pageDef.name}_${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        // Evaluate overflow
        const evaluation = await page.evaluate((vpWidth) => {
          const docWidth = document.documentElement.scrollWidth;
          const bodyWidth = document.body.scrollWidth;
          const hasHorizontalOverflow = docWidth > vpWidth || bodyWidth > vpWidth;

          // Find overflowing elements
          const overflowingElements: any[] = [];
          document.querySelectorAll("*").forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > vpWidth + 1.5) {
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

          return {
            docWidth,
            bodyWidth,
            hasHorizontalOverflow,
            overflowCount: overflowingElements.length,
            overflowingElements: overflowingElements.slice(0, 5),
          };
        }, vp.width);

        if (evaluation.hasHorizontalOverflow) {
          totalOverflows++;
        }

        pageIssues.viewports[vp.name] = evaluation;
        console.log(`[VERIFY] ${pageDef.name} @ ${vp.name}: overflow=${evaluation.hasHorizontalOverflow} (docWidth: ${evaluation.docWidth}px, bodyWidth: ${evaluation.bodyWidth}px)`);
      } catch (err: any) {
        console.error(`Error verifying ${pageDef.name} @ ${vp.name}:`, err.message);
        pageIssues.viewports[vp.name] = { error: err.message };
      } finally {
        await page.close();
      }
    }
    verifyResults.push(pageIssues);
  }

  await browser.close();

  const reportPath = "/home/mahmud-hasan/.gemini/antigravity/brain/75b55b23-c3b4-406f-a026-11e629c89034/mobile_verify_results.json";
  fs.writeFileSync(reportPath, JSON.stringify(verifyResults, null, 2));
  console.log(`Verification complete! Total horizontal overflows: ${totalOverflows}. Results saved to ${reportPath}`);
}

runVerify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
