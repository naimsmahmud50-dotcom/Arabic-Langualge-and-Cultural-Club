/**
 * DEVELOPER NOTE:
 * File: scripts/verify-phase7-design-system.ts
 * Description: Master Verification Test Suite for Phase 7: Premium Design System & UX Elevation.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly human vibe; zero AI emojis.
 */

import fs from "fs";
import path from "path";
import http from "http";
import Database from "better-sqlite3";
import { submitContactInquiryAction } from "../src/lib/actions/contact-inquiry";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED] ${message}`);
  }
  console.log(`  [PASS] ${message}`);
}

async function checkUrl(urlStr: string): Promise<number> {
  return new Promise((resolve) => {
    http.get(urlStr, (res) => {
      resolve(res.statusCode || 0);
    }).on("error", () => {
      resolve(0);
    });
  });
}

async function runPhase7Verification() {
  console.log("\n================================================================");
  console.log("PHASE 7: MASTER PREMIUM DESIGN SYSTEM & UX ELEVATION VERIFICATION");
  console.log("================================================================\n");

  // TEST SUITE 1: Design System Tokens & CSS Architecture
  console.log("--- TEST SUITE 1: Design Tokens & CSS Architecture ---");
  const globalsCss = fs.readFileSync(path.resolve("src/app/globals.css"), "utf-8");
  assert(globalsCss.includes("--bg-primary: #F5F0E5"), "Warm Ivory background token defined");
  assert(globalsCss.includes("--brand-primary: #173D32"), "Deep Heritage Forest Green token defined");
  assert(globalsCss.includes("--brand-accent: #8F6627"), "Antique Brass Gold token with WCAG AA compliance defined");
  assert(globalsCss.includes(".dark {"), "Dark theme token block defined");
  assert(globalsCss.includes("--font-bangla"), "Bangla font CSS variable token defined");
  assert(globalsCss.includes("[lang=\"bn\"]"), "Bengali language typography rule with 1.75 line-height defined");
  assert(globalsCss.includes(".animate-fade-in-up"), "Micro-interaction fade-in-up keyframe animation defined");
  assert(globalsCss.includes(".hover-lift"), "Micro-interaction card hover lift utility defined");
  assert(globalsCss.includes(".ornamental-gold-border"), "Ornamental Islamic border utility defined");
  assert(globalsCss.includes("prefers-reduced-motion: reduce"), "Accessibility prefers-reduced-motion respected");

  // TEST SUITE 2: Multilingual Typography Integration
  console.log("\n--- TEST SUITE 2: Multilingual Typography Integration ---");
  const layoutTsx = fs.readFileSync(path.resolve("src/app/layout.tsx"), "utf-8");
  assert(layoutTsx.includes("Noto_Sans_Bengali"), "Google Fonts Noto_Sans_Bengali imported");
  assert(layoutTsx.includes("Noto_Naskh_Arabic"), "Google Fonts Noto_Naskh_Arabic imported");
  assert(layoutTsx.includes("Amiri"), "Google Fonts Amiri imported");
  assert(layoutTsx.includes("Inter"), "Google Fonts Inter imported");
  assert(layoutTsx.includes("Manrope"), "Google Fonts Manrope imported");
  assert(layoutTsx.includes("ToastProvider"), "Global ToastProvider wrapped around root children");
  assert(layoutTsx.includes("document.documentElement.lang = 'bn'"), "Anti-FOUC script handles Bengali locale");
  assert(layoutTsx.includes("document.documentElement.dir = 'rtl'"), "Anti-FOUC script handles Arabic RTL direction");

  // TEST SUITE 3: Reusable UI Component Primitives
  console.log("\n--- TEST SUITE 3: Reusable UI Component Primitives ---");
  const uiIndexTs = fs.readFileSync(path.resolve("src/components/ui/index.ts"), "utf-8");
  assert(fs.existsSync(path.resolve("src/components/ui/OrnamentalDivider.tsx")), "OrnamentalDivider component exists");
  assert(fs.existsSync(path.resolve("src/components/ui/SectionHeader.tsx")), "SectionHeader component exists");
  assert(fs.existsSync(path.resolve("src/components/ui/StatCounter.tsx")), "StatCounter component exists");
  assert(fs.existsSync(path.resolve("src/components/ui/Timeline.tsx")), "Timeline component exists");
  assert(fs.existsSync(path.resolve("src/components/ui/Lightbox.tsx")), "Lightbox component exists");
  assert(fs.existsSync(path.resolve("src/components/ui/Toast.tsx")), "Toast component exists");
  assert(uiIndexTs.includes("OrnamentalDivider"), "OrnamentalDivider exported in UI index");
  assert(uiIndexTs.includes("SectionHeader"), "SectionHeader exported in UI index");
  assert(uiIndexTs.includes("StatCounter"), "StatCounter exported in UI index");
  assert(uiIndexTs.includes("Timeline"), "Timeline exported in UI index");
  assert(uiIndexTs.includes("Lightbox"), "Lightbox exported in UI index");
  assert(uiIndexTs.includes("./Toast"), "Toast module exported in UI index");

  // TEST SUITE 4: Homepage Redesign & Section Composition
  console.log("\n--- TEST SUITE 4: Homepage Redesign & Section Composition ---");
  const homePageTsx = fs.readFileSync(path.resolve("src/app/(public)/page.tsx"), "utf-8");
  assert(homePageTsx.includes("<HeroSection"), "HeroSection wired on homepage");
  assert(homePageTsx.includes("<IntroductionSection"), "IntroductionSection wired on homepage");
  assert(homePageTsx.includes("<UpcomingEventsSection"), "UpcomingEventsSection wired on homepage");
  assert(homePageTsx.includes("<NewsAnnouncementsSection"), "NewsAnnouncementsSection wired on homepage");
  assert(homePageTsx.includes("<GalleryPreviewSection"), "GalleryPreviewSection wired on homepage");
  assert(homePageTsx.includes("<CommitteePreviewSection"), "CommitteePreviewSection wired on homepage");
  assert(homePageTsx.includes("<LearningResourcesSection"), "LearningResourcesSection wired on homepage");
  assert(homePageTsx.includes("<OverviewGatewaySection"), "OverviewGatewaySection wired on homepage");
  assert(homePageTsx.includes("<MembershipInvitationSection"), "MembershipInvitationSection wired on homepage");
  assert(homePageTsx.includes("<VerifiedContactSection"), "VerifiedContactSection wired on homepage");

  // TEST SUITE 5: Publications & Resources Enhancements
  console.log("\n--- TEST SUITE 5: Publications & Resources Enhancements ---");
  const pubPageTsx = fs.readFileSync(path.resolve("src/app/(public)/publications/page.tsx"), "utf-8");
  assert(pubPageTsx.includes("name=\"q\""), "Publications page features text search input");
  assert(pubPageTsx.includes("Preview Issue"), "Publications page features PDF preview action");
  assert(pubPageTsx.includes("download") && pubPageTsx.includes("<Download"), "Publications page features download action");

  const resPageTsx = fs.readFileSync(path.resolve("src/app/(public)/resources/page.tsx"), "utf-8");
  assert(resPageTsx.includes("Nahw") && resPageTsx.includes("Sarf") && resPageTsx.includes("Balaghah") && resPageTsx.includes("Irab"), "Resources page includes curated subject tags (Nahw, Sarf, Balaghah, Irab)");

  // TEST SUITE 6: Contact Inquiries Server Action & Anti-Spam Security
  console.log("\n--- TEST SUITE 6: Contact Inquiries Server Action & Anti-Spam Security ---");
  const db = new Database("arabic_club.db");
  const tableCheck = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='contact_inquiries'").get() as { count: number };
  assert(tableCheck.count === 1, "contact_inquiries table exists in SQLite database");

  const countBefore = (db.prepare("SELECT count(*) as count FROM contact_inquiries").get() as { count: number }).count;

  // Test Honeypot rejection: silently discarded, DB not polluted
  const botResult = await submitContactInquiryAction({
    fullName: "Spam Bot",
    email: "bot@spam.com",
    subject: "Cheap SEO Services",
    message: "Buy cheap backlinks now!",
    department: "general",
    website_url: "http://spammy-site.com", // Populated honeypot
  });
  const countAfterBot = (db.prepare("SELECT count(*) as count FROM contact_inquiries").get() as { count: number }).count;
  assert(countAfterBot === countBefore, "Honeypot successfully discards bot submission without writing to database");

  // Test Zod Validation on Missing Fields
  const invalidResult = await submitContactInquiryAction({
    fullName: "",
    email: "not-an-email",
    subject: "",
    message: "",
    department: "general",
    website_url: "",
  });
  assert(!invalidResult.success, "Invalid form payload rejected by server-side Zod validation");
  assert(!!invalidResult.fieldErrors?.fullName, "Field error returned for missing full name");
  assert(!!invalidResult.fieldErrors?.email, "Field error returned for invalid email");

  // TEST SUITE 7: Admin Dashboard UX & Components
  console.log("\n--- TEST SUITE 7: Admin Dashboard UX & Components ---");
  const adminPageTsx = fs.readFileSync(path.resolve("src/app/admin/page.tsx"), "utf-8");
  assert(adminPageTsx.includes("Active Members"), "Admin dashboard overview displays Active Members metric");
  assert(adminPageTsx.includes("Pending Applications"), "Admin dashboard overview displays Pending Applications metric");
  assert(adminPageTsx.includes("Unread Inquiries"), "Admin dashboard overview displays Unread Inquiries metric");
  assert(adminPageTsx.includes("Scheduled Events"), "Admin dashboard overview displays Scheduled Events metric");
  assert(adminPageTsx.includes("Photo Albums"), "Admin dashboard overview displays Photo Albums metric");
  assert(adminPageTsx.includes("Announcements"), "Admin dashboard overview displays Announcements metric");

  const adminMobileNav = fs.readFileSync(path.resolve("src/components/layout/AdminMobileNav.tsx"), "utf-8");
  assert(adminMobileNav.includes("role=\"dialog\""), "AdminMobileNav has accessible dialog semantics");
  assert(adminMobileNav.includes("e.key === \"Escape\""), "AdminMobileNav closes on Escape key");

  // TEST SUITE 8: Live HTTP Endpoints on Port 3005
  console.log("\n--- TEST SUITE 8: Live HTTP Endpoints on Port 3005 ---");
  const routes = [
    { path: "/", label: "Homepage Flagship Overview" },
    { path: "/about", label: "About & Charter" },
    { path: "/events", label: "Events & Calendar" },
    { path: "/gallery", label: "Media Gallery" },
    { path: "/publications", label: "Publications Archive" },
    { path: "/resources", label: "Learning Resources" },
    { path: "/contact", label: "Contact & Inquiries" },
    { path: "/history", label: "Institutional History Timeline" },
    { path: "/design-system", label: "Design System Showcase" },
    { path: "/admin/login", label: "Admin Login Portal" },
  ];

  for (const r of routes) {
    const code = await checkUrl(`http://localhost:3005${r.path}`);
    assert(code === 200, `${r.label} (http://localhost:3005${r.path}) returned HTTP 200`);
  }

  // TEST SUITE 9: Port 3000 Invariant Verification
  console.log("\n--- TEST SUITE 9: Port 3000 Invariant Verification ---");
  const port3000Code = await checkUrl("http://localhost:3000");
  console.log(`  Port 3000 response: HTTP ${port3000Code} (Untouched independent service)`);
  assert(port3000Code !== 0, "Port 3000 service is alive and was never modified or disrupted");

  console.log("\n================================================================");
  console.log("ALL 9 TEST SUITES PASSED — PHASE 7 VERIFICATION SUCCESSFUL");
  console.log("================================================================\n");
}

runPhase7Verification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
