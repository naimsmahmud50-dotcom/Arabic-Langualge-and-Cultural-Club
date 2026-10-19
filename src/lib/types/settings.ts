/**
 * DEVELOPER NOTE:
 * @file src/lib/types/settings.ts
 * @description Pure Types and Default Configurations for Institutional Site Settings (Phase 4).
 * Free from server-only imports, safe for both Client and Server Components.
 * 
 * INSTITUTIONAL CONTEXT:
 * - Institution: Kabi Nazrul Government College, Dhaka
 * - Society: Arabic Language & Cultural Club
 * 
 * Strictly zero AI emojis. Pure institutional typography.
 */

export interface NavMenuItem {
  id: string;
  labelEn: string;
  labelAr: string;
  href: string;
  sortOrder: number;
  isVisible: boolean;
  isExternal?: boolean;
}

export interface SiteSettings {
  // 1. General & Brand Identity
  club_name_en: string;
  club_name_ar: string;
  club_short_name_en: string;
  club_short_name_ar: string;
  college_name_en: string;
  college_name_ar: string;
  club_tagline_en: string;
  club_tagline_ar: string;
  club_motto_en: string;
  club_motto_ar: string;
  founding_year: string;
  logo_crest_url: string;
  logo_full_url: string;

  // 2. Contact Coordinates
  contact_email: string;
  contact_phone: string;
  headquarters_address_en: string;
  headquarters_address_ar: string;
  office_hours_en: string;
  office_hours_ar: string;

  // 3. Social Media
  social_facebook: string;
  social_youtube: string;
  social_twitter: string;
  social_instagram: string;
  social_linkedin: string;

  // 4. SEO & Meta
  meta_description_en: string;
  meta_description_ar: string;
  meta_keywords: string;
  canonical_url: string;
  og_image_url: string;

  // 5. System Defaults
  theme_default: string;
  language_default: string;

  // 6. Navigation
  navigation_menu: NavMenuItem[];
  nav_cta_label_en: string;
  nav_cta_label_ar: string;
  nav_cta_link: string;

  // 7. Homepage Hero Section
  hero_badge_en: string;
  hero_badge_ar: string;
  hero_arabic_heading: string;
  hero_title_en: string;
  hero_title_ar: string;
  hero_subtitle_en: string;
  hero_subtitle_ar: string;
  hero_bg_image_url: string;
  hero_cta_primary_label_en: string;
  hero_cta_primary_label_ar: string;
  hero_cta_primary_link: string;
  hero_cta_secondary_label_en: string;
  hero_cta_secondary_label_ar: string;
  hero_cta_secondary_link: string;
  hero_cta_tertiary_label_en: string;
  hero_cta_tertiary_label_ar: string;
  hero_cta_tertiary_link: string;
  hero_card_title_en: string;
  hero_card_title_ar: string;
  hero_card_quote_ar: string;
  hero_card_desc_en: string;
  hero_card_desc_ar: string;
  hero_card_badge_en: string;
  hero_card_badge_ar: string;

  // 8. Mission & Intro
  mission_badge_en: string;
  mission_badge_ar: string;
  mission_title_en: string;
  mission_title_ar: string;
  mission_subtitle_ar: string;
  mission_desc_en: string;
  mission_desc_ar: string;

  // 9. Footer & Copyright
  footer_about_text_en: string;
  footer_about_text_ar: string;
  footer_motto_en: string;
  footer_motto_ar: string;
  footer_copyright_en: string;
  footer_copyright_ar: string;
}

export const DEFAULT_NAV_ITEMS: NavMenuItem[] = [
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

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  // General & Brand Identity
  club_name_en: "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka",
  club_name_ar: "نادي اللغة والثقافة العربية، كلية كابي نذرول الحكومية، دكا",
  club_short_name_en: "Arabic Language & Cultural Club",
  club_short_name_ar: "نادي اللغة والثقافة العربية",
  college_name_en: "Kabi Nazrul Government College, Dhaka",
  college_name_ar: "كلية كابي نذرول الحكومية، دكا",
  club_tagline_en: "Preserving Heritage, Advancing Eloquence, Cultivating Leadership",
  club_tagline_ar: "صون التراث، وترقية البيان، وبناء القيادات",
  club_motto_en: "Preserving Heritage, Advancing Eloquence, Cultivating Leadership.",
  club_motto_ar: "لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ",
  founding_year: "2022",
  logo_crest_url: "/images/logo/club-crest-transparent.png",
  logo_full_url: "/images/logo/club-logo-full.png",

  // Contact Coordinates
  contact_email: "arabicclubkngc2025@gmail.com",
  contact_phone: "+880 1700-000000",
  headquarters_address_en: "Department of Arabic & Islamic Studies, Kabi Nazrul Government College, Laxmibazar, Dhaka-1100, Bangladesh",
  headquarters_address_ar: "قسم اللغة العربية والدراسات الإسلامية، كلية كابي نذرول الحكومية، لکشمي بازار، دكا-1100، بنغلاديش",
  office_hours_en: "Sunday – Thursday: 10:00 AM – 4:00 PM (Term time)",
  office_hours_ar: "الأحد – الخميس: 10:00 صباحاً – 4:00 مساءً (أوقات الدراسة)",

  // Social Media
  social_facebook: "https://facebook.com/ArabicClubOfficial",
  social_youtube: "https://youtube.com/@ArabicClubOfficial",
  social_twitter: "",
  social_instagram: "",
  social_linkedin: "",

  // SEO & Meta
  meta_description_en: "Preserving classical Arabic heritage and literary arts at Kabi Nazrul Government College.",
  meta_description_ar: "صون تراث اللغة العربية وآدابها في كلية كابي نذرول الحكومية بدكا.",
  meta_keywords: "arabic, kngc, dhaka, linguistics, cultural club",
  canonical_url: "https://kngc-arabic.edu.bd",
  og_image_url: "",

  // System
  theme_default: "system",
  language_default: "en",

  // Navigation
  navigation_menu: DEFAULT_NAV_ITEMS,
  nav_cta_label_en: "Join Club",
  nav_cta_label_ar: "انضم للنادي",
  nav_cta_link: "/membership",

  // Hero Section
  hero_badge_en: "Official Collegiate Society • Kabi Nazrul Govt. College, Dhaka",
  hero_badge_ar: "جمعية جامعية رسمية • كلية كابي نذرول الحكومية، دكا",
  hero_arabic_heading: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ • نَادِي اللُّغَةِ وَالثَّقَافَةِ الْعَرَبِيَّةِ - كُلِّيَّةُ كَابِي نَذْرُول الْحُكُومِيَّة",
  hero_title_en: "Preserving Heritage, Advancing Eloquence, Cultivating Leadership.",
  hero_title_ar: "صون التراث، وترقية البيان، وبناء القيادات.",
  hero_subtitle_en: "An enduring collegiate forum at Kabi Nazrul Government College, Dhaka, dedicated to classical Arabic scholarship, rhetorical mastery, competitive debate, and intellectual fellowship.",
  hero_subtitle_ar: "منبر أكاديمي عريق في كلية كابي نذرول الحكومية بدكا، يُعنى بتعليم الفصحى، وبلاغة الخطاب، والمناظرات العلمية، وروح الإخاء المعرفي.",
  hero_bg_image_url: "",
  hero_cta_primary_label_en: "Apply for Membership",
  hero_cta_primary_label_ar: "تقديم طلب العضوية",
  hero_cta_primary_link: "/membership",
  hero_cta_secondary_label_en: "Explore Our Legacy",
  hero_cta_secondary_label_ar: "استكشف مسيرتنا",
  hero_cta_secondary_link: "/about",
  hero_cta_tertiary_label_en: "12-Month Calendar",
  hero_cta_tertiary_label_ar: "التقويم السنوي",
  hero_cta_tertiary_link: "/events",
  hero_card_title_en: "Lisan Al-Arab Heritage",
  hero_card_title_ar: "تراث لسان العرب",
  hero_card_quote_ar: "«لُغَةُ الضَّادِ حِلْيَةُ الْأَدَبِ»",
  hero_card_desc_en: "Dedicated to students, scholars, and orators honoring the classical language of Islamic civilization and literature.",
  hero_card_desc_ar: "ملتقى الطلاب والباحثين وخطباء الضاد لخدمة لغة الحضارة الإسلامية الخالدة وآدابها الرصينة.",
  hero_card_badge_en: "University Chartered",
  hero_card_badge_ar: "اعتماد جامعي",

  // Mission
  mission_badge_en: "Foundational Mandate",
  mission_badge_ar: "الولاية التأسيسية",
  mission_title_en: "The Purpose & Four Pillars of Our Society",
  mission_title_ar: "غاية النادي وأركانه الأربعة",
  mission_subtitle_ar: "«إِنَّ مِنَ الْبَيَانِ لَسِحْرًا» • أربعة أركان تقوم عليها مسيرتنا في كلية كابي نذرول الحكومية",
  mission_desc_en: "Founded as the premier collegiate society at Kabi Nazrul Government College, Dhaka, the Arabic Language & Cultural Club provides an intellectually rigorous sanctuary for the mastery, celebration, and dissemination of classical Arabic letters.",
  mission_desc_ar: "تأسس النادي ليكون الصرح الطلابي الرائد في كلية كابي نذرول الحكومية بدكا، موفراً بيئة أكاديمية رصينة لتعلم العربية وإتقان بيانها.",

  // Footer
  footer_about_text_en: "An enduring institutional archive and digital platform advancing classical Arabic eloquence, literary scholarship, cultural heritage, and student leadership.",
  footer_about_text_ar: "منصة توثيقية رقمية وأرشيف مؤسسي دائم يرعى الفصاحة العربية، والبحث الأدبي، والتراث العريق، وبناء القيادات الطلابية.",
  footer_motto_en: "«لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ»",
  footer_motto_ar: "«لِسَانُ الْعَرَبِ حِلْيَةُ الْأَدَبِ وَمِفْتَاحُ الْفَهْمِ»",
  footer_copyright_en: "Arabic Language & Cultural Club, Kabi Nazrul Government College, Dhaka. All institutional rights reserved.",
  footer_copyright_ar: "نادي اللغة والثقافة العربية، كلية كابي نذرول الحكومية، دكا. جميع الحقوق محفوظة.",
};
