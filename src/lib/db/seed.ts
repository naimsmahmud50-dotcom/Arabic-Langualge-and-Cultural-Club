import { db } from "./index";
import { hashPassword } from "../auth/password";
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

  // 3. Test Users with Scrypt hashed password ("AdminSecure2026!")
  const securePwHash = hashPassword("AdminSecure2026!");
  await db.insert(users).values([
    {
      id: "usr_superadmin",
      email: "admin@arabicclub.org",
      passwordHash: securePwHash,
      fullName: "Lead Systems Administrator [DEMO]",
      role: "super_admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_admin",
      email: "operations@arabicclub.org",
      passwordHash: securePwHash,
      fullName: "General Administrator [DEMO]",
      role: "administrator",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_editor",
      email: "editor@arabicclub.org",
      passwordHash: securePwHash,
      fullName: "Content & Editorial Manager [DEMO]",
      role: "content_editor",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_membership",
      email: "membership@arabicclub.org",
      passwordHash: securePwHash,
      fullName: "Membership Officer [DEMO]",
      role: "membership_manager",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_events",
      email: "events@arabicclub.org",
      passwordHash: securePwHash,
      fullName: "Events Coordinator [DEMO]",
      role: "event_manager",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_president",
      email: "president@arabicclub.org",
      passwordHash: securePwHash,
      fullName: "Executive President [DEMO]",
      role: "president",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "usr_media",
      email: "media@arabicclub.org",
      passwordHash: securePwHash,
      fullName: "Media Director [DEMO]",
      role: "media_manager",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // Ensure existing demo users are updated with the verified Scrypt hash
  await db.update(users).set({ passwordHash: securePwHash });

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
    {
      id: "fnd_03",
      nameEn: "Dr. Tariq Al-Hashimi [DEMO FIXTURE]",
      nameAr: "د. طارق الهاشمي [نموذج تجريبي]",
      roleTitleEn: "Founding Faculty Patron & Senior Advisor",
      roleTitleAr: "الراعي الأكاديمي والمستشار الأعلى",
      bioEn: "Professor of classical Arabic linguistics, overseeing textual authenticity and faculty sponsorship.",
      bioAr: "أستاذ اللغويات العربية الكلاسيكية والمشرف على الأمانة العلمية والرعاية الأكاديمية للنادي.",
      foundingYear: 2022,
      sortOrder: 3,
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "fnd_04",
      nameEn: "Maryam Al-Bukhari [DEMO FIXTURE]",
      nameAr: "مريم البخاري [نموذج تجريبي]",
      roleTitleEn: "Co-Founding Secretary & Charter Architect",
      roleTitleAr: "أمينة التأسيس المشاركة ومصممة الميثاق",
      bioEn: "Architect of the founding club constitution and organizer of the first collegiate Arabic calligraphy camp.",
      bioAr: "محررة الدستور التأسيسي للنادي ومنظمة أول معسكر طلابي لفنون الخط العربي.",
      foundingYear: 2022,
      sortOrder: 4,
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
      isCurrent: false, // HISTORICAL ARCHIVE
      summaryEn: "Inaugural term establishing club charter, foundational constitution, and first campus language workshops.",
      summaryAr: "الفترة التأسيسية التي شهدت وضع ميثاق النادي، والدستور الدائم، وإطلاق أولى ورش العمل اللغوية.",
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
      isCurrent: false, // HISTORICAL ARCHIVE
      summaryEn: "Expansion term inaugurating the annual national Arabic speech competition and Al-Bayan journal.",
      summaryAr: "فترة التوسع التي شهدت إطلاق المسابقة السنوية للخطابة ومجلة البيان المحكمة.",
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
      summaryEn: "Present governing administration overseeing modern digital platform, open learning repository, and regional debates.",
      summaryAr: "الإدارة الحالية المشرفة على المنصة الرقمية وحلقات البحث الأكاديمي والمناظرات الوطنية.",
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // 6. Members (Active Public Fellows + Private Consent Member + Alumni)
  await db.insert(members).values([
    {
      id: "mem_01",
      membershipId: "ALC-2022-001",
      fullNameEn: "Zaid Al-Mahmoud [DEMO FIXTURE]",
      fullNameAr: "زيد المحمود [نموذج تجريبي]",
      email: "zaid.al@demo.internal", // PRIVATE: Never exposed in public queries
      phone: "+8801700000001",         // PRIVATE
      studentId: "STU-2022-019",       // PRIVATE
      status: "active",
      isPublic: true,
      bioEn: "Specialist in classical Arabic prose, debate moderation, and Arabic linguistics research.",
      bioAr: "متخصص في النثر العربي الكلاسيكي وإدارة المناظرات وأبحاث اللغويات.",
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
      bioEn: "Researcher in Arabic calligraphy arts, manuscript preservation, and cultural diplomacy.",
      bioAr: "باحثة في فنون الخط العربي والدبلوماسية الثقافية وصون المخطوطات.",
      joinedAt: new Date("2023-09-15"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mem_03",
      membershipId: "ALC-2022-015",
      fullNameEn: "Tariq Ibn Ziyad [DEMO FIXTURE]",
      fullNameAr: "طارق بن زياد [نموذج تجريبي]",
      email: "tariq.z@demo.internal",
      phone: "+8801700000003",
      studentId: "STU-2022-055",
      status: "active",
      isPublic: true,
      bioEn: "Former Executive President (2023–2024), scholar of classical syntax and dialectology.",
      bioAr: "رئيس المجلس التنفيذي السابق وباحث في علوم النحو وعلم اللهجات المقارن.",
      joinedAt: new Date("2022-09-12"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mem_04",
      membershipId: "ALC-2023-088",
      fullNameEn: "Aisha Al-Ansari [DEMO FIXTURE]",
      fullNameAr: "عائشة الأنصاري [نموذج تجريبي]",
      email: "aisha.a@demo.internal",
      phone: "+8801700000004",
      studentId: "STU-2023-098",
      status: "active",
      isPublic: true,
      bioEn: "Senior editor of Al-Bayan journal, specializing in Andalusian strophic poetry (Muwashahat).",
      bioAr: "رئيسة تحرير مجلة البيان ومتخصصة في الموشحات الأندلسية والشعر الكلاسيكي.",
      joinedAt: new Date("2023-10-01"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mem_05",
      membershipId: "ALC-2022-033",
      fullNameEn: "Omar Al-Farooq [DEMO FIXTURE]",
      fullNameAr: "عمر الفاروق [نموذج تجريبي]",
      email: "omar.f@demo.internal",
      phone: "+8801700000005",
      studentId: "STU-2022-104",
      status: "active",
      isPublic: true,
      bioEn: "Master calligrapher in Thuluth and Diwani styles; director of calligraphy workshops.",
      bioAr: "خطاط مجاز في خطي الثلث والديواني ومسؤول ورش الخط والزخرفة الإسلامية.",
      joinedAt: new Date("2022-09-20"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mem_06",
      membershipId: "ALC-2024-105",
      fullNameEn: "Bilal Al-Habashi [DEMO FIXTURE]",
      fullNameAr: "بلال الحبشي [نموذج تجريبي]",
      email: "bilal.h@demo.internal",
      phone: "+8801700000006",
      studentId: "STU-2024-031",
      status: "active",
      isPublic: true,
      bioEn: "General Secretary of the current council; collegiate debater and event coordinator.",
      bioAr: "الأمين العام للمجلس الحالي، متناظر جامعي ومنسق المؤتمرات الطلابية.",
      joinedAt: new Date("2024-09-05"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mem_07",
      membershipId: "ALC-2023-067",
      fullNameEn: "Maryam Al-Khatib [DEMO FIXTURE]",
      fullNameAr: "مريم الخطيب [نموذج تجريبي]",
      email: "maryam.k@demo.internal",
      phone: "+8801700000007",
      studentId: "STU-2023-221",
      status: "active",
      isPublic: true,
      bioEn: "Cultural Secretary; coordinator of the weekly Classical Literature and Rhetoric Salon.",
      bioAr: "أمينة الشؤون الثقافية، منسقة صالون الأدب والبلاغة الأسبوعي.",
      joinedAt: new Date("2023-11-10"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mem_08",
      membershipId: "ALC-2024-144",
      fullNameEn: "Hasan Al-Basri [DEMO FIXTURE]",
      fullNameAr: "حسن البصري [نموذج تجريبي]",
      email: "hasan.b@demo.internal",
      phone: "+8801700000008",
      studentId: "STU-2024-190",
      status: "active",
      isPublic: true,
      bioEn: "Media & Publication Secretary; digital archivist and typographer.",
      bioAr: "أمين الإعلام والنشر، المشرف على التوثيق الرقمي والطباعة الأكاديمية.",
      joinedAt: new Date("2024-09-12"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mem_priv_01",
      membershipId: "ALC-2024-999",
      fullNameEn: "Private Student Scholar [DEMO FIXTURE]",
      fullNameAr: "عضو بخصوصية تامة [نموذج تجريبي]",
      email: "confidential.scholar@demo.internal",
      phone: "+8801700000999",
      studentId: "STU-2024-999",
      status: "active",
      isPublic: false, // STRICT PRIVACY TEST: Must NEVER be queried or shown in public directory
      bioEn: "Registered fellow who elected to keep directory listing private.",
      bioAr: "عضو مسجل اختار حجب بياناته عن الدليل العام للخصوصية الشخصية.",
      joinedAt: new Date("2024-09-01"),
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "mem_alm_01",
      membershipId: "ALC-2022-002",
      fullNameEn: "Dr. Khalid Al-Mansoor [DEMO FIXTURE]",
      fullNameAr: "د. خالد المنصور [نموذج تجريبي]",
      email: "khalid.m@demo.internal",
      phone: "+8801700000010",
      studentId: "STU-2022-002",
      status: "alumni",
      isPublic: true,
      bioEn: "Founding member and alumnus; currently Lecturer in Semitic Philology.",
      bioAr: "عضو مؤسس وخريج متميز، محاضر في فقه اللغات السامية.",
      joinedAt: new Date("2022-09-10"),
      createdAt: now,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // Assign members across terms (demonstrating preservation across multiple terms)
  await db.insert(committeeAssignments).values([
    // 2022–2023 Term Assignments (Founding Council)
    {
      id: "asg_2022_01",
      termId: "term_2022_2023",
      memberId: "mem_03",
      positionTitleEn: "President (Founding)",
      positionTitleAr: "رئيس المجلس التأسيسي",
      rankOrder: 1,
      roleDescription: "Led the inaugural founding assembly and ratification of bylaws.",
      createdAt: now,
    },
    {
      id: "asg_2022_02",
      termId: "term_2022_2023",
      memberId: "mem_01", // Zaid serving in 2022–23!
      positionTitleEn: "General Secretary (Founding)",
      positionTitleAr: "الأمين العام التأسيسي",
      rankOrder: 3,
      roleDescription: "Drafted the founding charter and managed membership intake.",
      createdAt: now,
    },
    {
      id: "asg_2022_03",
      termId: "term_2022_2023",
      memberId: "mem_05",
      positionTitleEn: "Cultural Secretary (Founding)",
      positionTitleAr: "أمين الشؤون الثقافية التأسيسي",
      rankOrder: 4,
      roleDescription: "Organized inaugural language circles and guest lectures.",
      createdAt: now,
    },

    // 2023–2024 Term Assignments (Second Council)
    {
      id: "asg_2023_01",
      termId: "term_2023_2024",
      memberId: "mem_03",
      positionTitleEn: "President",
      positionTitleAr: "الرئيس",
      rankOrder: 1,
      roleDescription: "Oversaw inter-university debate competitions and journal launch.",
      createdAt: now,
    },
    {
      id: "asg_2023_02",
      termId: "term_2023_2024",
      memberId: "mem_04",
      positionTitleEn: "Vice President",
      positionTitleAr: "نائبة الرئيس",
      rankOrder: 2,
      roleDescription: "Chaired academic committee and Al-Bayan journal editorial board.",
      createdAt: now,
    },
    {
      id: "asg_2023_03",
      termId: "term_2023_2024",
      memberId: "mem_01", // Zaid serving in 2023–24!
      positionTitleEn: "Cultural Secretary (Past)",
      positionTitleAr: "أمين الشؤون الثقافية السابق",
      rankOrder: 4,
      roleDescription: "Coordinated rhetorical circles and regional debate participation.",
      createdAt: now,
    },
    {
      id: "asg_2023_04",
      termId: "term_2023_2024",
      memberId: "mem_05",
      positionTitleEn: "General Secretary",
      positionTitleAr: "الأمين العام",
      rankOrder: 3,
      roleDescription: "Managed secretariat records and official correspondence.",
      createdAt: now,
    },

    // 2024–2025 Term Assignments (Current Active Council)
    {
      id: "asg_curr_01",
      termId: "term_2024_2025",
      memberId: "mem_01", // Zaid serving as President in 2024–25! (Served in all 3 terms)
      positionTitleEn: "President",
      positionTitleAr: "الرئيس",
      rankOrder: 1,
      roleDescription: "Chief executive officer presiding over university Arabic club operations.",
      createdAt: now,
    },
    {
      id: "asg_curr_02",
      termId: "term_2024_2025",
      memberId: "mem_02",
      positionTitleEn: "Vice President",
      positionTitleAr: "نائبة الرئيس",
      rankOrder: 2,
      roleDescription: "Director of cultural diplomacy, external liaisons, and arts curation.",
      createdAt: now,
    },
    {
      id: "asg_curr_03",
      termId: "term_2024_2025",
      memberId: "mem_06",
      positionTitleEn: "General Secretary",
      positionTitleAr: "الأمين العام",
      rankOrder: 3,
      roleDescription: "Executive administrator of membership records and assembly proceedings.",
      createdAt: now,
    },
    {
      id: "asg_curr_04",
      termId: "term_2024_2025",
      memberId: "mem_07",
      positionTitleEn: "Cultural Secretary",
      positionTitleAr: "أمينة الشؤون الثقافية",
      rankOrder: 4,
      roleDescription: "Coordinator of weekly literary circles and annual debate symposium.",
      createdAt: now,
    },
    {
      id: "asg_curr_05",
      termId: "term_2024_2025",
      memberId: "mem_08",
      positionTitleEn: "Media & Publication Secretary",
      positionTitleAr: "أمين الإعلام والنشر",
      rankOrder: 5,
      roleDescription: "Director of digital archives, publications, and photographic records.",
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

  // 8. 12-Month Annual Plan Framework (Multi-Year Historical Preservation)
  await db.insert(annualPlans).values([
    // Academic Year 2024–2025 (Current Ratified Session)
    {
      id: "ap_24_01",
      academicYear: "2024–2025",
      monthNumber: 1,
      activityTitleEn: "Orientation & Arabic Language Fundamentals",
      activityTitleAr: "اللقاء التعريفي وأساسيات اللغة العربية",
      descriptionEn: "Welcoming assembly for incoming fellows with diagnostic linguistic assessment and introductory grammar roadmap.",
      descriptionAr: "اللقاء الافتتاحي للزملاء الجدد مع تقييم لغوي تشخيصي وخريطة طريق لقواعد النحو.",
      category: "academic",
      status: "completed",
      targetDate: "2024-09-18",
      time: "10:00 AM – 01:00 PM",
      location: "Auditorium Hall A, Central Campus",
      documentUrl: "/documents/orientation-syllabus-2024.pdf",
      documentTitle: "Orientation Syllabus & Foundation Guide",
      notes: "Ratified by Academic Council on Sept 1, 2024.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_24_02",
      academicYear: "2024–2025",
      monthNumber: 2,
      activityTitleEn: "Classical Arabic Calligraphy Masterclass",
      activityTitleAr: "دورة الخط العربي الكلاسيكي المتقدمة",
      descriptionEn: "Intensive studio session focusing on Thuluth and Diwani script proportions with master calligraphers.",
      descriptionAr: "جلسة تدريبية مكثفة تركز على موازين خطي الثلث والديواني مع كبار أساتذة الخط.",
      category: "workshop",
      status: "completed",
      targetDate: "2024-10-12",
      time: "09:30 AM – 02:00 PM",
      location: "Main University Cultural Center",
      relatedEventId: "evt_01",
      documentUrl: "/documents/thuluth-script-guide.pdf",
      documentTitle: "Thuluth & Diwani Script Manual",
      notes: "60 participants completed certificate training.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_24_03",
      academicYear: "2024–2025",
      monthNumber: 3,
      activityTitleEn: "Classical Poetry Recitation & Rhetoric Salon",
      activityTitleAr: "أمسية إنشاد وإلقاء الشعر العربي وصالون البلاغة",
      descriptionEn: "Scholarly salon exploring the Mu'allaqat and Abbasid poetic diction with meters and vocal performance.",
      descriptionAr: "صالون أدبي لدراسة المعلقات وشعر العصر العباسي مع تطبيقات على الأوزان العروضية.",
      category: "cultural",
      status: "completed",
      targetDate: "2024-11-20",
      time: "04:00 PM – 07:30 PM",
      location: "Faculty of Arts Garden Courtyard",
      documentUrl: null,
      documentTitle: null,
      notes: "Attended by 85 fellows and guest faculty delegates.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_24_04",
      academicYear: "2024–2025",
      monthNumber: 4,
      activityTitleEn: "World Arabic Language Day International Gala",
      activityTitleAr: "الاحتفال الدولي باليوم العالمي للغة العربية",
      descriptionEn: "Official UNESCO Arabic Day celebration featuring academic panels, calligraphy exhibition, and keynote speeches.",
      descriptionAr: "الاحتفال الرسمي بيوم الضاد متضمناً ندوات فكرية، ومعرضاً للخط، وكلمات افتتاحية رفيعة.",
      category: "cultural",
      status: "completed",
      targetDate: "2024-12-18",
      time: "10:00 AM – 04:00 PM",
      location: "Grand Senate Hall",
      documentUrl: "/documents/world-arabic-day-resolution.pdf",
      documentTitle: "UNESCO Arabic Day Program Prospectus",
      notes: "Organized in collaboration with the Department of Modern Languages.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_24_05",
      academicYear: "2024–2025",
      monthNumber: 5,
      activityTitleEn: "Grammar & Morphology Immersion Circle",
      activityTitleAr: "حلقة استيعاب النحو والصرف وتطبيقات الإعراب",
      descriptionEn: "Advanced dissection of classical syntactic structures from Alfiyyah Ibn Malik with practical parsing.",
      descriptionAr: "دراسة معمقة لأبيات ألفية ابن مالك وتطبيقات الإعراب التواصلي العملي.",
      category: "academic",
      status: "completed",
      targetDate: "2025-01-15",
      time: "11:00 AM – 01:30 PM",
      location: "Seminar Room 302, Department of Arabic",
      documentUrl: null,
      documentTitle: null,
      notes: "Bi-weekly study cohort concluded successfully.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_24_06",
      academicYear: "2024–2025",
      monthNumber: 6,
      activityTitleEn: "Annual Arabic Oratory & Eloquence Competition",
      activityTitleAr: "المسابقة السنوية للخطابة والفصاحة العربية",
      descriptionEn: "Campus-wide rhetorical competition assessing eloquence, classical diction, and delivery before external adjudicators.",
      descriptionAr: "المنافسة الخطابية الكبرى لاختبار الفصاحة، وجودة البيان، وحسن الإلقاء أمام لجان تحكيم معتمدة.",
      category: "competition",
      status: "completed",
      targetDate: "2025-02-22",
      time: "09:00 AM – 05:00 PM",
      location: "Grand Academic Hall",
      relatedEventId: "evt_02",
      documentUrl: "/documents/oratory-rules-2025.pdf",
      documentTitle: "Oratory Rules & Adjudication Rubric",
      notes: "32 contenders from 6 faculties participated.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_24_07",
      academicYear: "2024–2025",
      monthNumber: 7,
      activityTitleEn: "Manuscript Editing & Paleography Workshop",
      activityTitleAr: "ورشة تحقيق المخطوطات وعلم الخطوط القديمة",
      descriptionEn: "Practicum in classical codicology, cataloging, ink identification, and collation of historical Arabic manuscripts.",
      descriptionAr: "تدريب عملي على الكوديكولوجيا، وقراءة خطوط النساخ، ومقابلة النسخ الخطية التراثية.",
      category: "workshop",
      status: "confirmed",
      targetDate: "2025-03-25",
      time: "10:00 AM – 01:00 PM",
      location: "Central University Rare Book Archive",
      documentUrl: "/documents/paleography-handbook.pdf",
      documentTitle: "Introduction to Manuscript Editing Handout",
      notes: "Facilitated by Senior Archivist Dr. Tariq Al-Hashimi.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_24_08",
      academicYear: "2024–2025",
      monthNumber: 8,
      activityTitleEn: "Inter-University Arabic Debate Championship",
      activityTitleAr: "بطولة الجامعات للمناظرات باللغة العربية",
      descriptionEn: "National collegiate debate tournament on contemporary linguistic and philosophical motions.",
      descriptionAr: "البطولة الوطنية لمناظرات الجامعات حول قضايا الفكر واللغة المعاصرة.",
      category: "competition",
      status: "postponed", // TEST CASE: Explicit postponement status with verified explanation
      targetDate: "2025-04-18",
      time: "09:30 AM – 06:00 PM",
      location: "National Debate Arena",
      documentUrl: "/documents/postponement-notice-apr2025.pdf",
      documentTitle: "Notice of Date Adjustment - Academic Council",
      notes: "Postponed by the Inter-University Advisory Board to prevent conflict with term examinations. Rescheduled to Month 11 (July 2025).",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_24_09",
      academicYear: "2024–2025",
      monthNumber: 9,
      activityTitleEn: "Comparative Semitic Philology Colloquium",
      activityTitleAr: "ندوة فقه اللغات السامية المقارن وتطور المعجم",
      descriptionEn: "Academic symposium examining historical phonology and the relationship between Classical Arabic and sister tongues.",
      descriptionAr: "ندوة علمية تبحث في الأصوات المقارنة ونشأة المعاجم وعلاقة العربية بأخواتها الساميات.",
      category: "seminar",
      status: "confirmed",
      targetDate: "2025-05-14",
      time: "03:00 PM – 05:30 PM",
      location: "Ibn Khaldun Lecture Theatre",
      documentUrl: null,
      documentTitle: null,
      notes: "Keynote presentation by visiting chair in comparative linguistics.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_24_10",
      academicYear: "2024–2025",
      monthNumber: 10,
      activityTitleEn: "Regional Arabic Book Fair & Translation Forum",
      activityTitleAr: "معرض الكتاب العربي ومنتدى الترجمة والتعريب",
      descriptionEn: "Exposition of scholarly presses, academic translations, and terminology roundtable.",
      descriptionAr: "معرض لدور النشر الأكاديمية وحلقات نقاشية حول قضايا التعريب والمصطلح الحديث.",
      category: "cultural",
      status: "cancelled", // TEST CASE: Explicit cancellation status with transparent reason
      targetDate: "2025-06-10",
      time: "10:00 AM – 06:00 PM",
      location: "Exhibition Pavilion",
      documentUrl: null,
      documentTitle: null,
      notes: "Cancelled due to scheduled structural renovation of the Exhibition Pavilion. Digital book catalog will be issued in lieu.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_24_11",
      academicYear: "2024–2025",
      monthNumber: 11,
      activityTitleEn: "Rescheduled Inter-University Arabic Debate Championship",
      activityTitleAr: "المرحلة النهائية لبطولة الجامعات للمناظرات العربية",
      descriptionEn: "Ratified new date for the national debate championship following the April postponement.",
      descriptionAr: "الموعد المعتمد للبطولة الوطنية للمناظرات بعد الترحيل التنسيقي من شهر أبريل.",
      category: "competition",
      status: "confirmed",
      targetDate: "2025-07-08",
      time: "09:00 AM – 06:00 PM",
      location: "National Debate Arena",
      documentUrl: "/documents/debate-motions-2025.pdf",
      documentTitle: "Official Tournament Motions & Protocol",
      notes: "Teams confirmed across 8 participating universities.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_24_12",
      academicYear: "2024–2025",
      monthNumber: 12,
      activityTitleEn: "Annual General Assembly & Council Handover Ceremony",
      activityTitleAr: "الجمعية العامة السنوية ومراسم تسليم المجلس التنفيذي",
      descriptionEn: "Concluding institutional assembly reviewing the annual report, ratifying the financial ledger, and inducting incoming officers.",
      descriptionAr: "المؤتمر السنوي الختامي لمراجعة التقرير الأكاديمي، والمصادقة على السجلات، وتسليم العهدة الإدارية.",
      category: "academic",
      status: "planned", // TEST CASE: Tentative/Unratified date and venue
      targetDate: null, // Verified: null date
      time: null,
      location: null,
      documentUrl: null,
      documentTitle: null,
      notes: "Date and venue pending ratification by the incoming electoral oversight board.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },

    // Academic Year 2023–2024 (Historical Archive)
    {
      id: "ap_23_01",
      academicYear: "2023–2024",
      monthNumber: 1,
      activityTitleEn: "Inaugural Assembly & Academic Intake 2023",
      activityTitleAr: "اللقاء الترحيبي وبدء العام الأكاديمي ٢٠٢٣",
      descriptionEn: "Opening session of the second executive administration.",
      descriptionAr: "الجلسة الافتتاحية للدورة التنفيذية الثانية.",
      category: "academic",
      status: "completed",
      targetDate: "2023-09-15",
      time: "10:00 AM – 12:30 PM",
      location: "Faculty Hall 2",
      documentUrl: null,
      documentTitle: null,
      notes: "Historical record preserved in archive.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "ap_23_04",
      academicYear: "2023–2024",
      monthNumber: 4,
      activityTitleEn: "International Arabic Language Day Colloquium 2023",
      activityTitleAr: "ندوة اليوم العالمي للغة العربية ٢٠٢٣",
      descriptionEn: "Campus symposium on the preservation of Arabic literary heritage.",
      descriptionAr: "ندوة جامعية حول حماية التراث الأدبي العربي.",
      category: "cultural",
      status: "completed",
      targetDate: "2023-12-18",
      time: "10:00 AM – 03:00 PM",
      location: "Main University Auditorium",
      documentUrl: null,
      documentTitle: null,
      notes: "Archived milestone.",
      isPublished: true,
      createdAt: now,
      updatedAt: now,
    },
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

  // 12. Editable CMS Pages (About & History)
  await db.insert(editablePages).values([
    {
      id: "page_about",
      slug: "about",
      titleEn: "About the Club",
      titleAr: "عن النادي وأهدافه السامية",
      metaDescriptionEn: "An enduring academic society founded to preserve the classical eloquence of the Arabic language, foster intellectual discourse, and cultivate cultural scholarship.",
      metaDescriptionAr: "جمعية أكاديمية راسخة تأسست لصون فصاحة لغة الضاد، وتعزيز الحوار الفكري، وترسيخ البحث الثقافي.",
      isPublished: true,
      updatedAt: now,
    },
    {
      id: "page_history",
      slug: "history",
      titleEn: "Institutional History & Milestones",
      titleAr: "تاريخ النادي والمحطات البارزة",
      metaDescriptionEn: "A chronological record of our institutional journey, academic milestones, and enduring devotion to Arabic language scholarship.",
      metaDescriptionAr: "سجل زمني يوثق مسيرتنا المؤسسية، ومحطاتنا الأكاديمية، والتفاني المستمر في خدمة لغة الضاد.",
      isPublished: true,
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // 13. Page Sections for About Page
  await db.insert(pageSections).values([
    {
      id: "sec_about_mission",
      pageId: "page_about",
      sectionKey: "mission",
      sortOrder: 1,
      contentEn: JSON.stringify({
        heading: "Institutional Mission",
        subheading: "Cultivating linguistic rigor and classical fluency",
        badge: "Our Mission",
        body: "To cultivate an academic environment that empowers students to master Arabic linguistics, appreciate the depth of Islamic and classical literature, and articulate thought with eloquence, integrity, and analytical depth.",
        quote: {
          text: "«إِنَّ مِنَ البَيَانِ لَسِحْرًا»",
          attribution: "Classical Prophetic Adage on Eloquence"
        }
      }),
      contentAr: JSON.stringify({
        heading: "رسالتنا المؤسسية",
        subheading: "رعاية الفصاحة وبناء الملكة اللغوية الرصينة",
        badge: "رسالتنا",
        body: "بناء بيئة أكاديمية رصينة تُمكّن الطلبة من التمكن في علوم اللغة العربية وآدابها الكلاسيكية، وتنمي فيهم ملكة البيان الرصين، والتحليل النقدي العميق.",
        quote: {
          text: "«إِنَّ مِنَ البَيَانِ لَسِحْرًا»",
          attribution: "الحديث النبوي الشريف في الفصاحة والبلاغة"
        }
      }),
      updatedAt: now,
    },
    {
      id: "sec_about_vision",
      pageId: "page_about",
      sectionKey: "vision",
      sortOrder: 2,
      contentEn: JSON.stringify({
        heading: "Institutional Vision",
        subheading: "A regional benchmark in Arabophone academic excellence",
        badge: "Our Vision",
        body: "To be the premier university forum for Arabic literary scholarship, recognized regionally for producing articulate leaders, eloquent orators, and scholarly publications that bridge traditional heritage and contemporary intellectual dialogue.",
        quote: {
          text: "Toward an enduring renaissance of literary excellence.",
          attribution: "Founding Academic Assembly"
        }
      }),
      contentAr: JSON.stringify({
        heading: "رؤيتنا المستقبلية",
        subheading: "منارة رائدة في الدراسات العربية والإشعاع الثقافي",
        badge: "رؤيتنا",
        body: "أن يكون النادي الصرح الطلابي الأول إقليمياً في صون الفصاحة وتخريج كوادر متميزة في الخطابة والمناظرات والنشر الأكاديمي المحكم.",
        quote: {
          text: "نحو نهضة أدبية وفكرية متجددة ومستدامة.",
          attribution: "الجمعية التأسيسية الأكاديمية"
        }
      }),
      updatedAt: now,
    },
    {
      id: "sec_about_values",
      pageId: "page_about",
      sectionKey: "values",
      sortOrder: 3,
      contentEn: JSON.stringify({
        heading: "Our Core Institutional Values",
        subheading: "Every initiative, competition, and publication conforms strictly to these foundational values.",
        badge: "Guiding Philosophy",
        items: [
          {
            id: "val_1",
            title: "Scholarly Fidelity (الأمانة العلمية)",
            arabicTitle: "الأمانة العلمية والتحقيق الرصين",
            description: "Upholding strict academic rigor in textual attribution, linguistic translation, and classical Arabic manuscript studies.",
            iconName: "BookOpen"
          },
          {
            id: "val_2",
            title: "Institutional Continuity (التوارث المؤسسي)",
            arabicTitle: "التوارث المؤسسي وصون الذاكرة",
            description: "Honoring the contributions of founding scholars and former executive committees through continuous archival record-keeping.",
            iconName: "ShieldCheck"
          },
          {
            id: "val_3",
            title: "Collegial Brotherhood (الأخوة والتعاون)",
            arabicTitle: "الأخوة الأكاديمية والعمل المشترك",
            description: "Fostering an inclusive and supportive academic brotherhood where advanced linguists mentor novice Arabic learners.",
            iconName: "HeartHandshake"
          },
          {
            id: "val_4",
            title: "Eloquence in Public Discourse (الفصاحة والأدب)",
            arabicTitle: "الفصاحة وأدب الحوار",
            description: "Championing respectful, evidence-based oratorical discourse adhering to high standards of classical adab.",
            iconName: "Compass"
          },
          {
            id: "val_5",
            title: "Cultural Stewardship (صون التراث)",
            arabicTitle: "صون التراث والخط العربي",
            description: "Preserving classical Arabic calligraphy, dialectical diversity, and historical literature for future student generations.",
            iconName: "Award"
          }
        ]
      }),
      contentAr: JSON.stringify({
        heading: "قيمنا المؤسسية الجوهرية",
        subheading: "مبادئ راسخة تحكم كل فعالية، مسابقة، أو إصدار أكاديمي",
        badge: "فلسفتنا التوجيهية"
      }),
      updatedAt: now,
    },
    {
      id: "sec_about_constitution",
      pageId: "page_about",
      sectionKey: "constitution",
      sortOrder: 4,
      contentEn: JSON.stringify({
        heading: "Club Constitution & Governance Charter",
        subheading: "Ratified by the Founding General Assembly",
        badge: "Governing Charter",
        body: "The Arabic Language & Cultural Club operates under an institutional constitution ratified by the founding general assembly. The constitution mandates annual executive committee transitions, democratic representation, transparent auditing of club assets, and permanent preservation of archival records.",
        documentTitle: "Official Club Constitution & Bylaws [Ratified Archive]",
        documentUrl: "/assets/docs/club-constitution.pdf",
        documentSize: "2.4 MB (Archival PDF)"
      }),
      contentAr: JSON.stringify({
        heading: "دستور النادي وميثاق الحوكمة",
        subheading: "معتمد بإجماع الجمعية العمومية التأسيسية",
        badge: "الميثاق الأساسي",
        body: "يعمل النادي بموجب دستور مؤسسي محكم يحدد آليات التداول الديمقراطي للقيادة، والشفافية المالية، وحفظ الذاكرة التاريخية لجميع الهيئات الإدارية المتعاقبة.",
        documentTitle: "الدستور الرسمي واللوائح الداخلية المعتمدة (ملف PDF)",
        documentUrl: "/assets/docs/club-constitution.pdf",
        documentSize: "2.4 ميغابايت"
      }),
      updatedAt: now,
    },
    {
      id: "sec_about_pillars",
      pageId: "page_about",
      sectionKey: "pillars",
      sortOrder: 5,
      contentEn: JSON.stringify({
        heading: "The Four Academic & Cultural Pillars",
        subheading: "Our comprehensive operational framework across linguistic domains",
        badge: "Operational Framework",
        items: [
          {
            title: "Classical Linguistic Foundations (علوم اللغة)",
            description: "Systematic mastery of Nahw (syntax), Sarf (morphology), and Balaghah (rhetoric) through structured seminar series.",
            badge: "Linguistics"
          },
          {
            title: "Literary & Rhetorical Tradition (الأدب والبيان)",
            description: "Deep appreciation of classical and modern Arabic poetry, prose critique, and public oratorical eloquence.",
            badge: "Literature"
          },
          {
            title: "Cultural Dialogue & Diplomacy (الحوار الحضاري)",
            description: "Engaging collegiate debaters in contemporary discourse, fostering cross-cultural understanding and diplomacy.",
            badge: "Debate & Discourse"
          },
          {
            title: "Scholarly Publishing (النشر الأكاديمي)",
            description: "Producing peer-reviewed student journals, literary anthologies, and public pedagogical resources.",
            badge: "Publications"
          }
        ]
      }),
      contentAr: JSON.stringify({
        heading: "الأركان الأربعة للنادي",
        subheading: "إطار عملنا الأكاديمي الشامل في خدمة لغة الضاد",
        badge: "أركان العمل"
      }),
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // 14. Page Sections for History Page
  await db.insert(pageSections).values([
    {
      id: "sec_history_intro",
      pageId: "page_history",
      sectionKey: "intro",
      sortOrder: 1,
      contentEn: JSON.stringify({
        heading: "Institutional Genesis & Academic Journey",
        subheading: "From a collegiate reading circle to an enduring cultural institution",
        badge: "Historical Overview",
        body: "Founded to preserve the classical eloquence of the Arabic language on campus, the club has grown through successive academic terms into an accredited society renowned for linguistic scholarship, collegiate debate triumphs, and historical preservation. Every resolution, publication, and executive administration is permanently preserved in our university archival records."
      }),
      contentAr: JSON.stringify({
        heading: "النشأة المؤسسية والمسيرة الأكاديمية",
        subheading: "من حلقة قراءة طلابية إلى صرح ثقافي معتمد",
        badge: "لمحة تاريخية",
        body: "تأسس النادي لصون فصاحة اللغة العربية في الحرم الجامعي، وتطور عبر دورات متتالية إلى مؤسسة رائدة في تعليم النحو والخطابة وتنظيم المناظرات وحفظ السجلات التوثيقية."
      }),
      updatedAt: now,
    },
    {
      id: "sec_history_milestones",
      pageId: "page_history",
      sectionKey: "milestones",
      sortOrder: 2,
      contentEn: JSON.stringify({
        heading: "Chronological Institutional Milestones",
        subheading: "Verified historical records documented by the Club Archival Committee",
        badge: "Verified Chronology",
        items: [
          {
            year: "2020",
            title: "Inaugural Assembly & Founding Charter [DEMO FIXTURE]",
            arabicTitle: "التأسيس والجمعية العمومية الأولى",
            description: "Founded by a dedicated coalition of classical Arabic students and faculty patrons to foster Arabic eloquence and cultural preservation on campus.",
            arabicDescription: "تأسس النادي بمبادرة كريمة من نخبة من طلبة اللغة العربية وأساتذتها لرعاية الفصاحة وحفظ التراث.",
            badge: "Inception",
            citation: "Archival Record: FCA-2020-01",
            isVerified: true
          },
          {
            year: "2021",
            title: "Ratification of the Permanent Club Constitution [DEMO FIXTURE]",
            arabicTitle: "اعتماد الدستور الدائم للنادي",
            description: "The official institutional constitution was adopted, establishing democratic executive rotation, term limits, and the archival preservation committee.",
            arabicDescription: "إقرار الدستور الدائم المنظم للانتخابات السنوية، وحفظ السجلات، وتحديد المسؤوليات المؤسسية.",
            badge: "Governance",
            citation: "General Assembly Minutes Vol. 1",
            isVerified: true
          },
          {
            year: "2022",
            title: "Inauguration of the 'Al-Bayan' Annual Arabic Journal [DEMO FIXTURE]",
            arabicTitle: "إطلاق مجلة البيان الأدبية المحكمة",
            description: "Published the first volume of the club's academic magazine featuring peer-reviewed student essays, Arabic poetry critiques, and linguistics research.",
            arabicDescription: "إصدار العدد الأول من مجلة النادي العلمية المحكمة لنشر بحوث الطلاب ومقالاتهم الأدبية.",
            badge: "Publication",
            citation: "University Library Deposit Ref: ALC-2022-J1",
            isVerified: true
          },
          {
            year: "2023",
            title: "National Arabic Debate Championship Honors [DEMO FIXTURE]",
            arabicTitle: "التميز في المناظرات الوطنية باللغة العربية",
            description: "The club's debate squad represented the university at the National Arabic Debate Forum, winning top speaker and team finalist honors.",
            arabicDescription: "فريق المناظرات يحصد المركز الأول في البطولة الوطنية للجامعات مع وسام أفضل متحدث.",
            badge: "Achievement",
            citation: "Inter-Collegiate Debate Council Award 2023",
            isVerified: true
          },
          {
            year: "2024",
            title: "Digital Archive & Open Learning Resource Center [DEMO FIXTURE]",
            arabicTitle: "إطلاق الأرشيف الرقمي ومركز الموارد المفتوحة",
            description: "Transitioned to a modern institutional digital repository preserving 100% of historical executive committee records and public Arabic educational assets.",
            arabicDescription: "تدشين المستودع الرقمي المؤسسي لحفظ تاريخ الهيئات الإدارية وتوفير المراجع التعليمية العامة.",
            badge: "Modernization",
            citation: "Executive Council Resolution 2024-09",
            isVerified: true
          }
        ]
      }),
      contentAr: JSON.stringify({
        heading: "المحطات التاريخية والوثائق المعتمدة",
        subheading: "سجلات تاريخية موثقة ومعتمدة من لجنة التوثيق والأرشيف",
        badge: "التسلسل الزمني"
      }),
      updatedAt: now,
    },
    {
      id: "sec_history_archives",
      pageId: "page_history",
      sectionKey: "archives",
      sortOrder: 3,
      contentEn: JSON.stringify({
        heading: "Archival Preservation Protocol",
        subheading: "Immutable historical records pursuant to Constitutional Article IV",
        badge: "Archival Policy",
        body: "In accordance with Article IV of the Club Constitution, historical records are immutable. No incoming administration may delete, overwrite, or obscure the records, decisions, or personnel of previous terms. Complete physical records are maintained at the Campus Cultural Archives.",
        documentTitle: "Archival Preservation & Records Protocol (PDF)",
        documentUrl: "/assets/docs/archival-protocol.pdf",
        documentSize: "1.1 MB (Archival Deposit)"
      }),
      contentAr: JSON.stringify({
        heading: "بروتوكول حفظ الذاكرة المؤسسية",
        subheading: "سجلات غير قابلة للتعديل أو الحذف بموجب المادة الرابعة من الدستور",
        badge: "وثيقة الأرشيف",
        body: "تعتبر جميع قرارات الهيئات الإدارية السابقة وقوائم عضويتها وثائق تاريخية مصونة، لا يحق لأي إدارة لاحقة شطبها أو إخفاؤها.",
        documentTitle: "بروتوكول حفظ السجلات والوثائق التاريخية (ملف PDF)",
        documentUrl: "/assets/docs/archival-protocol.pdf",
        documentSize: "1.1 ميغابايت"
      }),
      updatedAt: now,
    },
  ]).onConflictDoNothing();

  // 15. Audit Log Record
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
