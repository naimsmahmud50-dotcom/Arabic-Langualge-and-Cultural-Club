import { db } from "../src/lib/db";
import { events, galleryAlbums, mediaAssets } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Inserting World Arabic Language Day 2025 into database...");

  const now = Date.now();
  const eventStartTime = new Date("2025-12-18T10:00:00.000Z").getTime();
  const eventEndTime = new Date("2025-12-18T14:00:00.000Z").getTime();

  // 1. Insert Event
  const eventId = "evt_wald_2025";
  const eventSlug = "world-arabic-language-day-2025";
  
  await db.insert(events).values({
    id: eventId,
    slug: eventSlug,
    titleEn: "World Arabic Language Day 2025 & Literary Quiz Competition",
    titleAr: "الاحتفال باليوم العالمي للغة العربية ٢٠٢٥ ومسابقة المعلومات اللغوية",
    summaryEn: "Commemorating World Arabic Language Day on 18 December 2025 with literary competitions, language quizzes, and open-air awards ceremony presided by the Club Patron and Secretary.",
    summaryAr: "إحياء اليوم العالمي للغة العربية في ١٨ ديسمبر ٢٠٢٥ بتنظيم مسابقات لغوية وثقافية وتوزيع الجوائز في رحاب كلية كابي نذرول الحكومية.",
    descriptionEn: "On 18 December 2025, the Arabic Language & Cultural Club of Kabi Nazrul Government College, Dhaka, celebrated World Arabic Language Day under the permanent motto 'العربية لغة الجمال والإبداع' (Arabic is a Language of Beauty and Creativity). The celebratory program brought together club conveners, student members, and faculty patrons. The assembly featured competitive Arabic linguistic and cultural quizzes, philological trivia, and an open-air prize distribution ceremony in the historic college gardens honoring first, second, and third prize laureates.",
    descriptionAr: "في الثامن عشر من ديسمبر ٢٠٢٥م، نظم نادي اللغة والثقافة العربية بكلية كابي نذرول الحكومية في داكا احتفالية بهيجة بمناسبة اليوم العالمي للغة العربية تحت شعار 'العربية لغة الجمال والإبداع'. شهدت الفعالية حضور منسقي النادي والأمين العام وأعضاء الهيئة الاستشارية ونخبة من الطلاب. وتضمنت الاحتفالية مسابقات ثقافية وفكرية في علوم اللغة العربية، تلاها حفل تكريم وتوزيع الجوائز (المركز الأول والثاني والثالث) في الأجواء الطبيعية لحديقة الكلية.",
    category: "cultural",
    startTime: new Date(eventStartTime),
    endTime: new Date(eventEndTime),
    venue: "Department of Arabic & Campus Pavilion, Kabi Nazrul Govt. College, Dhaka",
    coverImageUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-group-banner.jpg",
    capacity: 200,
    status: "completed",
    isRegistrationOpen: false,
    isPublished: true,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  }).onConflictDoUpdate({
    target: events.id,
    set: {
      titleEn: "World Arabic Language Day 2025 & Literary Quiz Competition",
      titleAr: "الاحتفال باليوم العالمي للغة العربية ٢٠٢٥ ومسابقة المعلومات اللغوية",
      coverImageUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-group-banner.jpg",
      status: "completed",
      updatedAt: new Date(now),
    }
  });

  // 2. Insert Gallery Album
  const albumId = "alb_wald_2025";
  const albumSlug = "world-arabic-language-day-2025";

  await db.insert(galleryAlbums).values({
    id: albumId,
    slug: albumSlug,
    titleEn: "World Arabic Language Day 2025 Observance & Quiz Ceremony",
    titleAr: "أرشيف صور: اليوم العالمي للغة العربية ٢٠٢٥ وتكريم الفائزين بالمسابقة",
    descriptionEn: "Official photographic documentation of the World Arabic Language Day assembly held on 18 December 2025 at Kabi Nazrul Government College, Dhaka. Features the inaugural cohort in official club polo uniforms with the ceremonial banner, along with the open-air awards distribution ceremony honoring 1st, 2nd, and 3rd prize quiz laureates.",
    descriptionAr: "السجل المصور الرسمي لفعاليات الاحتفال باليوم العالمي للغة العربية في ١٨ ديسمبر ٢٠٢٥م بكلية كابي نذرول الحكومية. يوثق صور وفد النادي بالزي الرسمي أمام قسم اللغة العربية، ومراسم تسليم الجوائز والشهادات التقديرية للفائزين بالمراكز الثلاثة الأولى في المسابقة اللغوية.",
    coverImageUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-group-banner.jpg",
    eventDate: "2025-12-18",
    academicYear: "2025–2026",
    category: "ceremonies",
    isFeatured: true,
    isPublished: true,
    relatedEventId: eventId,
    photographerCredit: "Club Archival & Media Unit",
    location: "Department of Arabic & Historic Campus Grounds, Kabi Nazrul Govt. College",
    dateNotes: "Ceremonial Observance on 18 December 2025",
    isArchived: false,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  }).onConflictDoUpdate({
    target: galleryAlbums.id,
    set: {
      titleEn: "World Arabic Language Day 2025 Observance & Quiz Ceremony",
      titleAr: "أرشيف صور: اليوم العالمي للغة العربية ٢٠٢٥ وتكريم الفائزين بالمسابقة",
      coverImageUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-group-banner.jpg",
      isFeatured: true,
      isPublished: true,
      updatedAt: new Date(now),
    }
  });

  // 3. Insert 4 Real Photographic Media Assets
  const assets = [
    {
      id: "med_wald_01",
      albumId: albumId,
      fileUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-group-banner.jpg",
      thumbnailUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-group-banner.jpg",
      mediaType: "image",
      videoUrl: null,
      captionEn: "Official cohort portrait in front of the Historic Arabic Department holding the ceremonial banner: 'World Arabic Language Day 2025 - Arabic is a Language of Beauty and Creativity'.",
      captionAr: "صورة تذكارية لوفد النادي بالزي الرسمي أمام قسم اللغة العربية يحملون لافتة 'اليوم العالمي للغة العربية ٢٠٢٥ - العربية لغة الجمال والإبداع'.",
      credit: "Arabic Club Media Unit",
      width: 1024,
      height: 768,
      sortOrder: 1,
      isPublished: true,
      altText: "Members and conveners of the Arabic Language & Cultural Club in front of the Arabic Department with the World Arabic Language Day 2025 banner",
      createdAt: new Date(now),
    },
    {
      id: "med_wald_02",
      albumId: albumId,
      fileUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-first-prize.jpg",
      thumbnailUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-first-prize.jpg",
      mediaType: "image",
      videoUrl: null,
      captionEn: "Grand presentation of the 1st Prize and commemorative floral honors to the quiz champion by the Club Convenor and Member Secretary in the open-air campus garden.",
      captionAr: "مراسم تسليم الجائزة الأولى والوردة التقديرية للفائز بالمركز الأول في المسابقة اللغوية بحضور منسق النادي والأمين العام.",
      credit: "Arabic Club Media Unit",
      width: 1024,
      height: 768,
      sortOrder: 2,
      isPublished: true,
      altText: "1st Prize presentation ceremony with rose at the World Arabic Language Day 2025 celebration",
      createdAt: new Date(now),
    },
    {
      id: "med_wald_03",
      albumId: albumId,
      fileUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-second-prize.jpg",
      thumbnailUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-second-prize.jpg",
      mediaType: "image",
      videoUrl: null,
      captionEn: "Awarding of the 2nd Prize to the runner-up student in recognition of academic excellence during the Arabic linguistic quiz tournament.",
      captionAr: "تسليم الجائزة الثانية للمتسابق الحاصل على المركز الثاني تقديراً لتميزه في المنافسات اللغوية.",
      credit: "Arabic Club Media Unit",
      width: 1024,
      height: 768,
      sortOrder: 3,
      isPublished: true,
      altText: "2nd Prize presentation ceremony at the World Arabic Language Day 2025 celebration",
      createdAt: new Date(now),
    },
    {
      id: "med_wald_04",
      albumId: albumId,
      fileUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-third-prize.jpg",
      thumbnailUrl: "/images/gallery/world-arabic-language-day-2025/world-arabic-language-day-2025-third-prize.jpg",
      mediaType: "image",
      videoUrl: null,
      captionEn: "Awarding of the 3rd Prize along with floral honors in the campus green space surrounded by faculty patrons and club fellows.",
      captionAr: "تسليم الجائزة الثالثة وزهرة التكريم في الحديقة الجامعية وسط تشجيع الحاضرين وأعضاء النادي.",
      credit: "Arabic Club Media Unit",
      width: 1024,
      height: 768,
      sortOrder: 4,
      isPublished: true,
      altText: "3rd Prize presentation ceremony at the World Arabic Language Day 2025 celebration",
      createdAt: new Date(now),
    },
  ];

  for (const asset of assets) {
    await db.insert(mediaAssets).values(asset).onConflictDoUpdate({
      target: mediaAssets.id,
      set: {
        fileUrl: asset.fileUrl,
        thumbnailUrl: asset.thumbnailUrl,
        captionEn: asset.captionEn,
        captionAr: asset.captionAr,
        altText: asset.altText,
        sortOrder: asset.sortOrder,
        isPublished: true,
      }
    });
  }

  console.log("Successfully inserted World Arabic Language Day 2025 event, album, and 4 media assets!");
}

main().catch(console.error);
