/**
 * DEVELOPER NOTE:
 * @file scripts/migrate-phase4-site-settings.ts
 * @description Safe, Idempotent Drizzle/SQLite Migration for Phase 4 Site Settings.
 * Seeds all required configuration keys for Navigation, Hero, Branding, Mission, and Footer
 * with sensible defaults identical to the current hardcoded frontend values.
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * Strictly zero AI emojis.
 */

import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "arabic_club.db");

interface SettingSeed {
  key: string;
  valueEn: string;
  valueAr: string;
  category: string;
}

const DEFAULT_NAV_ITEMS = [
  { id: "nav_about", labelEn: "About", labelAr: "عن النادي", href: "/about", sortOrder: 1, isVisible: true },
  { id: "nav_history", labelEn: "History", labelAr: "التاريخ والنشأة", href: "/history", sortOrder: 2, isVisible: true },
  { id: "nav_founders", labelEn: "Founders", labelAr: "المؤسسون", href: "/founders", sortOrder: 3, isVisible: true },
  { id: "nav_leadership", labelEn: "Leadership", labelAr: "الهيئات القيادية", href: "/leadership", sortOrder: 4, isVisible: true },
  { id: "nav_calendar", labelEn: "Calendar", labelAr: "التقويم السنوي", href: "/events", sortOrder: 5, isVisible: true },
  { id: "nav_gallery", labelEn: "Gallery", labelAr: "معرض الصور", href: "/gallery", sortOrder: 6, isVisible: true },
  { id: "nav_resources", labelEn: "Resources", labelAr: "المكتبة اللغوية", href: "/resources", sortOrder: 7, isVisible: true },
  { id: "nav_publications", labelEn: "Publications", labelAr: "المنشورات الأدبية", href: "/publications", sortOrder: 8, isVisible: true },
  { id: "nav_news", labelEn: "News", labelAr: "الأخبار والبلاغات", href: "/news", sortOrder: 9, isVisible: true },
  { id: "nav_contact", labelEn: "Contact", labelAr: "تواصل معنا", href: "/contact", sortOrder: 10, isVisible: true },
];

const SEED_SETTINGS: SettingSeed[] = [
  // 1. General & Brand
  {
    key: "club_name",
    valueEn: "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka",
    valueAr: "نادي اللغة والثقافة العربية، كلية كابي نذرول الحكومية، دكا",
    category: "general",
  },
  {
    key: "club_short_name",
    valueEn: "Arabic Language & Cultural Club",
    valueAr: "نادي اللغة والثقافة العربية",
    category: "general",
  },
  {
    key: "college_name",
    valueEn: "Kabi Nazrul Government College, Dhaka",
    valueAr: "كلية كابي نذرول الحكومية، دكا",
    category: "general",
  },
  {
    key: "club_tagline",
    valueEn: "Preserving Heritage, Advancing Eloquence, Cultivating Leadership",
    valueAr: "صون التراث، وترقية البيان، وبناء القيادات",
    category: "general",
  },
  {
    key: "club_motto",
    valueEn: "Preserving Heritage, Advancing Eloquence, Cultivating Leadership.",
    valueAr: "لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ",
    category: "general",
  },
  {
    key: "founding_year",
    valueEn: "2022",
    valueAr: "٢٠٢٢",
    category: "general",
  },
  {
    key: "logo_crest_url",
    valueEn: "/images/logo/club-crest-transparent.png",
    valueAr: "/images/logo/club-crest-transparent.png",
    category: "branding",
  },
  {
    key: "logo_full_url",
    valueEn: "/images/logo/club-logo-full.png",
    valueAr: "/images/logo/club-logo-full.png",
    category: "branding",
  },

  // 2. Navigation
  {
    key: "navigation_menu",
    valueEn: JSON.stringify(DEFAULT_NAV_ITEMS),
    valueAr: JSON.stringify(DEFAULT_NAV_ITEMS),
    category: "navigation",
  },
  {
    key: "nav_cta_label",
    valueEn: "Join Club",
    valueAr: "انضم للنادي",
    category: "navigation",
  },
  {
    key: "nav_cta_link",
    valueEn: "/membership",
    valueAr: "/membership",
    category: "navigation",
  },

  // 3. Homepage Hero Section
  {
    key: "hero_badge",
    valueEn: "Official Collegiate Society • Kabi Nazrul Govt. College, Dhaka",
    valueAr: "جمعية جامعية رسمية • كلية كابي نذرول الحكومية، دكا",
    category: "hero",
  },
  {
    key: "hero_arabic_heading",
    valueEn: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • نَادِي اللُّغَةِ وَالثَّقَافَةِ الْعَرَبِيَّةِ - كُلِّيَّةُ كَابِي نَذْرُول الْحُكُومِيَّة",
    valueAr: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • نَادِي اللُّغَةِ وَالثَّقَافَةِ الْعَرَبِيَّةِ - كُلِّيَّةُ كَابِي نَذْرُول الْحُكُومِيَّة",
    category: "hero",
  },
  {
    key: "hero_title",
    valueEn: "Preserving Heritage, Advancing Eloquence, Cultivating Leadership.",
    valueAr: "صون التراث، وترقية البيان، وبناء القيادات.",
    category: "hero",
  },
  {
    key: "hero_subtitle",
    valueEn: "An enduring collegiate forum at Kabi Nazrul Government College, Dhaka, dedicated to classical Arabic scholarship, rhetorical mastery, competitive debate, and intellectual fellowship.",
    valueAr: "منبر أكاديمي عريق في كلية كابي نذرول الحكومية بدكا، يُعنى بتعليم الفصحى، وبلاغة الخطاب، والمناظرات العلمية، وروح الإخاء المعرفي.",
    category: "hero",
  },
  {
    key: "hero_cta_primary_label",
    valueEn: "Apply for Membership",
    valueAr: "تقديم طلب العضوية",
    category: "hero",
  },
  {
    key: "hero_cta_primary_link",
    valueEn: "/membership",
    valueAr: "/membership",
    category: "hero",
  },
  {
    key: "hero_cta_secondary_label",
    valueEn: "Explore Our Legacy",
    valueAr: "استكشف مسيرتنا",
    category: "hero",
  },
  {
    key: "hero_cta_secondary_link",
    valueEn: "/about",
    valueAr: "/about",
    category: "hero",
  },
  {
    key: "hero_cta_tertiary_label",
    valueEn: "12-Month Calendar",
    valueAr: "التقويم السنوي",
    category: "hero",
  },
  {
    key: "hero_cta_tertiary_link",
    valueEn: "/events",
    valueAr: "/events",
    category: "hero",
  },
  {
    key: "hero_bg_image_url",
    valueEn: "",
    valueAr: "",
    category: "hero",
  },
  {
    key: "hero_card_title",
    valueEn: "Lisan Al-Arab Heritage",
    valueAr: "تراث لسان العرب",
    category: "hero",
  },
  {
    key: "hero_card_quote",
    valueEn: "«لُغَةُ الضَّادِ حِلْيَةُ الْأَدَبِ»",
    valueAr: "«لُغَةُ الضَّادِ حِلْيَةُ الْأَدَبِ»",
    category: "hero",
  },
  {
    key: "hero_card_desc",
    valueEn: "Dedicated to students, scholars, and orators honoring the classical language of Islamic civilization and literature.",
    valueAr: "ملتقى الطلاب والباحثين وخطباء الضاد لخدمة لغة الحضارة الإسلامية الخالدة وآدابها الرصينة.",
    category: "hero",
  },
  {
    key: "hero_card_badge",
    valueEn: "University Chartered",
    valueAr: "اعتماد جامعي",
    category: "hero",
  },

  // 4. Mission & Introduction
  {
    key: "mission_badge",
    valueEn: "Foundational Mandate",
    valueAr: "الولاية التأسيسية",
    category: "mission",
  },
  {
    key: "mission_title",
    valueEn: "The Purpose & Four Pillars of Our Society",
    valueAr: "غاية النادي وأركانه الأربعة",
    category: "mission",
  },
  {
    key: "mission_subtitle",
    valueEn: "«إِنَّ مِنَ الْبَيَانِ لَسِحْرًا» • أربعة أركان تقوم عليها مسيرتنا في كلية كابي نذرول الحكومية",
    valueAr: "«إِنَّ مِنَ الْبَيَانِ لَسِحْرًا» • أربعة أركان تقوم عليها مسيرتنا في كلية كابي نذرول الحكومية",
    category: "mission",
  },
  {
    key: "mission_desc",
    valueEn: "Founded as the premier collegiate society at Kabi Nazrul Government College, Dhaka, the Arabic Language & Cultural Club provides an intellectually rigorous sanctuary for the mastery, celebration, and dissemination of classical Arabic letters.",
    valueAr: "تأسس النادي ليكون الصرح الطلابي الرائد في كلية كابي نذرول الحكومية بدكا، موفراً بيئة أكاديمية رصينة لتعلم العربية وإتقان بيانها.",
    category: "mission",
  },

  // 5. Footer & Copyright
  {
    key: "footer_about_text",
    valueEn: "An enduring institutional archive and digital platform advancing classical Arabic eloquence, literary scholarship, cultural heritage, and student leadership.",
    valueAr: "منصة توثيقية رقمية وأرشيف مؤسسي دائم يرعى الفصاحة العربية، والبحث الأدبي، والتراث العريق، وبناء القيادات الطلابية.",
    category: "footer",
  },
  {
    key: "footer_motto",
    valueEn: "«لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ»",
    valueAr: "«لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ»",
    category: "footer",
  },
  {
    key: "footer_copyright",
    valueEn: "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka. All institutional rights reserved.",
    valueAr: "نادي اللغة والثقافة العربية، كلية كابي نذرول الحكومية، دكا. جميع الحقوق محفوظة.",
    category: "footer",
  },
];

function runMigration() {
  console.log("--------------------------------------------------");
  console.log("Starting Phase 4 Site Settings Migration");
  console.log(`Database: ${DB_PATH}`);
  console.log("--------------------------------------------------");

  const db = new Database(DB_PATH);
  const now = Date.now();

  let insertedCount = 0;
  let skippedCount = 0;

  try {
    db.exec("BEGIN TRANSACTION;");

    const checkStmt = db.prepare("SELECT id FROM site_settings WHERE key = ?");
    const insertStmt = db.prepare(
      "INSERT INTO site_settings (id, key, value_en, value_ar, category, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
    );

    for (const setting of SEED_SETTINGS) {
      const existing = checkStmt.get(setting.key);
      if (!existing) {
        const id = `set_${setting.key}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
        insertStmt.run(
          id,
          setting.key,
          setting.valueEn,
          setting.valueAr,
          setting.category,
          now
        );
        insertedCount++;
        console.log(`[Inserted] key='${setting.key}' (category='${setting.category}')`);
      } else {
        skippedCount++;
        console.log(`[Already Exists] key='${setting.key}'`);
      }
    }

    db.exec("COMMIT;");
    console.log("--------------------------------------------------");
    console.log(`Migration Complete: ${insertedCount} inserted, ${skippedCount} skipped.`);
    console.log("--------------------------------------------------");
  } catch (err: any) {
    db.exec("ROLLBACK;");
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    db.close();
  }
}

runMigration();
