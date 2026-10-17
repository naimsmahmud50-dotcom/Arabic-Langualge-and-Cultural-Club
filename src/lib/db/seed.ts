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
