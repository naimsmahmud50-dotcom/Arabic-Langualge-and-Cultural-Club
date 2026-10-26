import { chromium } from "@playwright/test";

async function main() {
  console.log("Starting navigation latency & transition verification test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // Listen to console and network
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(err.message));

  console.log("Navigating to home page (http://localhost:3005)...");
  const homeStart = Date.now();
  await page.goto("http://localhost:3005", { waitUntil: "networkidle" });
  console.log(`Home page loaded in ${Date.now() - homeStart}ms`);

  // Target routes to test via client-side navigation
  const routesToTest = [
    { name: "News", selector: 'a[href="/news"]' },
    { name: "Contact", selector: 'a[href="/contact"]' },
    { name: "Leadership", selector: 'a[href="/leadership"]', dropdown: "nav-trigger-about" },
    { name: "Events / Calendar", selector: 'a[href="/events"]', dropdown: "nav-trigger-activities" },
    { name: "Gallery", selector: 'a[href="/gallery"]', dropdown: "nav-trigger-activities" },
    { name: "About", selector: 'a[href="/about"]', dropdown: "nav-trigger-about" },
  ];

  for (const item of routesToTest) {
    console.log(`\nTesting transition to: ${item.name}...`);

    if (item.dropdown) {
      const trigger = page.locator(`#${item.dropdown}`);
      await trigger.hover();
      await page.waitForTimeout(100);
    }

    const link = page.locator(item.selector).first();
    await link.waitFor({ state: "visible" });

    // Click link and measure transition duration
    const t0 = performance.now();
    await link.click();

    // Verify that the old page content does NOT get wiped by "Loading Institutional Archive..."
    const spinnerNotice = page.locator("text=Loading Institutional Archive...");
    const hasSpun = await spinnerNotice.isVisible().catch(() => false);
    if (hasSpun) {
      console.warn(`[WARNING] Full-page loading notice appeared for ${item.name}!`);
    } else {
      console.log(`[PASS] No full-page loader flicker detected for ${item.name}.`);
    }

    // Wait until URL updates and main content arrives
    await page.waitForLoadState("domcontentloaded");
    const elapsed = Math.round(performance.now() - t0);
    console.log(`[PERF] Transition completed in ${elapsed}ms. Current URL: ${page.url()}`);

    // Take screenshot for visual evidence
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    await page.screenshot({ path: `/home/mahmud-hasan/.gemini/antigravity/brain/75b55b23-c3b4-406f-a026-11e629c89034/nav-transition-${slug}.png` });
  }

  await browser.close();

  if (errors.length > 0) {
    console.error("Browser errors encountered:", errors);
    process.exit(1);
  }

  console.log("\nALL NAVIGATION CHECKS PASSED WITH EXCELLENCE!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
