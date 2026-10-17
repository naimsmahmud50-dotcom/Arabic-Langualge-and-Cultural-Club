import { db } from "./index";
import {
  siteSettings,
  users,
  members,
  founders,
  committeeTerms,
  committeePositions,
  committeeAssignments,
  events,
  annualPlans,
  announcements,
  galleryAlbums,
  mediaAssets,
  learningResources,
  achievements,
  publications,
  editablePages,
  pageSections,
  auditLogs,
} from "./schema";

export async function seedDatabase() {
  console.log("Seeding database with clearly tagged [DEMO FIXTURES]...");

  const now = new Date();

  // 1. Site Settings
  await db.insert(siteSettings).values([
    {
      id: "set_title",
      key: "club_name",
      valueEn: "Arabic Language & Cultural Club",
      valueAr: "نادي اللغة والثقافة العربية",
      category: "general",
      updatedAt: now,
    },
    {
      id: "set_tagline",
      key: "club_tagline",
      valueEn: "Preserving Heritage, Advancing Eloquence, Cultivating Leadership",
      valueAr: "صون التراث، وترقية البيان، وبناء القيادات",
      category: "general",
      updatedAt: now,
    },
    {
      id: "set_contact_email",
      key: "contact_email",
      valueEn: "contact@arabicclub.internal",
      valueAr: "contact@arabicclub.internal",
      category: "contact",
      updatedAt: now,
    },
    {
      id: "set_theme_default",
      key: "theme_default",
      valueEn: "system",
      valueAr: "system",
      category: "theme",
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // 2. Core Positions
  await db.insert(committeePositions).values([
    { id: "pos_pres", titleEn: "President", titleAr: "الرئيس", defaultRank: 1, category: "executive", createdAt: now },
    { id: "pos_vp", titleEn: "Vice President", titleAr: "نائب الرئيس", defaultRank: 2, category: "executive", createdAt: now },
    { id: "pos_sec", titleEn: "General Secretary", titleAr: "الأمين العام", defaultRank: 3, category: "executive", createdAt: now },
    { id: "pos_cult", titleEn: "Cultural Secretary", titleAr: "أمين الشؤون الثقافية", defaultRank: 4, category: "executive", createdAt: now },
    { id: "pos_media", titleEn: "Media & Publication Secretary", titleAr: "أمين الإعلام والنشر", defaultRank: 5, category: "executive", createdAt: now },
    { id: "pos_adv", titleEn: "Faculty Adviser", titleAr: "المشرف الأكاديمي", defaultRank: 10, category: "advisor", createdAt: now },
  ]).onConflictDoNothing();

  // 3. Test Users (with hashed passwords for development: "password123")
  const defaultPwHash = "$2b$10$epRswT.wE2aFbOx3gkHQGuMyG5vG1PzP.sEaKx9BfG4G.0G0JgW1G"; // bcrypt placeholder
  await db.insert(users).values([
    {
      id: "usr_superadmin",
      email: "admin@arabicclub.org",
      passwordHash: defaultPwHash,
      fullName: "Lead Systems Administrator [DEMO]",
      role: "super_admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_president",
      email: "president@arabicclub.org",
      passwordHash: defaultPwHash,
      fullName: "Executive President [DEMO]",
      role: "president",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_media",
      email: "media@arabicclub.org",
      passwordHash: defaultPwHash,
      fullName: "Media Director [DEMO]",
      role: "media_manager",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // 4. Founders [DEMO FIXTURES - PENDING OFFICIAL RECORDS]
  await db.insert(founders).values([
    {
      id: "fnd_01",
      nameEn: "Founder Member Alpha [DEMO FIXTURE]",
      nameAr: "العضو المؤسس الأول [نموذج تجريبي]",
      roleTitleEn: "Chief Founding Convener",
      roleTitleAr: "المنسق المؤسس العام",
      bioEn: "Dedicated scholar of classical Arabic rhetoric and institutional founder.",
      bioAr: "باحث متخصص في البلاغة العربية الكلاسيكية والمؤسس المعتمد للنادي.",
      foundingYear: 2022,
      sortOrder: 1,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "fnd_02",
      nameEn: "Founder Member Beta [DEMO FIXTURE]",
      nameAr: "العضو المؤسس الثاني [نموذج تجريبي]",
      roleTitleEn: "Co-Founder & Academic Patron",
      roleTitleAr: "المؤسس المشارك والمستشار الأكاديمي",
      bioEn: "Pioneered the student Arabic debate society and manuscript study circle.",
      bioAr: "رائد تأسيس جمعية المناظرات العربية وحلقة دراسة المخطوطات الطلابية.",
      foundingYear: 2022,
      sortOrder: 2,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // 5. Committee Terms (Demonstrating Historical Preservation)
  await db.insert(committeeTerms).values([
    {
      id: "term_2022_2023",
      academicYear: "2022–2023",
      titleEn: "Founding Executive Committee (2022–2023)",
      titleAr: "اللجنة التنفيذية التأسيسية (٢٠٢٢–٢٠٢٣)",
      startDate: "2022-09-01",
      endDate: "2023-08-31",
      isCurrent: false, // HISTORICAL
      summaryEn: "Inaugural term establishing club charter and first language workshops.",
      summaryAr: "الفترة التأسيسية التي شهدت وضع ميثاق النادي وإطلاق أولى ورش العمل.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "term_2023_2024",
      academicYear: "2023–2024",
      titleEn: "Second Executive Committee (2023–2024)",
      titleAr: "اللجنة التنفيذية الثانية (٢٠٢٣–٢٠٢٤)",
      startDate: "2023-09-01",
      endDate: "2024-08-31",
      isCurrent: false, // HISTORICAL
      summaryEn: "Expansion term inaugurating the annual national Arabic speech competition.",
      summaryAr: "فترة التوسع التي شهدت إطلاق المسابقة السنوية للخطابة العربية.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "term_2024_2025",
      academicYear: "2024–2025",
      titleEn: "Current Executive Council (2024–2025)",
      titleAr: "المجلس التنفيذي الحالي (٢٠٢٤–٢٠٢٥)",
      startDate: "2024-09-01",
      endDate: "2025-08-31",
      isCurrent: true, // ACTIVE CURRENT
      summaryEn: "Present governing administration overseeing modern digital platform & academic circles.",
      summaryAr: "الإدارة الحالية المشرفة على المنصة الرقمية وحلقات البحث الأكاديمي.",
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // 6. Members & Committee Assignments
  await db.insert(members).values([
    {
      id: "mem_01",
      membershipId: "ALC-2022-001",
      fullNameEn: "Zaid Al-Mahmoud [DEMO FIXTURE]",
      fullNameAr: "زيد المحمود [نموذج تجريبي]",
      email: "zaid.al@demo.internal", // PRIVATE
      phone: "+8801700000001",         // PRIVATE
      studentId: "STU-2022-019",       // PRIVATE
      status: "active",
      isPublic: true,
      bioEn: "Specialist in classical Arabic prose and debate moderation.",
      bioAr: "متخصص في النثر العربي الكلاسيكي وإدارة المناظرات.",
      joinedAt: new Date("2022-09-10"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mem_02",
      membershipId: "ALC-2023-042",
      fullNameEn: "Fatima Al-Zahra [DEMO FIXTURE]",
      fullNameAr: "فاطمة الزهراء [نموذج تجريبي]",
      email: "fatima.z@demo.internal",
      phone: "+8801700000002",
      studentId: "STU-2023-112",
      status: "active",
      isPublic: true,
      bioEn: "Researcher in Arabic calligraphy arts and cultural diplomacy.",
      bioAr: "باحثة في فنون الخط العربي والدبلوماسية الثقافية.",
      joinedAt: new Date("2023-09-15"),
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // Assign members to terms (demonstrating preservation across multiple terms)
  await db.insert(committeeAssignments).values([
    {
      id: "asg_hist_01",
      termId: "term_2023_2024",
      memberId: "mem_01",
      positionTitleEn: "Cultural Secretary (Past)",
      positionTitleAr: "أمين الشؤون الثقافية السابق",
      rankOrder: 4,
      createdAt: now,
    },
    {
      id: "asg_curr_01",
      termId: "term_2024_2025",
      memberId: "mem_01",
      positionTitleEn: "President",
      positionTitleAr: "الرئيس",
      rankOrder: 1,
      createdAt: now,
    },
    {
      id: "asg_curr_02",
      termId: "term_2024_2025",
      memberId: "mem_02",
      positionTitleEn: "Vice President",
      positionTitleAr: "نائبة الرئيس",
      rankOrder: 2,
      createdAt: now,
    },
  ]).onConflictDoNothing();

  // 7. Events [DEMO FIXTURES]
  const eventDate1 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days ahead
  const eventDate2 = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000); // 21 days ahead
  await db.insert(events).values([
    {
      id: "evt_01",
      slug: "arabic-calligraphy-masterclass-2026",
      titleEn: "Classical Arabic Calligraphy Masterclass [DEMO]",
      titleAr: "دورة الخط العربي الكلاسيكي المتقدمة [نموذج تجريبي]",
      summaryEn: "Hands-on intensive workshop exploring Thuluth and Diwani scripts with master calligraphers.",
      summaryAr: "ورشة عمل تدريبية مكثفة تستكشف خطي الثلث والديواني مع كبار الخطاطين.",
      category: "workshop",
      startTime: eventDate1,
      endTime: new Date(eventDate1.getTime() + 4 * 3600 * 1000),
      venue: "Main University Auditorium & Cultural Center",
      capacity: 60,
      status: "confirmed",
      isRegistrationOpen: true,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "evt_02",
      slug: "annual-arabic-oratory-competition-2026",
      titleEn: "Annual Arabic Oratory & Eloquence Competition [DEMO]",
      titleAr: "المسابقة السنوية للخطابة والفصاحة العربية [نموذج تجريبي]",
      summaryEn: "Prestigious university-wide public speaking competition judged on eloquence, grammar, and delivery.",
      summaryAr: "مسابقة الخطابة العامة المرموقة لتقييم الفصاحة، وسلامة اللغة، وحسن الإلقاء.",
      category: "competition",
      startTime: eventDate2,
      endTime: new Date(eventDate2.getTime() + 6 * 3600 * 1000),
      venue: "Grand Academic Hall",
      capacity: 120,
      status: "confirmed",
      isRegistrationOpen: true,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // 8. 12-Month Annual Plan Framework
  await db.insert(annualPlans).values([
    { id: "ap_01", academicYear: "2024–2025", monthNumber: 1, activityTitleEn: "Orientation & Arabic Language Fundamentals", activityTitleAr: "اللقاء التعريفي وأساسيات اللغة العربية", category: "workshop", status: "completed", createdAt: now, updatedAt: now },
    { id: "ap_02", academicYear: "2024–2025", monthNumber: 2, activityTitleEn: "Grammar & Morphology Immersion Circle", activityTitleAr: "حلقة استيعاب النحو والصرف", category: "academic", status: "completed", createdAt: now, updatedAt: now },
    { id: "ap_03", academicYear: "2024–2025", monthNumber: 3, activityTitleEn: "Classical Poetry Recitation Evening", activityTitleAr: "أمسية إنشاد وإلقاء الشعر العربي الكلاسيكي", category: "cultural", status: "completed", createdAt: now, updatedAt: now },
    { id: "ap_04", academicYear: "2024–2025", monthNumber: 4, activityTitleEn: "Arabic Calligraphy & Illuminations Camp", activityTitleAr: "معسكر الخط العربي والزخرفة الإسلامية", category: "workshop", status: "confirmed", createdAt: now, updatedAt: now },
    { id: "ap_05", academicYear: "2024–2025", monthNumber: 5, activityTitleEn: "Inter-University Arabic Debate Challenge", activityTitleAr: "مناظرات الجامعات باللغة العربية الفصحى", category: "competition", status: "planned", createdAt: now, updatedAt: now },
    { id: "ap_06", academicYear: "2024–2025", monthNumber: 6, activityTitleEn: "Mid-Year Symposium: Arabic in the Digital Era", activityTitleAr: "ندوة منتصف العام: اللغة العربية في العصر الرقمي", category: "seminar", status: "planned", createdAt: now, updatedAt: now },
  ]).onConflictDoNothing();

  // 9. Gallery Albums & Media
  await db.insert(galleryAlbums).values([
    {
      id: "alb_01",
      slug: "cultural-heritage-exhibition-2024",
      titleEn: "Arabic Heritage & Calligraphy Exhibition [DEMO]",
      titleAr: "معرض التراث والخط العربي السنوي [نموذج تجريبي]",
      descriptionEn: "Photographic highlights from our annual cultural display and community showcase.",
      descriptionAr: "لقطات فوتوغرافية من معرضنا الثقافي السنوي والفعاليات المجتمعية المصاحبة.",
      academicYear: "2024–2025",
      isFeatured: true,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  await db.insert(mediaAssets).values([
    {
      id: "med_01",
      albumId: "alb_01",
      fileUrl: "/assets/placeholders/calligraphy-exhibition-1.webp",
      captionEn: "Exhibition hall showcasing calligraphy masterpieces.",
      captionAr: "قاعة المعرض مستعرضة لوحات الخط العربي البديعة.",
      credit: "Club Media Archive",
      sortOrder: 1,
      isPublished: true,
      createdAt: now,
    },
  ]).onConflictDoNothing();

  // 10. Learning Resources [DEMO]
  await db.insert(learningResources).values([
    {
      id: "res_01",
      slug: "comprehensive-nahw-cheat-sheet",
      titleEn: "Foundations of Arabic Syntax (Nahw) [DEMO]",
      titleAr: "أصول النحو العربي للمبتدئين [نموذج تجريبي]",
      category: "grammar",
      skillLevel: "beginner",
      contentEn: "Structured guide covering I'rab, noun states, and sentence components.",
      contentAr: "دليل منهجي متكامل يغطي علامات الإعراب، وحالات الأسماء، وبناء الجملة العربية.",
      fileUrl: "/assets/placeholders/nahw-foundations.pdf",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // 11. Announcements [DEMO]
  await db.insert(announcements).values([
    {
      id: "ann_01",
      slug: "official-launch-of-arabic-club-digital-platform",
      titleEn: "Inauguration of the Arabic Club Digital Platform [DEMO]",
      titleAr: "تدشين المنصة الرقمية الرسمية لنادي اللغة العربية [نموذج تجريبي]",
      contentEn: "We are honoured to introduce the official digital archive and institutional platform for the Arabic Language & Cultural Club.",
      contentAr: "يسرنا الإعلان عن إطلاق المنصة الرقمية والأرشيف المؤسسي الرسمي لنادي اللغة والثقافة العربية.",
      category: "news",
      isPinned: true,
      isPublished: true,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // 12. Audit Log Record
  await db.insert(auditLogs).values([
    {
      id: "aud_01",
      userId: "usr_superadmin",
      userEmail: "admin@arabicclub.org",
      action: "seed_database",
      targetEntity: "system",
      targetId: "arabic_club.db",
      detailsJson: JSON.stringify({ message: "Initialized database with foundational demo fixtures." }),
      createdAt: now,
    },
  ]).onConflictDoNothing();

  console.log("Database seeded successfully with verified [DEMO FIXTURES].");
}

seedDatabase()
  .then(() => {
    console.log("Seeding process completed successfully.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
