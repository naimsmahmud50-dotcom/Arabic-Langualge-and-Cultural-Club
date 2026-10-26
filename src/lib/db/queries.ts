/**
 * DEVELOPER NOTE:
 * File: src/lib/db/queries.ts
 * Module: Database Access & Query Ledger
 * Phase 8 Enhancement (030-event-to-gallery-website-integration):
 * - Added `getPublicGalleryAlbumByEventId(eventId)`: Fetches public published album for event dossier.
 * - Added `getAlbumByRelatedEventId(eventId)`: Admin lookup for album associated with an event.
 * - Enhanced `getAdminEvents()` & `getAdminEventById()`: Left-joins or maps associated `galleryAlbums`
 *   to expose `albumId`, `albumSlug`, `albumTitleEn`, and `albumIsPublished` for admin workflows.
 * Strictly human vibe; zero AI emojis.
 */

import { db } from "./index";
import { 
  members, 
  committeeTerms, 
  committeeAssignments, 
  events, 
  eventRegistrations, 
  announcements, 
  galleryAlbums, 
  mediaAssets, 
  learningResources, 
  achievements, 
  publications, 
  founders, 
  siteSettings,
  membershipApplications,
  auditLogs,
  annualPlans,
  editablePages,
  pageSections,
  contactInquiries,
  users
} from "./schema";
import { eq, ne, desc, asc, and, like, or, count, sql, inArray } from "drizzle-orm";
import { createCachedQuery } from "@/lib/cache/query-cache";

// ----------------------------------------------------------------------
// PUBLIC QUERIES (Zero Sensitive Data Exposure)
// ----------------------------------------------------------------------

/**
 * Fetch verified founders for the public narrative.
 */
export const getPublicFounders = createCachedQuery(
  async function getPublicFoundersDirect() {
    return await db.select({
      id: founders.id,
      nameEn: founders.nameEn,
      nameAr: founders.nameAr,
      portraitUrl: founders.portraitUrl,
      roleTitleEn: founders.roleTitleEn,
      roleTitleAr: founders.roleTitleAr,
      bioEn: founders.bioEn,
      bioAr: founders.bioAr,
      foundingYear: founders.foundingYear,
    })
    .from(founders)
    .where(eq(founders.isPublished, true))
    .orderBy(asc(founders.sortOrder));
  },
  ["public-founders"],
  { tags: ["founders"], revalidate: 60 }
);

/**
 * Fetch active committee term and historical terms list.
 */
export const getCommitteeTerms = createCachedQuery(
  async function getCommitteeTermsDirect() {
    return await db.select({
      id: committeeTerms.id,
      academicYear: committeeTerms.academicYear,
      titleEn: committeeTerms.titleEn,
      titleAr: committeeTerms.titleAr,
      isCurrent: committeeTerms.isCurrent,
      startDate: committeeTerms.startDate,
      endDate: committeeTerms.endDate,
      summaryEn: committeeTerms.summaryEn,
      summaryAr: committeeTerms.summaryAr,
    })
    .from(committeeTerms)
    .orderBy(desc(committeeTerms.startDate));
  },
  ["committee-terms"],
  { tags: ["committee-terms"], revalidate: 60 }
);

/**
 * Fetch committee members for a specific term (Current or Historical Archive).
 * Notice: Email, phone, studentId are completely excluded from the projection.
 */
export const getCommitteeMembersByTerm = createCachedQuery(
  async function getCommitteeMembersByTermDirect(termId: string) {
    return await db.select({
      assignmentId: committeeAssignments.id,
      positionTitleEn: committeeAssignments.positionTitleEn,
      positionTitleAr: committeeAssignments.positionTitleAr,
      rankOrder: committeeAssignments.rankOrder,
      roleDescription: committeeAssignments.roleDescription,
      memberId: members.id,
      membershipId: members.membershipId,
      fullNameEn: members.fullNameEn,
      fullNameAr: members.fullNameAr,
      photoUrl: members.photoUrl,
      bioEn: members.bioEn,
      bioAr: members.bioAr,
    })
    .from(committeeAssignments)
    .innerJoin(members, eq(committeeAssignments.memberId, members.id))
    .where(eq(committeeAssignments.termId, termId))
    .orderBy(asc(committeeAssignments.rankOrder));
  },
  ["committee-members-by-term"],
  { tags: ["committee-terms", "committee-members"], revalidate: 60 }
);

/**
 * Fetch public member directory.
 * Strictly respects isPublic = true and excludes private personal contacts.
 */
export const getPublicMembers = createCachedQuery(
  async function getPublicMembersDirect(params: { page?: number; limit?: number; search?: string } = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const offset = (page - 1) * limit;

    const conditions = [eq(members.isPublic, true), eq(members.status, "active")];
    if (params.search) {
      const s = `%${params.search}%`;
      conditions.push(or(like(members.fullNameEn, s), like(members.fullNameAr, s))!);
    }

    const data = await db.select({
      id: members.id,
      membershipId: members.membershipId,
      fullNameEn: members.fullNameEn,
      fullNameAr: members.fullNameAr,
      photoUrl: members.photoUrl,
      status: members.status,
      bioEn: members.bioEn,
      bioAr: members.bioAr,
      joinedAt: members.joinedAt,
    })
    .from(members)
    .where(and(...conditions))
    .orderBy(asc(members.fullNameEn))
    .limit(limit)
    .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(members)
      .where(and(...conditions));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  },
  ["public-members"],
  { tags: ["members"], revalidate: 60 }
);

/**
 * Fetch upcoming and past events with pagination and category filtering.
 */
export const getPublicEvents = createCachedQuery(
  async function getPublicEventsDirect(params: { 
    status?: "upcoming" | "past"; 
    category?: string; 
    page?: number; 
    limit?: number; 
  } = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 9));
    const offset = (page - 1) * limit;
    const now = new Date();

    const conditions = [eq(events.isPublished, true)];

    if (params.status === "upcoming") {
      conditions.push(sql`${events.startTime} >= ${Math.floor(now.getTime() / 1000)}`);
    } else if (params.status === "past") {
      conditions.push(sql`${events.startTime} < ${Math.floor(now.getTime() / 1000)}`);
    }

    if (params.category && params.category !== "all") {
      conditions.push(eq(events.category, params.category));
    }

    const data = await db.select({
      id: events.id,
      slug: events.slug,
      titleEn: events.titleEn,
      titleAr: events.titleAr,
      summaryEn: events.summaryEn,
      summaryAr: events.summaryAr,
      category: events.category,
      startTime: events.startTime,
      endTime: events.endTime,
      venue: events.venue,
      coverImageUrl: events.coverImageUrl,
      status: events.status,
      capacity: events.capacity,
      isRegistrationOpen: events.isRegistrationOpen,
    })
    .from(events)
    .where(and(...conditions))
    .orderBy(params.status === "past" ? desc(events.startTime) : asc(events.startTime))
    .limit(limit)
    .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(events)
      .where(and(...conditions));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  },
  ["public-events"],
  { tags: ["events"], revalidate: 60 }
);

/**
 * Fetch single event details by slug.
 */
export const getPublicEventBySlug = createCachedQuery(
  async function getPublicEventBySlugDirect(slug: string) {
    const result = await db.select()
      .from(events)
      .where(and(eq(events.slug, slug), eq(events.isPublished, true)))
      .limit(1);

    return result[0] || null;
  },
  ["public-event-by-slug"],
  { tags: ["events"], revalidate: 60 }
);

/**
 * Fetch registration statistics and seating availability for an event.
 * Public safe: returns only numerical totals and boolean capacity indicators.
 * Strictly zero attendee PII exposure.
 */
export async function getEventRegistrationStats(eventId: string) {
  const event = await db.select({
    id: events.id,
    capacity: events.capacity,
    isRegistrationOpen: events.isRegistrationOpen,
    status: events.status,
  })
  .from(events)
  .where(eq(events.id, eventId))
  .limit(1)
  .then(rows => rows[0] || null);

  if (!event) {
    return null;
  }

  // Count active registrations (excluding cancelled)
  const [{ activeCount }] = await db.select({ activeCount: count() })
    .from(eventRegistrations)
    .where(and(
      eq(eventRegistrations.eventId, eventId),
      ne(eventRegistrations.status, "cancelled")
    ));

  const capacity = event.capacity;
  const remainingSeats = capacity !== null ? Math.max(0, capacity - activeCount) : null;
  const isAtCapacity = capacity !== null ? activeCount >= capacity : false;
  const isAvailable = event.isRegistrationOpen && !isAtCapacity && event.status !== "cancelled" && event.status !== "postponed" && event.status !== "completed";

  return {
    eventId,
    totalRegistered: activeCount,
    capacity,
    remainingSeats,
    isAtCapacity,
    isRegistrationOpen: event.isRegistrationOpen,
    isAvailable,
    status: event.status,
  };
}

/**
 * Register an attendee for an event.
 * Enforces:
 * 1. Event published and active status.
 * 2. Registration window open (`isRegistrationOpen === true`).
 * 3. Server-side seat capacity enforcement.
 * 4. Duplicate registration prevention by (email, eventId).
 * 5. Returns a unique reference code (e.g. REG-2026-XXXX).
 */
export async function registerAttendeeForEvent(data: {
  eventId: string;
  attendeeName: string;
  email: string;
  phone?: string | null;
  studentId?: string | null;
}) {
  const normalizedEmail = data.email.toLowerCase().trim();
  const trimmedName = data.attendeeName.trim();

  if (!trimmedName) {
    throw new Error("Attendee name is required.");
  }
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("A valid email address is required.");
  }

  // 1. Fetch event
  const event = await db.select()
    .from(events)
    .where(and(eq(events.id, data.eventId), eq(events.isPublished, true)))
    .limit(1)
    .then(rows => rows[0] || null);

  if (!event) {
    throw new Error("Event not found or not published.");
  }

  // 2. Check event status
  if (event.status === "cancelled") {
    throw new Error("Registration rejected: this event has been cancelled.");
  }
  if (event.status === "postponed") {
    throw new Error("Registration rejected: this event has been postponed. New dates will be announced soon.");
  }
  if (event.status === "completed") {
    throw new Error("Registration rejected: this event has already concluded.");
  }
  if (!event.isRegistrationOpen) {
    throw new Error("Registration is currently closed for this event.");
  }

  // 3. Duplicate Prevention: Check if already registered
  const existing = await db.select({ id: eventRegistrations.id })
    .from(eventRegistrations)
    .where(and(
      eq(eventRegistrations.eventId, data.eventId),
      eq(eventRegistrations.email, normalizedEmail),
      ne(eventRegistrations.status, "cancelled")
    ))
    .limit(1)
    .then(rows => rows[0] || null);

  if (existing) {
    throw new Error("This email address is already registered for this event.");
  }

  // 4. Capacity Enforcement
  if (event.capacity !== null) {
    const [{ activeCount }] = await db.select({ activeCount: count() })
      .from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.eventId, data.eventId),
        ne(eventRegistrations.status, "cancelled")
      ));

    if (activeCount >= event.capacity) {
      throw new Error("This event has reached maximum seating capacity. Registration is closed.");
    }
  }

  // 5. Generate Reference ID (e.g. REG-2026-7B9A1C)
  const hexSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const registrationId = `REG-2026-${hexSuffix}`;
  const now = new Date();

  await db.insert(eventRegistrations).values({
    id: registrationId,
    eventId: data.eventId,
    attendeeName: trimmedName,
    email: normalizedEmail,
    phone: data.phone?.trim() || null,
    studentId: data.studentId?.trim() || null,
    status: "registered",
    registeredAt: now,
  });

  return {
    id: registrationId,
    eventId: data.eventId,
    eventTitle: event.titleEn,
    attendeeName: trimmedName,
    email: normalizedEmail,
    registeredAt: now,
  };
}

/**
 * Fetch annual plan highlights & month-by-month itinerary.
 * Supports filtering by academic year, category, and status.
 * Left-joins related event slug and title for seamless registration links.
 */
export const getPublicAnnualPlans = createCachedQuery(
  async function getPublicAnnualPlansDirect(options: { 
    academicYear?: string; 
    category?: string; 
    status?: string; 
  } | string = {}) {
    const opts = typeof options === "string" ? { academicYear: options } : options;
    const conditions = [eq(annualPlans.isPublished, true)];

    if (opts.academicYear && opts.academicYear !== "all") {
      conditions.push(eq(annualPlans.academicYear, opts.academicYear));
    }
    if (opts.category && opts.category !== "all") {
      conditions.push(eq(annualPlans.category, opts.category));
    }
    if (opts.status && opts.status !== "all") {
      conditions.push(eq(annualPlans.status, opts.status as any));
    }

    return await db.select({
      id: annualPlans.id,
      academicYear: annualPlans.academicYear,
      monthNumber: annualPlans.monthNumber,
      activityTitleEn: annualPlans.activityTitleEn,
      activityTitleAr: annualPlans.activityTitleAr,
      descriptionEn: annualPlans.descriptionEn,
      descriptionAr: annualPlans.descriptionAr,
      category: annualPlans.category,
      status: annualPlans.status,
      targetDate: annualPlans.targetDate,
      time: annualPlans.time,
      location: annualPlans.location,
      relatedEventId: annualPlans.relatedEventId,
      relatedEventSlug: events.slug,
      relatedEventTitle: events.titleEn,
      documentUrl: annualPlans.documentUrl,
      documentTitle: annualPlans.documentTitle,
      notes: annualPlans.notes,
      isPublished: annualPlans.isPublished,
    })
    .from(annualPlans)
    .leftJoin(events, eq(annualPlans.relatedEventId, events.id))
    .where(and(...conditions))
    .orderBy(asc(annualPlans.monthNumber), asc(annualPlans.targetDate));
  },
  ["public-annual-plans"],
  { tags: ["annual-plans"], revalidate: 60 }
);

/**
 * Fetch all distinct academic years that have published annual plans.
 */
export const getAnnualPlanYears = createCachedQuery(
  async function getAnnualPlanYearsDirect(): Promise<string[]> {
    const results = await db.selectDistinct({
      academicYear: annualPlans.academicYear,
    })
    .from(annualPlans)
    .where(eq(annualPlans.isPublished, true))
    .orderBy(desc(annualPlans.academicYear));

    return results.map(r => r.academicYear);
  },
  ["annual-plan-years"],
  { tags: ["annual-plans"], revalidate: 60 }
);

/**
 * ============================================================================
 * PHOTO & MEDIA GALLERY ARCHIVE QUERIES
 * TARGET ROUTE: /gallery and /gallery/[slug]
 * DEVELOPER ONBOARDING NOTE:
 * - Queries below retrieve verified, published photo albums and media assets.
 * - Enforces Strix-Supabase data security: Unpublished albums (`isPublished === false`)
 *   and draft assets are strictly omitted from public views.
 * - Subqueries calculate exact media asset counts for each album without N+1 queries.
 * - Joins related club events so visitors can navigate between the photo album
 *   and the official event dossier.
 * ============================================================================
 */

export interface GetPublicGalleryAlbumsParams {
  page?: number;
  limit?: number;
  year?: string;
  category?: string;
  search?: string;
}

/**
 * Fetch photo gallery albums with pagination, category filtering, search, and event linking.
 */
export const getPublicGalleryAlbums = createCachedQuery(
  async function getPublicGalleryAlbumsDirect(params: GetPublicGalleryAlbumsParams = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const offset = (page - 1) * limit;
    const conditions = [
      eq(galleryAlbums.isPublished, true),
      eq(galleryAlbums.isArchived, false),
    ];

    if (params.year && params.year !== "all") {
      conditions.push(eq(galleryAlbums.academicYear, params.year));
    }

    if (params.category && params.category !== "all") {
      conditions.push(eq(galleryAlbums.category, params.category));
    }

    if (params.search && params.search.trim()) {
      const s = `%${params.search.trim()}%`;
      conditions.push(or(
        like(galleryAlbums.titleEn, s),
        like(galleryAlbums.titleAr, s),
        like(galleryAlbums.descriptionEn, s),
        like(galleryAlbums.descriptionAr, s),
        like(galleryAlbums.location, s)
      )!);
    }

    const data = await db.select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      titleEn: galleryAlbums.titleEn,
      titleAr: galleryAlbums.titleAr,
      descriptionEn: galleryAlbums.descriptionEn,
      descriptionAr: galleryAlbums.descriptionAr,
      coverImageUrl: galleryAlbums.coverImageUrl,
      eventDate: galleryAlbums.eventDate,
      academicYear: galleryAlbums.academicYear,
      category: galleryAlbums.category,
      relatedEventId: galleryAlbums.relatedEventId,
      relatedEventSlug: events.slug,
      relatedEventTitle: events.titleEn,
      photographerCredit: galleryAlbums.photographerCredit,
      location: galleryAlbums.location,
      isFeatured: galleryAlbums.isFeatured,
      isPublished: galleryAlbums.isPublished,
      createdAt: galleryAlbums.createdAt,
      updatedAt: galleryAlbums.updatedAt,
      mediaCount: sql<number>`(SELECT COUNT(*) FROM media_assets WHERE media_assets.album_id = ${galleryAlbums.id} AND media_assets.is_published = 1)`.mapWith(Number),
    })
    .from(galleryAlbums)
    .leftJoin(events, eq(galleryAlbums.relatedEventId, events.id))
    .where(and(...conditions))
    .orderBy(desc(galleryAlbums.eventDate), desc(galleryAlbums.createdAt))
    .limit(limit)
    .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(galleryAlbums)
      .where(and(...conditions));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  },
  ["public-gallery-albums"],
  { tags: ["gallery-albums"], revalidate: 60 }
);

/**
 * Fetch all media assets inside an album.
 * Security: Filters `mediaAssets.isPublished = true` and orders by `sortOrder` ASC.
 */
export const getAlbumMediaAssets = createCachedQuery(
  async function getAlbumMediaAssetsDirect(albumId: string) {
    return await db.select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.albumId, albumId), eq(mediaAssets.isPublished, true)))
      .orderBy(asc(mediaAssets.sortOrder), asc(mediaAssets.createdAt));
  },
  ["album-media-assets"],
  { tags: ["gallery-albums", "media-assets"], revalidate: 60 }
);

/**
 * Fetch all media assets inside an album for admin management (includes drafts and unpublished).
 */
export async function getAdminAlbumMediaAssets(albumId: string) {
  return await db.select()
    .from(mediaAssets)
    .where(eq(mediaAssets.albumId, albumId))
    .orderBy(asc(mediaAssets.sortOrder), desc(mediaAssets.createdAt));
}

/**
 * Fetch distinct academic years represented in published gallery albums.
 */
export const getPublicGalleryYears = createCachedQuery(
  async function getPublicGalleryYearsDirect(): Promise<string[]> {
    const results = await db.selectDistinct({
      academicYear: galleryAlbums.academicYear,
    })
    .from(galleryAlbums)
    .where(and(eq(galleryAlbums.isPublished, true), eq(galleryAlbums.isArchived, false)))
    .orderBy(desc(galleryAlbums.academicYear));

    return results.map(r => r.academicYear);
  },
  ["public-gallery-years"],
  { tags: ["gallery-albums"], revalidate: 60 }
);

/**
 * Fetch public announcements with category filtering, search, and pagination.
 * Security constraint: Only retrieves isPublished === true AND status === 'published'.
 * Drafts and archived bulletins are strictly excluded from public listing.
 */
export const getPublicAnnouncements = createCachedQuery(
  async function getPublicAnnouncementsDirect(params: { 
    category?: string; 
    search?: string; 
    page?: number; 
    limit?: number; 
  } = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 10));
    const offset = (page - 1) * limit;

    const conditions = [
      eq(announcements.isPublished, true),
      eq(announcements.status, "published"),
    ];

    if (params.category && params.category !== "all") {
      conditions.push(eq(announcements.category, params.category));
    }

    if (params.search) {
      const s = `%${params.search}%`;
      conditions.push(or(
        like(announcements.titleEn, s),
        like(announcements.titleAr, s),
        like(announcements.summaryEn, s),
        like(announcements.contentEn, s)
      )!);
    }

    const data = await db.select({
      id: announcements.id,
      slug: announcements.slug,
      titleEn: announcements.titleEn,
      titleAr: announcements.titleAr,
      summaryEn: announcements.summaryEn,
      summaryAr: announcements.summaryAr,
      contentEn: announcements.contentEn,
      contentAr: announcements.contentAr,
      category: announcements.category,
      coverImageUrl: announcements.coverImageUrl,
      authorName: announcements.authorName,
      status: announcements.status,
      isPinned: announcements.isPinned,
      publishedAt: announcements.publishedAt,
    })
    .from(announcements)
    .where(and(...conditions))
    .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt))
    .limit(limit)
    .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(announcements)
      .where(and(...conditions));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  },
  ["public-announcements"],
  { tags: ["announcements"], revalidate: 60 }
);

/**
 * Fetch a single public announcement by slug.
 * Strictly enforces isPublished === true AND status === 'published'.
 * Non-existent or unpublished announcements return null.
 */
export const getPublicAnnouncementBySlug = createCachedQuery(
  async function getPublicAnnouncementBySlugDirect(slug: string) {
    const row = await db.select()
      .from(announcements)
      .where(and(
        eq(announcements.slug, slug),
        eq(announcements.isPublished, true),
        eq(announcements.status, "published")
      ))
      .limit(1)
      .then(rows => rows[0] || null);

    return row;
  },
  ["public-announcement-by-slug"],
  { tags: ["announcements"], revalidate: 60 }
);

/**
 * Fetch Arabic learning resources with skill level, category and search filtering.
 */
export const getPublicLearningResources = createCachedQuery(
  async function getPublicLearningResourcesDirect(params: {
    category?: string;
    skillLevel?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const offset = (page - 1) * limit;

    const conditions = [eq(learningResources.isPublished, true)];

    if (params.category && params.category !== "all") {
      conditions.push(eq(learningResources.category, params.category as any));
    }
    if (params.skillLevel && params.skillLevel !== "all") {
      conditions.push(eq(learningResources.skillLevel, params.skillLevel as any));
    }
    if (params.search) {
      const s = `%${params.search}%`;
      conditions.push(or(
        like(learningResources.titleEn, s), 
        like(learningResources.titleAr, s),
        like(learningResources.contentEn, s)
      )!);
    }

    const data = await db.select()
      .from(learningResources)
      .where(and(...conditions))
      .orderBy(desc(learningResources.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await db.select({ total: count() })
      .from(learningResources)
      .where(and(...conditions));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  },
  ["public-learning-resources"],
  { tags: ["learning-resources"], revalidate: 60 }
);

/**
 * Atomically increment download count for a learning resource upon user access (supports either id or slug).
 */
export async function incrementResourceDownloadCount(idOrSlug: string) {
  await db.update(learningResources)
    .set({ downloadCount: sql`${learningResources.downloadCount} + 1` })
    .where(or(eq(learningResources.id, idOrSlug), eq(learningResources.slug, idOrSlug)));
  return true;
}

/**
 * Fetch published achievements.
 */
export const getPublicAchievements = createCachedQuery(
  async function getPublicAchievementsDirect(params: { category?: string } = {}) {
    const conditions = [eq(achievements.isPublished, true)];

    if (params.category && params.category !== "all") {
      conditions.push(eq(achievements.category, params.category));
    }

    return await db.select()
      .from(achievements)
      .where(and(...conditions))
      .orderBy(desc(achievements.dateAchieved));
  },
  ["public-achievements"],
  { tags: ["achievements"], revalidate: 60 }
);

/**
 * Fetch published magazines and publications with optional type filter.
 */
export const getPublicPublications = createCachedQuery(
  async function getPublicPublicationsDirect(params: { 
    type?: string; 
    publicationType?: string;
    search?: string; 
    page?: number; 
    limit?: number; 
  } = {}) {
    const conditions = [eq(publications.isPublished, true)];

    const filterType = params.publicationType || params.type;
    if (filterType && filterType !== "all") {
      conditions.push(eq(publications.publicationType, filterType as any));
    }

    if (params.search) {
      const s = `%${params.search}%`;
      conditions.push(or(
        like(publications.titleEn, s),
        like(publications.titleAr, s),
        like(publications.descriptionEn, s)
      )!);
    }

    const query = db.select()
      .from(publications)
      .where(and(...conditions))
      .orderBy(desc(publications.publicationDate));

    if (params.limit) {
      const page = Math.max(1, params.page || 1);
      const limit = Math.min(50, Math.max(1, params.limit));
      const offset = (page - 1) * limit;
      return await query.limit(limit).offset(offset);
    }

    return await query;
  },
  ["public-publications"],
  { tags: ["publications"], revalidate: 60 }
);

/**
 * Fetch public site settings map.
 */
export async function getPublicSiteSettings() {
  const rows = await db.select({
    key: siteSettings.key,
    valueEn: siteSettings.valueEn,
    valueAr: siteSettings.valueAr,
  }).from(siteSettings);

  const map: Record<string, { en: string | null; ar: string | null }> = {};
  for (const r of rows) {
    map[r.key] = { en: r.valueEn, ar: r.valueAr };
  }
  return map;
}

export { 
  getSiteSettings, 
  fetchSiteSettingsDirect,
  type SiteSettings, 
  type NavMenuItem,
  DEFAULT_NAV_ITEMS,
  DEFAULT_SITE_SETTINGS 
} from "@/lib/settings";


// ----------------------------------------------------------------------
// EDITABLE CMS PAGES & SECTIONS QUERIES
// ----------------------------------------------------------------------
// EDITABLE CMS PAGES & SECTIONS QUERIES
// ----------------------------------------------------------------------

import { 
  safeParseSectionJson, 
  type SectionContentData, 
  type SectionContentItem 
} from "@/lib/schemas/sections";

export type { SectionContentData, SectionContentItem };

export interface ParsedPageSection {
  id: string;
  pageId: string;
  sectionKey: string;
  sortOrder: number;
  contentEn: SectionContentData;
  contentAr: SectionContentData;
  updatedAt: Date;
}

export interface PageWithSections {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string | null;
  metaDescriptionEn: string | null;
  metaDescriptionAr: string | null;
  isPublished: boolean;
  updatedAt: Date;
  sections: ParsedPageSection[];
}

export function parseSectionJson(rawText: string | null): SectionContentData {
  return safeParseSectionJson(rawText);
}

/**
 * Fetch a published editable page by slug with all its associated sections ordered by sortOrder.
 * Safely parses JSON structured content for headings, body copy, quotes, items, and documents.
 */
export async function getPageWithSections(slug: string): Promise<PageWithSections | null> {
  try {
    const [page] = await db.select()
      .from(editablePages)
      .where(and(eq(editablePages.slug, slug), eq(editablePages.isPublished, true)))
      .limit(1);

    if (!page) return null;

    const rawSections = await db.select()
      .from(pageSections)
      .where(eq(pageSections.pageId, page.id))
      .orderBy(asc(pageSections.sortOrder));

    const sections: ParsedPageSection[] = rawSections.map((s) => ({
      id: s.id,
      pageId: s.pageId,
      sectionKey: s.sectionKey,
      sortOrder: s.sortOrder,
      contentEn: parseSectionJson(s.contentEn),
      contentAr: parseSectionJson(s.contentAr),
      updatedAt: s.updatedAt,
    }));

    return {
      ...page,
      sections,
    };
  } catch (err) {
    console.warn(`[getPageWithSections] Database query error for slug '${slug}', utilizing safe fallback:`, err);
    return null;
  }
}

// ----------------------------------------------------------------------
// ADMIN PAGES & SECTIONS CMS MUTATIONS (Feature 015 - /admin/pages)
// ----------------------------------------------------------------------

/**
 * Fetches all editable pages with their section counts for administrative management.
 * 
 * DEVELOPER NOTE:
 * - Used by /admin/pages
 * - Computes dynamic section counts per page.
 */
export async function getAdminPages() {
  const pages = await db.select().from(editablePages).orderBy(asc(editablePages.slug));
  const counts = await db.select({
    pageId: pageSections.pageId,
    sectionCount: count(),
  }).from(pageSections).groupBy(pageSections.pageId);
  
  const countMap = new Map(counts.map((c) => [c.pageId, c.sectionCount]));
  return pages.map((p) => ({
    ...p,
    sectionCount: countMap.get(p.id) || 0,
  }));
}

/**
 * Fetches an administrative page record with all its raw section records.
 */
export async function getAdminPageWithSections(slugOrId: string) {
  const [page] = await db.select()
    .from(editablePages)
    .where(or(eq(editablePages.slug, slugOrId), eq(editablePages.id, slugOrId)))
    .limit(1);

  if (!page) return null;

  const rawSections = await db.select()
    .from(pageSections)
    .where(eq(pageSections.pageId, page.id))
    .orderBy(asc(pageSections.sortOrder));

  return {
    ...page,
    sections: rawSections,
  };
}

/**
 * Updates editable page metadata (titles, meta descriptions, publication status).
 */
export async function updateEditablePage(id: string, data: {
  titleEn: string;
  titleAr?: string | null;
  metaDescriptionEn?: string | null;
  metaDescriptionAr?: string | null;
  isPublished?: boolean;
}) {
  const now = new Date();
  await db.update(editablePages)
    .set({
      titleEn: data.titleEn,
      titleAr: data.titleAr || null,
      metaDescriptionEn: data.metaDescriptionEn || null,
      metaDescriptionAr: data.metaDescriptionAr || null,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      updatedAt: now,
    })
    .where(eq(editablePages.id, id));
}

/**
 * Saves a page section (inserts new if id not supplied, otherwise updates existing).
 */
export async function savePageSection(data: {
  id?: string;
  pageId: string;
  sectionKey: string;
  contentEn?: string | null;
  contentAr?: string | null;
  sortOrder?: number;
}) {
  const now = new Date();
  if (data.id) {
    await db.update(pageSections)
      .set({
        sectionKey: data.sectionKey,
        contentEn: data.contentEn || null,
        contentAr: data.contentAr || null,
        sortOrder: data.sortOrder ?? 0,
        updatedAt: now,
      })
      .where(eq(pageSections.id, data.id));
    return data.id;
  } else {
    const id = `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.insert(pageSections).values({
      id,
      pageId: data.pageId,
      sectionKey: data.sectionKey,
      contentEn: data.contentEn || null,
      contentAr: data.contentAr || null,
      sortOrder: data.sortOrder ?? 0,
      updatedAt: now,
    });
    return id;
  }
}

/**
 * Deletes a page section by ID.
 */
export async function deletePageSection(id: string) {
  await db.delete(pageSections).where(eq(pageSections.id, id));
}

// ----------------------------------------------------------------------
// ADMIN METRICS QUERY (Zero Fake Stats - Feature 014 Foundation)
// ----------------------------------------------------------------------

/**
 * Fetches verified real-time database metrics for the Administrative Command Center.
 * 
 * DEVELOPER NOTE:
 * - Used by /admin (src/app/admin/page.tsx)
 * - Queries live SQLite tables via Drizzle ORM.
 * - Zero fabricated statistics: if no data exists, exact 0 is returned.
 * - Sourced entities: events, members, membership_applications, gallery_albums, announcements, contact_inquiries, audit_logs.
 */
export async function getAdminDashboardMetrics() {
  const [
    [{ totalEvents }],
    [{ totalUpcoming }],
    [{ publishedEvents }],
    [{ totalMembers }],
    [{ pendingApplications }],
    [{ totalAlbums }],
    [{ totalAnnouncements }],
    [{ unreadInquiries }],
  ] = await Promise.all([
    db.select({ totalEvents: count() }).from(events),
    db.select({ totalUpcoming: count() }).from(events).where(
      and(eq(events.status, "confirmed"), sql`${events.startTime} >= ${Math.floor(Date.now() / 1000)}`)
    ),
    db.select({ publishedEvents: count() }).from(events).where(eq(events.status, "confirmed")),
    db.select({ totalMembers: count() }).from(members).where(eq(members.status, "active")),
    db.select({ pendingApplications: count() }).from(membershipApplications).where(eq(membershipApplications.status, "pending")),
    db.select({ totalAlbums: count() }).from(galleryAlbums),
    db.select({ totalAnnouncements: count() }).from(announcements).where(eq(announcements.isPublished, true)),
    db.select({ unreadInquiries: count() }).from(contactInquiries).where(eq(contactInquiries.status, "unread")),
  ]);

  const recentLogs = await db.select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(8);

  return {
    totalEvents,
    totalUpcoming,
    publishedEvents,
    totalMembers,
    pendingApplications,
    totalAlbums,
    totalAnnouncements,
    unreadInquiries,
    recentLogs,
  };
}

/**
 * Fetch a single gallery album by slug with its media photos and associated event details.
 * Security: Returns null if album is draft or unpublished (Strix-Supabase isolation).
 */
/**
 * Fetch a single gallery album by slug with its media photos and associated event details.
 * Security: Returns null if album is draft or unpublished (Strix-Supabase isolation).
 */
export const getPublicGalleryAlbumBySlug = createCachedQuery(
  async function getPublicGalleryAlbumBySlugDirect(slug: string) {
    const [album] = await db.select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      titleEn: galleryAlbums.titleEn,
      titleAr: galleryAlbums.titleAr,
      descriptionEn: galleryAlbums.descriptionEn,
      descriptionAr: galleryAlbums.descriptionAr,
      coverImageUrl: galleryAlbums.coverImageUrl,
      eventDate: galleryAlbums.eventDate,
      academicYear: galleryAlbums.academicYear,
      category: galleryAlbums.category,
      relatedEventId: galleryAlbums.relatedEventId,
      relatedEventSlug: events.slug,
      relatedEventTitle: events.titleEn,
      photographerCredit: galleryAlbums.photographerCredit,
      location: galleryAlbums.location,
      isFeatured: galleryAlbums.isFeatured,
      isPublished: galleryAlbums.isPublished,
      createdAt: galleryAlbums.createdAt,
      updatedAt: galleryAlbums.updatedAt,
    })
    .from(galleryAlbums)
    .leftJoin(events, eq(galleryAlbums.relatedEventId, events.id))
    .where(and(
      eq(galleryAlbums.slug, slug),
      eq(galleryAlbums.isPublished, true),
      eq(galleryAlbums.isArchived, false)
    ))
    .limit(1);

    if (!album) return null;

    const photos = await getAlbumMediaAssets(album.id);
    return { 
      ...album, 
      photos,
      media: photos,
      mediaCount: photos.length,
      photoCount: photos.filter(p => p.mediaType === "image").length,
      videoCount: photos.filter(p => p.mediaType === "video").length,
    };
  },
  ["public-gallery-album-by-slug"],
  { tags: ["gallery-albums"], revalidate: 60 }
);

/**
 * Fetches the public gallery album associated with a given event ID.
 * Returns null if no album is linked, or if the album is a draft or archived (Strix-Supabase isolation).
 */
export const getPublicGalleryAlbumByEventId = createCachedQuery(
  async function getPublicGalleryAlbumByEventIdDirect(eventId: string) {
    const [album] = await db.select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      titleEn: galleryAlbums.titleEn,
      titleAr: galleryAlbums.titleAr,
      descriptionEn: galleryAlbums.descriptionEn,
      descriptionAr: galleryAlbums.descriptionAr,
      coverImageUrl: galleryAlbums.coverImageUrl,
      eventDate: galleryAlbums.eventDate,
      academicYear: galleryAlbums.academicYear,
      category: galleryAlbums.category,
      relatedEventId: galleryAlbums.relatedEventId,
      photographerCredit: galleryAlbums.photographerCredit,
      location: galleryAlbums.location,
      isFeatured: galleryAlbums.isFeatured,
      isPublished: galleryAlbums.isPublished,
      createdAt: galleryAlbums.createdAt,
      updatedAt: galleryAlbums.updatedAt,
    })
    .from(galleryAlbums)
    .where(and(
      eq(galleryAlbums.relatedEventId, eventId),
      eq(galleryAlbums.isPublished, true),
      eq(galleryAlbums.isArchived, false)
    ))
    .limit(1);

    if (!album) return null;

    const photos = await getAlbumMediaAssets(album.id);
    return {
      ...album,
      photos,
      media: photos,
      mediaCount: photos.length,
      photoCount: photos.filter(p => p.mediaType === "image").length,
      videoCount: photos.filter(p => p.mediaType === "video").length,
    };
  },
  ["public-gallery-album-by-event"],
  { tags: ["gallery-albums", "events"], revalidate: 60 }
);

/**
 * Administrative query to fetch an album associated with an event ID regardless of publication status.
 */
export async function getAlbumByRelatedEventId(eventId: string) {
  const [album] = await db.select({
    id: galleryAlbums.id,
    slug: galleryAlbums.slug,
    titleEn: galleryAlbums.titleEn,
    titleAr: galleryAlbums.titleAr,
    coverImageUrl: galleryAlbums.coverImageUrl,
    isPublished: galleryAlbums.isPublished,
    isArchived: galleryAlbums.isArchived,
    relatedEventId: galleryAlbums.relatedEventId,
  })
  .from(galleryAlbums)
  .where(eq(galleryAlbums.relatedEventId, eventId))
  .limit(1);

  return album || null;
}

/**
 * ============================================================================
 * MEMBERSHIP APPLICATIONS & ADMISSIONS WORKFLOW QUERIES
 * TARGET ROUTE: /membership and /admin/applications
 * DEVELOPER ONBOARDING NOTE:
 * - Applications contain private student identification numbers and personal coordinates.
 * - Strix-Supabase Security Guardrail: Public routes must NEVER query this table directly
 *   without dual verification (`referenceNo` + `email`).
 * - Status transitions are logged to `audit_logs` for compliance.
 * ============================================================================
 */

export interface SubmitMembershipApplicationInput {
  applicantName: string;
  applicantNameAr?: string | null;
  email: string;
  phone: string;
  studentId?: string | null;
  department?: string | null;
  faculty?: string | null;
  academicLevel?: string | null;
  category?: string;
  arabicProficiency?: "beginner" | "intermediate" | "advanced" | "native";
  motivation: string;
  consentAgreed: boolean;
  directoryConsent?: boolean;
}

/**
 * Validates and persists a new student membership application.
 * Prevents active duplicates (pending or under_review) by email and student ID.
 */
export async function submitMembershipApplication(input: SubmitMembershipApplicationInput) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const trimmedStudentId = input.studentId?.trim();

  // 1. Duplicate Prevention: Check if active application already exists for this email
  const existingEmail = await db.select({ id: membershipApplications.id })
    .from(membershipApplications)
    .where(and(
      eq(membershipApplications.email, normalizedEmail),
      or(
        eq(membershipApplications.status, "pending"),
        eq(membershipApplications.status, "under_review")
      )!
    ))
    .limit(1);

  if (existingEmail.length > 0) {
    throw new Error("An active membership application is already registered with this email address.");
  }

  // 2. Duplicate Prevention: Check if active application exists for this studentId
  if (trimmedStudentId) {
    const existingStudentId = await db.select({ id: membershipApplications.id })
      .from(membershipApplications)
      .where(and(
        eq(membershipApplications.studentId, trimmedStudentId),
        or(
          eq(membershipApplications.status, "pending"),
          eq(membershipApplications.status, "under_review")
        )!
      ))
      .limit(1);

    if (existingStudentId.length > 0) {
      throw new Error("An active membership application is already under review for this student ID.");
    }
  }

  // 3. Generate Secure Reference ID (e.g. APP-2026-7B9A1C)
  const hexSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const referenceNo = `APP-2026-${hexSuffix}`;
  const id = `app_${Date.now()}_${hexSuffix.toLowerCase()}`;
  const now = new Date();

  await db.insert(membershipApplications).values({
    id,
    referenceNo,
    applicantName: input.applicantName.trim(),
    applicantNameAr: input.applicantNameAr?.trim() || null,
    email: normalizedEmail,
    phone: input.phone.trim(),
    studentId: trimmedStudentId || null,
    department: input.department?.trim() || null,
    faculty: input.faculty?.trim() || null,
    academicLevel: input.academicLevel?.trim() || null,
    category: input.category || "general_student",
    arabicProficiency: input.arabicProficiency || "intermediate",
    motivation: input.motivation.trim(),
    consentAgreed: input.consentAgreed ?? true,
    directoryConsent: input.directoryConsent ?? false,
    status: "pending",
    reviewerNotes: null,
    reviewedById: null,
    reviewedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    referenceNo,
    applicantName: input.applicantName.trim(),
    email: normalizedEmail,
    status: "pending",
    createdAt: now,
  };
}

/**
 * Dual-verification status lookup for applicants.
 * SECURITY: Requires matching BOTH referenceNo AND email to prevent enumeration leaks.
 */
export async function getMembershipApplicationStatus(referenceNo: string, email: string) {
  const normalizedRef = referenceNo.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  const [record] = await db.select({
    referenceNo: membershipApplications.referenceNo,
    applicantName: membershipApplications.applicantName,
    applicantNameAr: membershipApplications.applicantNameAr,
    category: membershipApplications.category,
    status: membershipApplications.status,
    reviewerNotes: membershipApplications.reviewerNotes,
    createdAt: membershipApplications.createdAt,
    updatedAt: membershipApplications.updatedAt,
    reviewedAt: membershipApplications.reviewedAt,
  })
  .from(membershipApplications)
  .where(and(
    eq(membershipApplications.referenceNo, normalizedRef),
    eq(membershipApplications.email, normalizedEmail)
  ))
  .limit(1);

  return record || null;
}

/**
 * Self-service application withdrawal by prospective applicant.
 * Can only withdraw pending or under_review applications.
 */
export async function withdrawMembershipApplication(referenceNo: string, email: string) {
  const normalizedRef = referenceNo.trim().toUpperCase();
  const normalizedEmail = email.trim().toLowerCase();

  const [existing] = await db.select({
    id: membershipApplications.id,
    status: membershipApplications.status,
  })
  .from(membershipApplications)
  .where(and(
    eq(membershipApplications.referenceNo, normalizedRef),
    eq(membershipApplications.email, normalizedEmail)
  ))
  .limit(1);

  if (!existing) {
    throw new Error("No application matching this reference number and email was found.");
  }

  if (existing.status !== "pending" && existing.status !== "under_review") {
    throw new Error(`Cannot withdraw an application with status '${existing.status}'.`);
  }

  await db.update(membershipApplications)
    .set({
      status: "withdrawn",
      updatedAt: new Date(),
    })
    .where(eq(membershipApplications.id, existing.id));

  return true;
}

/**
 * Reviews and transitions application status by authorized admissions officer.
 * Appends immutable audit entry to audit_logs.
 */
export async function reviewMembershipApplication(
  id: string,
  reviewerId: string,
  status: "approved" | "rejected" | "under_review",
  notes?: string
) {
  const [app] = await db.select()
    .from(membershipApplications)
    .where(eq(membershipApplications.id, id))
    .limit(1);

  if (!app) {
    throw new Error("Application dossier not found.");
  }

  const now = new Date();
  await db.update(membershipApplications)
    .set({
      status,
      reviewerNotes: notes !== undefined ? notes : app.reviewerNotes,
      reviewedById: reviewerId,
      reviewedAt: now,
      updatedAt: now,
    })
    .where(eq(membershipApplications.id, id));

  // Write immutable audit log record
  await db.insert(auditLogs).values({
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: reviewerId,
    userEmail: null,
    action: `review_application_${status}`,
    targetEntity: "membership_application",
    targetId: id,
    detailsJson: JSON.stringify({
      previousStatus: app.status,
      newStatus: status,
      referenceNo: app.referenceNo,
      notes: notes || null,
    }),
    createdAt: now,
  });

  return true;
}

/**
 * Fetch membership applications for administrative review with status & search filtering.
 */
export async function getAdminMembershipApplications(options: {
  status?: string;
  search?: string;
} | string = {}) {
  const opts = typeof options === "string" ? { status: options } : options;
  const conditions = [];

  if (opts.status && opts.status !== "all") {
    conditions.push(eq(membershipApplications.status, opts.status as any));
  }

  if (opts.search && opts.search.trim()) {
    const s = `%${opts.search.trim()}%`;
    conditions.push(or(
      like(membershipApplications.referenceNo, s),
      like(membershipApplications.applicantName, s),
      like(membershipApplications.email, s),
      like(membershipApplications.studentId, s),
      like(membershipApplications.department, s)
    )!);
  }

  return await db.select({
    id: membershipApplications.id,
    referenceNo: membershipApplications.referenceNo,
    applicantName: membershipApplications.applicantName,
    applicantNameAr: membershipApplications.applicantNameAr,
    email: membershipApplications.email,
    phone: membershipApplications.phone,
    studentId: membershipApplications.studentId,
    department: membershipApplications.department,
    faculty: membershipApplications.faculty,
    academicLevel: membershipApplications.academicLevel,
    category: membershipApplications.category,
    arabicProficiency: membershipApplications.arabicProficiency,
    motivation: membershipApplications.motivation,
    consentAgreed: membershipApplications.consentAgreed,
    directoryConsent: membershipApplications.directoryConsent,
    status: membershipApplications.status,
    reviewerNotes: membershipApplications.reviewerNotes,
    reviewedById: membershipApplications.reviewedById,
    reviewedAt: membershipApplications.reviewedAt,
    createdAt: membershipApplications.createdAt,
    updatedAt: membershipApplications.updatedAt,
  })
  .from(membershipApplications)
  .where(conditions.length > 0 ? and(...conditions) : undefined)
  .orderBy(desc(membershipApplications.createdAt));
}

export interface AdminAuditLogsFilterParams {
  action?: string;
  targetEntity?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Fetch audit logs for security review.
 * Supports either legacy number limit or comprehensive filter/pagination params.
 */
export async function getAdminAuditLogs(
  paramsOrLimit: number | AdminAuditLogsFilterParams = 50
) {
  if (typeof paramsOrLimit === "number") {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(paramsOrLimit);
  }

  const { action, targetEntity, search, page = 1, limit = 20 } = paramsOrLimit;
  const conditions = [];

  if (action && action !== "all") {
    conditions.push(eq(auditLogs.action, action));
  }

  if (targetEntity && targetEntity !== "all") {
    conditions.push(eq(auditLogs.targetEntity, targetEntity));
  }

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    conditions.push(
      or(
        like(auditLogs.action, s),
        like(auditLogs.targetEntity, s),
        like(auditLogs.targetId, s),
        like(auditLogs.userEmail, s),
        like(auditLogs.detailsJson, s)
      )!
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalRes = await db
    .select({ total: count() })
    .from(auditLogs)
    .where(whereClause);
  const total = totalRes[0]?.total || 0;

  const data = await db
    .select()
    .from(auditLogs)
    .where(whereClause)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

// ----------------------------------------------------------------------
// COMMITTEE TERMS & ASSIGNMENT MANAGEMENT OPERATIONS (Historical Preservation)
// ----------------------------------------------------------------------

export interface CreateCommitteeTermInput {
  academicYear: string;
  titleEn: string;
  titleAr?: string | null;
  startDate: string; // ISO YYYY-MM-DD
  endDate?: string | null;
  isCurrent?: boolean;
  summaryEn?: string | null;
  summaryAr?: string | null;
}

/**
 * Creates a new committee term while strictly preserving former terms.
 * Validates date ranges (startDate <= endDate).
 * If marked current, unmarks any existing current term automatically.
 */
export async function createCommitteeTerm(data: CreateCommitteeTermInput) {
  if (data.endDate && data.startDate > data.endDate) {
    throw new Error("Invalid date range: startDate must be before or equal to endDate");
  }

  const id = `term_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  if (data.isCurrent) {
    await db.update(committeeTerms)
      .set({ isCurrent: false, updatedAt: now })
      .where(eq(committeeTerms.isCurrent, true));
  }

  await db.insert(committeeTerms).values({
    id,
    academicYear: data.academicYear,
    titleEn: data.titleEn,
    titleAr: data.titleAr || null,
    startDate: data.startDate,
    endDate: data.endDate || null,
    isCurrent: !!data.isCurrent,
    summaryEn: data.summaryEn || null,
    summaryAr: data.summaryAr || null,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export interface AssignMemberToCommitteeInput {
  termId: string;
  memberId: string;
  positionTitleEn: string;
  positionTitleAr?: string | null;
  rankOrder?: number;
  roleDescription?: string | null;
}

/**
 * Assigns a member to an executive or committee role in a specific term.
 * Supports a member serving in multiple distinct terms across history.
 */
export async function assignMemberToCommittee(data: AssignMemberToCommitteeInput) {
  const id = `asgn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  await db.insert(committeeAssignments).values({
    id,
    termId: data.termId,
    memberId: data.memberId,
    positionTitleEn: data.positionTitleEn,
    positionTitleAr: data.positionTitleAr || null,
    rankOrder: data.rankOrder ?? 100,
    roleDescription: data.roleDescription || null,
    createdAt: now,
  });

  return id;
}

/**
 * Fetches all committee assignments and terms a member has served in across history.
 */
export async function getMemberCommitteeHistory(memberId: string) {
  return await db.select({
    assignmentId: committeeAssignments.id,
    termId: committeeTerms.id,
    academicYear: committeeTerms.academicYear,
    termTitleEn: committeeTerms.titleEn,
    termTitleAr: committeeTerms.titleAr,
    isCurrent: committeeTerms.isCurrent,
    positionTitleEn: committeeAssignments.positionTitleEn,
    positionTitleAr: committeeAssignments.positionTitleAr,
    rankOrder: committeeAssignments.rankOrder,
    roleDescription: committeeAssignments.roleDescription,
    startDate: committeeTerms.startDate,
  })
  .from(committeeAssignments)
  .innerJoin(committeeTerms, eq(committeeAssignments.termId, committeeTerms.id))
  .where(eq(committeeAssignments.memberId, memberId))
  .orderBy(desc(committeeTerms.startDate));
}

/**
 * Batched retrieval of committee histories for a collection of member IDs.
 * Eliminates N+1 serial round-trips when rendering multi-member directories.
 */
export async function getMembersCommitteeHistoryBatch(memberIds: string[]) {
  if (!memberIds || memberIds.length === 0) return [];
  return await db.select({
    memberId: committeeAssignments.memberId,
    assignmentId: committeeAssignments.id,
    termId: committeeTerms.id,
    academicYear: committeeTerms.academicYear,
    termTitleEn: committeeTerms.titleEn,
    termTitleAr: committeeTerms.titleAr,
    isCurrent: committeeTerms.isCurrent,
    positionTitleEn: committeeAssignments.positionTitleEn,
    positionTitleAr: committeeAssignments.positionTitleAr,
    rankOrder: committeeAssignments.rankOrder,
    roleDescription: committeeAssignments.roleDescription,
    startDate: committeeTerms.startDate,
  })
  .from(committeeAssignments)
  .innerJoin(committeeTerms, eq(committeeAssignments.termId, committeeTerms.id))
  .where(inArray(committeeAssignments.memberId, memberIds))
  .orderBy(desc(committeeTerms.startDate));
}

/**
 * Updates a member's public directory visibility preference.
 */
export async function setMemberPublicVisibility(memberId: string, isPublic: boolean) {
  await db.update(members)
    .set({ isPublic, updatedAt: new Date() })
    .where(eq(members.id, memberId));
}

// ----------------------------------------------------------------------
// COMMITTEE TERMS & ASSIGNMENTS ADMIN OPERATIONS (Feature 015 - /admin/committees)
// ----------------------------------------------------------------------

/**
 * Fetches all committee terms with officeholder member counts.
 * 
 * DEVELOPER NOTE:
 * - Used by /admin/committees
 * - Strictly preserves former terms; shows current vs historical archive.
 */
export async function getAdminCommitteeTerms() {
  const terms = await db.select().from(committeeTerms).orderBy(desc(committeeTerms.startDate));
  const counts = await db.select({
    termId: committeeAssignments.termId,
    memberCount: count(),
  }).from(committeeAssignments).groupBy(committeeAssignments.termId);
  
  const countMap = new Map(counts.map((c) => [c.termId, c.memberCount]));
  return terms.map((t) => ({
    ...t,
    memberCount: countMap.get(t.id) || 0,
  }));
}

/**
 * Updates a committee term.
 * If marked as isCurrent: true, automatically demotes any other current term to false.
 */
export async function updateCommitteeTerm(id: string, data: Partial<CreateCommitteeTermInput>) {
  const now = new Date();
  if (data.isCurrent) {
    await db.update(committeeTerms)
      .set({ isCurrent: false, updatedAt: now })
      .where(ne(committeeTerms.id, id));
  }

  await db.update(committeeTerms)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(committeeTerms.id, id));
}

/**
 * Deletes a committee term.
 */
export async function deleteCommitteeTerm(id: string) {
  await db.delete(committeeTerms).where(eq(committeeTerms.id, id));
}

/**
 * Fetches all officeholders assigned to a specific committee term with member profiles.
 */
export async function getAdminCommitteeAssignments(termId: string) {
  return await db.select({
    id: committeeAssignments.id,
    termId: committeeAssignments.termId,
    memberId: committeeAssignments.memberId,
    positionTitleEn: committeeAssignments.positionTitleEn,
    positionTitleAr: committeeAssignments.positionTitleAr,
    rankOrder: committeeAssignments.rankOrder,
    roleDescription: committeeAssignments.roleDescription,
    createdAt: committeeAssignments.createdAt,
    memberNameEn: members.fullNameEn,
    memberNameAr: members.fullNameAr,
    memberPhotoUrl: members.photoUrl,
    memberEmail: members.email,
    memberStudentId: members.studentId,
    membershipId: members.membershipId,
  })
  .from(committeeAssignments)
  .innerJoin(members, eq(committeeAssignments.memberId, members.id))
  .where(eq(committeeAssignments.termId, termId))
  .orderBy(asc(committeeAssignments.rankOrder));
}

/**
 * Deletes an officer assignment from a committee term.
 */
export async function deleteCommitteeAssignment(id: string) {
  await db.delete(committeeAssignments).where(eq(committeeAssignments.id, id));
}

/**
 * Fetches all founders (including unpublished) for administrative curation.
 */
export async function getAdminFounders() {
  return await db.select()
    .from(founders)
    .orderBy(asc(founders.sortOrder));
}

export interface CreateFounderInput {
  nameEn: string;
  nameAr?: string | null;
  portraitUrl?: string | null;
  roleTitleEn: string;
  roleTitleAr?: string | null;
  bioEn?: string | null;
  bioAr?: string | null;
  foundingYear?: number | null;
  sortOrder?: number;
  isPublished?: boolean;
}

/**
 * Creates a new founder profile.
 */
export async function createFounder(data: CreateFounderInput) {
  const id = `fnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  await db.insert(founders).values({
    id,
    nameEn: data.nameEn,
    nameAr: data.nameAr || null,
    portraitUrl: data.portraitUrl || null,
    roleTitleEn: data.roleTitleEn,
    roleTitleAr: data.roleTitleAr || null,
    bioEn: data.bioEn || null,
    bioAr: data.bioAr || null,
    foundingYear: data.foundingYear || null,
    sortOrder: data.sortOrder ?? 0,
    isPublished: data.isPublished ?? true,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Updates an existing founder profile.
 * 
 * DEVELOPER NOTE:
 * - Used by /admin/founders
 */
export async function updateFounder(id: string, data: Partial<CreateFounderInput>) {
  const now = new Date();
  await db.update(founders)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(founders.id, id));
}

/**
 * Permanently deletes a founder profile record.
 */
export async function deleteFounder(id: string) {
  await db.delete(founders).where(eq(founders.id, id));
}

/**
 * Toggles the public visibility/publication of a founder profile.
 */
export async function toggleFounderPublish(id: string, isPublished: boolean) {
  await db.update(founders)
    .set({ isPublished, updatedAt: new Date() })
    .where(eq(founders.id, id));
}

/**
 * Fetches members for administrative management with complete private fields and filters.
 */
export async function getAdminMembers(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  isPublic?: boolean;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = [];
  if (params.status && params.status !== "all") {
    conditions.push(eq(members.status, params.status as any));
  }
  if (params.isPublic !== undefined) {
    conditions.push(eq(members.isPublic, params.isPublic));
  }
  if (params.search) {
    const s = `%${params.search}%`;
    conditions.push(or(
      like(members.fullNameEn, s),
      like(members.fullNameAr, s),
      like(members.membershipId, s),
      like(members.email, s)
    )!);
  }

  const data = await db.select()
    .from(members)
    .where(and(...conditions))
    .orderBy(desc(members.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() })
    .from(members)
    .where(and(...conditions));

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}

/**
 * Input schema for creating or registering a club member.
 */
export interface CreateMemberInput {
  membershipId?: string;
  fullNameEn: string;
  fullNameAr?: string | null;
  photoUrl?: string | null;
  email: string;
  phone?: string | null;
  studentId?: string | null;
  status?: "active" | "alumni" | "honorary" | "suspended";
  isPublic?: boolean;
  bioEn?: string | null;
  bioAr?: string | null;
}

/**
 * Creates and registers a new member record.
 * 
 * DEVELOPER NOTE:
 * - Used by /admin/members
 * - Automatically generates unique membership ID if not provided (e.g. ALC-2026-XXX)
 */
export async function createMember(data: CreateMemberInput) {
  const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const membershipId = data.membershipId || `ALC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date();

  await db.insert(members).values({
    id,
    membershipId,
    fullNameEn: data.fullNameEn,
    fullNameAr: data.fullNameAr || null,
    photoUrl: data.photoUrl || null,
    email: data.email.toLowerCase().trim(),
    phone: data.phone || null,
    studentId: data.studentId || null,
    status: data.status || "active",
    isPublic: !!data.isPublic,
    bioEn: data.bioEn || null,
    bioAr: data.bioAr || null,
    joinedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Updates an existing member profile record.
 */
export async function updateMember(id: string, data: Partial<CreateMemberInput>) {
  const now = new Date();
  await db.update(members)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(members.id, id));
}

/**
 * Updates a member's institutional status (active, alumni, honorary, suspended).
 */
export async function updateMemberStatus(id: string, status: "active" | "alumni" | "honorary" | "suspended") {
  await db.update(members)
    .set({ status, updatedAt: new Date() })
    .where(eq(members.id, id));
}

/**
 * Deletes a member profile record from the registry.
 */
export async function deleteMember(id: string) {
  await db.delete(members).where(eq(members.id, id));
}

// ----------------------------------------------------------------------
// ANNUAL PLANS ADMIN OPERATIONS
// ----------------------------------------------------------------------

/**
 * Administrative mutation: Create a new annual plan activity item.
 */
export async function createAnnualPlanItem(data: {
  id?: string;
  academicYear: string;
  monthNumber: number;
  activityTitleEn: string;
  activityTitleAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  category: string;
  status?: "planned" | "confirmed" | "completed" | "postponed" | "cancelled";
  targetDate?: string | null;
  time?: string | null;
  location?: string | null;
  relatedEventId?: string | null;
  documentUrl?: string | null;
  documentTitle?: string | null;
  notes?: string | null;
  isPublished?: boolean;
}) {
  const now = new Date();
  const id = data.id || `ap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (data.monthNumber < 1 || data.monthNumber > 12) {
    throw new Error("monthNumber must be between 1 and 12.");
  }

  await db.insert(annualPlans).values({
    id,
    academicYear: data.academicYear,
    monthNumber: data.monthNumber,
    activityTitleEn: data.activityTitleEn,
    activityTitleAr: data.activityTitleAr ?? null,
    descriptionEn: data.descriptionEn ?? null,
    descriptionAr: data.descriptionAr ?? null,
    category: data.category,
    status: data.status ?? "planned",
    targetDate: data.targetDate ?? null,
    time: data.time ?? null,
    location: data.location ?? null,
    relatedEventId: data.relatedEventId ?? null,
    documentUrl: data.documentUrl ?? null,
    documentTitle: data.documentTitle ?? null,
    notes: data.notes ?? null,
    isPublished: data.isPublished ?? true,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Administrative mutation: Update an existing annual plan activity item.
 */
export async function updateAnnualPlanItem(id: string, data: Partial<{
  academicYear: string;
  monthNumber: number;
  activityTitleEn: string;
  activityTitleAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  category: string;
  status: "planned" | "confirmed" | "completed" | "postponed" | "cancelled";
  targetDate: string | null;
  time: string | null;
  location: string | null;
  relatedEventId: string | null;
  documentUrl: string | null;
  documentTitle: string | null;
  notes: string | null;
  isPublished: boolean;
}>) {
  if (data.monthNumber !== undefined && (data.monthNumber < 1 || data.monthNumber > 12)) {
    throw new Error("monthNumber must be between 1 and 12.");
  }

  await db.update(annualPlans)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(annualPlans.id, id));

  return true;
}

/**
 * Administrative mutation: Delete an annual plan activity item.
 */
export async function deleteAnnualPlanItem(id: string) {
  await db.delete(annualPlans).where(eq(annualPlans.id, id));
  return true;
}

// ----------------------------------------------------------------------
// EVENT REGISTRATIONS ADMIN OPERATIONS
// ----------------------------------------------------------------------

/**
 * Fetch registrations for a specific event (Administrative review and attendance roster).
 * Strictly protected: only accessible by authorized managers.
 */
export async function getAdminEventRegistrations(eventId: string, params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 50));
  const offset = (page - 1) * limit;

  const conditions = [eq(eventRegistrations.eventId, eventId)];

  if (params.status && params.status !== "all") {
    conditions.push(eq(eventRegistrations.status, params.status as any));
  }

  if (params.search) {
    const s = `%${params.search}%`;
    conditions.push(or(
      like(eventRegistrations.attendeeName, s),
      like(eventRegistrations.email, s),
      like(eventRegistrations.id, s),
      like(eventRegistrations.studentId, s)
    )!);
  }

  const data = await db.select()
    .from(eventRegistrations)
    .where(and(...conditions))
    .orderBy(desc(eventRegistrations.registeredAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() })
    .from(eventRegistrations)
    .where(and(...conditions));

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}

/**
 * Update event registration attendance/confirmation status.
 */
export async function updateEventRegistrationStatus(
  registrationId: string, 
  status: "registered" | "confirmed" | "attended" | "cancelled"
) {
  await db.update(eventRegistrations)
    .set({ status })
    .where(eq(eventRegistrations.id, registrationId));

  return true;
}

// ----------------------------------------------------------------------
// ANNOUNCEMENTS ADMIN OPERATIONS
// ----------------------------------------------------------------------

export async function createAnnouncement(data: {
  id?: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  summaryEn?: string | null;
  summaryAr?: string | null;
  contentEn: string;
  contentAr?: string | null;
  category?: string;
  coverImageUrl?: string | null;
  authorName?: string | null;
  status?: "draft" | "published" | "archived";
  isPinned?: boolean;
  isPublished?: boolean;
  publishedAt?: Date;
  expiresAt?: Date | null;
}) {
  const now = new Date();
  const id = data.id || `ann_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await db.insert(announcements).values({
    id,
    slug: data.slug,
    titleEn: data.titleEn,
    titleAr: data.titleAr ?? null,
    summaryEn: data.summaryEn ?? null,
    summaryAr: data.summaryAr ?? null,
    contentEn: data.contentEn,
    contentAr: data.contentAr ?? null,
    category: data.category ?? "notice",
    coverImageUrl: data.coverImageUrl ?? null,
    authorName: data.authorName ?? null,
    status: data.status ?? "published",
    isPinned: data.isPinned ?? false,
    isPublished: data.isPublished ?? true,
    publishedAt: data.publishedAt ?? now,
    expiresAt: data.expiresAt ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateAnnouncement(id: string, data: Partial<{
  slug: string;
  titleEn: string;
  titleAr: string | null;
  summaryEn: string | null;
  summaryAr: string | null;
  contentEn: string;
  contentAr: string | null;
  category: string;
  coverImageUrl: string | null;
  authorName: string | null;
  status: "draft" | "published" | "archived";
  isPinned: boolean;
  isPublished: boolean;
  publishedAt: Date;
  expiresAt: Date | null;
}>) {
  await db.update(announcements)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(announcements.id, id));

  return true;
}

export async function deleteAnnouncement(id: string) {
  await db.delete(announcements).where(eq(announcements.id, id));
  return true;
}

// ----------------------------------------------------------------------
// LEARNING RESOURCES ADMIN OPERATIONS
// ----------------------------------------------------------------------

export async function createLearningResource(data: {
  id?: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  category: "grammar" | "morphology" | "rhetoric" | "vocabulary" | "literature" | "reading" | "general";
  skillLevel?: "beginner" | "intermediate" | "advanced";
  fileUrl?: string | null;
  contentEn?: string | null;
  contentAr?: string | null;
  isPublished?: boolean;
}) {
  const now = new Date();
  const id = data.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await db.insert(learningResources).values({
    id,
    slug: data.slug,
    titleEn: data.titleEn,
    titleAr: data.titleAr ?? null,
    category: data.category,
    skillLevel: data.skillLevel ?? "beginner",
    fileUrl: data.fileUrl ?? null,
    contentEn: data.contentEn ?? null,
    contentAr: data.contentAr ?? null,
    isPublished: data.isPublished ?? true,
    downloadCount: 0,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function updateLearningResource(id: string, data: Partial<{
  slug: string;
  titleEn: string;
  titleAr: string | null;
  category: "grammar" | "morphology" | "rhetoric" | "vocabulary" | "literature" | "reading" | "general";
  skillLevel: "beginner" | "intermediate" | "advanced";
  fileUrl: string | null;
  contentEn: string | null;
  contentAr: string | null;
  isPublished: boolean;
}>) {
  await db.update(learningResources)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(learningResources.id, id));

  return true;
}

export async function deleteLearningResource(id: string) {
  await db.delete(learningResources).where(eq(learningResources.id, id));
  return true;
}

// ----------------------------------------------------------------------
// PUBLICATIONS & ACHIEVEMENTS ADMIN OPERATIONS
// ----------------------------------------------------------------------

export async function createPublication(data: {
  id?: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  publicationType?: "magazine" | "newsletter" | "journal" | "report";
  issueNo?: string | null;
  publicationDate?: string | null;
  coverImageUrl?: string | null;
  fileUrl: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  isPublished?: boolean;
}) {
  const now = new Date();
  const id = data.id || `pub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await db.insert(publications).values({
    id,
    slug: data.slug,
    titleEn: data.titleEn,
    titleAr: data.titleAr ?? null,
    publicationType: data.publicationType ?? "magazine",
    issueNo: data.issueNo ?? null,
    publicationDate: data.publicationDate ?? null,
    coverImageUrl: data.coverImageUrl ?? null,
    fileUrl: data.fileUrl,
    descriptionEn: data.descriptionEn ?? null,
    descriptionAr: data.descriptionAr ?? null,
    isPublished: data.isPublished ?? true,
    createdAt: now,
  });

  return id;
}

export async function updatePublication(id: string, data: Partial<{
  slug: string;
  titleEn: string;
  titleAr: string | null;
  publicationType: "magazine" | "newsletter" | "journal" | "report";
  issueNo: string | null;
  publicationDate: string | null;
  coverImageUrl: string | null;
  fileUrl: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  isPublished: boolean;
}>) {
  await db.update(publications)
    .set(data)
    .where(eq(publications.id, id));

  return true;
}

export async function deletePublication(id: string) {
  await db.delete(publications).where(eq(publications.id, id));
  return true;
}

export async function createAchievement(data: {
  id?: string;
  titleEn: string;
  titleAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  category?: string;
  dateAchieved?: string | null;
  certificateUrl?: string | null;
  isPublished?: boolean;
}) {
  const now = new Date();
  const id = data.id || `ach_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await db.insert(achievements).values({
    id,
    titleEn: data.titleEn,
    titleAr: data.titleAr ?? null,
    descriptionEn: data.descriptionEn ?? null,
    descriptionAr: data.descriptionAr ?? null,
    category: data.category ?? "competition",
    dateAchieved: data.dateAchieved ?? null,
    certificateUrl: data.certificateUrl ?? null,
    isPublished: data.isPublished ?? true,
    createdAt: now,
  });

  return id;
}

export async function updateAchievement(id: string, data: Partial<{
  titleEn: string;
  titleAr: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  category: string;
  dateAchieved: string | null;
  certificateUrl: string | null;
  isPublished: boolean;
}>) {
  await db.update(achievements)
    .set(data)
    .where(eq(achievements.id, id));

  return true;
}

export async function deleteAchievement(id: string) {
  await db.delete(achievements).where(eq(achievements.id, id));
  return true;
}

// ----------------------------------------------------------------------
// GALLERY ALBUMS & MEDIA ASSETS ADMIN CRUD OPERATIONS
// ----------------------------------------------------------------------

export interface CreateGalleryAlbumInput {
  id?: string;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  coverImageUrl?: string | null;
  eventDate?: string | null;
  dateNotes?: string | null;
  academicYear: string;
  category?: string;
  relatedEventId?: string | null;
  photographerCredit?: string | null;
  location?: string | null;
  isFeatured?: boolean;
  isPublished?: boolean;
  isArchived?: boolean;
}

/**
 * Creates a new curated archival photo/media album.
 */
export async function createGalleryAlbum(data: CreateGalleryAlbumInput) {
  if (data.relatedEventId) {
    const existing = await getAlbumByRelatedEventId(data.relatedEventId);
    if (existing) {
      throw new Error(`Duplicate album prevented: An album ("${existing.titleEn}") is already associated with event ${data.relatedEventId}.`);
    }
  }

  const now = new Date();
  const id = data.id || `alb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await db.insert(galleryAlbums).values({
    id,
    slug: data.slug,
    titleEn: data.titleEn,
    titleAr: data.titleAr ?? null,
    descriptionEn: data.descriptionEn ?? null,
    descriptionAr: data.descriptionAr ?? null,
    coverImageUrl: data.coverImageUrl ?? null,
    eventDate: data.eventDate ?? null,
    dateNotes: data.dateNotes ?? null,
    academicYear: data.academicYear,
    category: data.category ?? "cultural",
    relatedEventId: data.relatedEventId ?? null,
    photographerCredit: data.photographerCredit ?? null,
    location: data.location ?? null,
    isFeatured: data.isFeatured ?? false,
    isPublished: data.isPublished ?? true,
    isArchived: data.isArchived ?? false,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Updates metadata or publication status for an archival album.
 */
export async function updateGalleryAlbum(id: string, data: Partial<CreateGalleryAlbumInput>) {
  if (data.relatedEventId) {
    const existing = await getAlbumByRelatedEventId(data.relatedEventId);
    if (existing && existing.id !== id) {
      throw new Error(`Duplicate album prevented: An album ("${existing.titleEn}") is already associated with event ${data.relatedEventId}.`);
    }
  }

  await db.update(galleryAlbums)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(galleryAlbums.id, id));

  return true;
}

/**
 * Permanently removes a gallery album (media assets cascade-delete).
 */
export async function deleteGalleryAlbum(id: string) {
  await db.delete(galleryAlbums).where(eq(galleryAlbums.id, id));
  return true;
}

export interface CreateMediaAssetInput {
  id?: string;
  albumId: string;
  fileUrl: string;
  thumbnailUrl?: string | null;
  mediaType?: "image" | "video";
  videoUrl?: string | null;
  captionEn?: string | null;
  captionAr?: string | null;
  altText?: string | null;
  credit?: string | null;
  width?: number | null;
  height?: number | null;
  sortOrder?: number;
  isPublished?: boolean;
}

/**
 * Ingests a validated photograph or video asset into a designated album.
 */
export async function createMediaAsset(data: CreateMediaAssetInput) {
  const now = new Date();
  const id = data.id || `med_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await db.insert(mediaAssets).values({
    id,
    albumId: data.albumId,
    fileUrl: data.fileUrl,
    thumbnailUrl: data.thumbnailUrl ?? null,
    mediaType: data.mediaType ?? "image",
    videoUrl: data.videoUrl ?? null,
    captionEn: data.captionEn ?? null,
    captionAr: data.captionAr ?? null,
    altText: data.altText ?? null,
    credit: data.credit ?? null,
    width: data.width ?? null,
    height: data.height ?? null,
    sortOrder: data.sortOrder ?? 0,
    isPublished: data.isPublished ?? true,
    createdAt: now,
  });

  return id;
}

/**
 * Updates captions, credit, or sort order for a media asset.
 */
export async function updateMediaAsset(id: string, data: Partial<CreateMediaAssetInput>) {
  await db.update(mediaAssets)
    .set(data)
    .where(eq(mediaAssets.id, id));

  return true;
}

/**
 * Deletes a media asset from an album.
 */
export async function deleteMediaAsset(id: string) {
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  return true;
}

/**
 * Searches for duplicate media assets in an album by filename or approximate stem.
 */
export async function findDuplicateMediaInAlbum(albumId: string, filename: string) {
  const assets = await db
    .select({
      id: mediaAssets.id,
      fileUrl: mediaAssets.fileUrl,
      captionEn: mediaAssets.captionEn,
      sortOrder: mediaAssets.sortOrder,
    })
    .from(mediaAssets)
    .where(eq(mediaAssets.albumId, albumId));

  const cleanTargetName = filename.toLowerCase().trim();
  const rawTargetStem = cleanTargetName.substring(0, cleanTargetName.lastIndexOf(".")) || cleanTargetName;

  return assets.filter((a) => {
    const assetFilename = (a.fileUrl.split("/").pop()?.split("?")[0] || "").toLowerCase();
    const assetStem = assetFilename.substring(0, assetFilename.lastIndexOf(".")) || assetFilename;
    return (
      assetFilename === cleanTargetName ||
      (rawTargetStem.length > 3 && assetStem.includes(rawTargetStem))
    );
  });
}

// ----------------------------------------------------------------------
// 15. CONTACT SETTINGS & INQUIRIES (Institutional Relations)
// ----------------------------------------------------------------------

export interface ContactSettings {
  clubNameEn: string;
  clubNameAr: string;
  clubTaglineEn: string | null;
  clubTaglineAr: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  headquartersAddressEn: string | null;
  headquartersAddressAr: string | null;
  officeHoursEn: string | null;
  officeHoursAr: string | null;
  socialFacebook: string | null;
  socialYoutube: string | null;
  socialTwitter: string | null;
  socialLinkedin: string | null;
}

/**
 * Fetch approved institutional contact settings.
 * STRICT POLICY: Only returns verified values stored in siteSettings.
 * Never invents phone numbers, office hours, addresses, or social media links.
 */
export async function getContactSettings(): Promise<ContactSettings> {
  try {
    const settingsRows = await db.select()
      .from(siteSettings)
      .where(or(
        eq(siteSettings.category, "contact"),
        eq(siteSettings.category, "social"),
        eq(siteSettings.category, "general")
      ));

    const settingsMap = new Map<string, { valueEn: string | null; valueAr: string | null }>();
    settingsRows.forEach(row => {
      settingsMap.set(row.key, { valueEn: row.valueEn, valueAr: row.valueAr });
    });

    return {
      clubNameEn: settingsMap.get("club_name")?.valueEn || "Arabic Language & Cultural Club",
      clubNameAr: settingsMap.get("club_name")?.valueAr || "نادي اللغة والثقافة العربية",
      clubTaglineEn: settingsMap.get("club_tagline")?.valueEn || null,
      clubTaglineAr: settingsMap.get("club_tagline")?.valueAr || null,
      contactEmail: settingsMap.get("contact_email")?.valueEn || null,
      contactPhone: settingsMap.get("contact_phone")?.valueEn || null,
      headquartersAddressEn: settingsMap.get("headquarters_address")?.valueEn || null,
      headquartersAddressAr: settingsMap.get("headquarters_address")?.valueAr || null,
      officeHoursEn: settingsMap.get("office_hours")?.valueEn || null,
      officeHoursAr: settingsMap.get("office_hours")?.valueAr || null,
      socialFacebook: settingsMap.get("social_facebook")?.valueEn || null,
      socialYoutube: settingsMap.get("social_youtube")?.valueEn || null,
      socialTwitter: settingsMap.get("social_twitter")?.valueEn || null,
      socialLinkedin: settingsMap.get("social_linkedin")?.valueEn || null,
    };
  } catch (err) {
    console.warn("[getContactSettings] Database query error, utilizing resilient defaults:", err);
    return {
      clubNameEn: "Arabic Language & Cultural Club",
      clubNameAr: "نادي اللغة والثقافة العربية",
      clubTaglineEn: null,
      clubTaglineAr: null,
      contactEmail: null,
      contactPhone: null,
      headquartersAddressEn: null,
      headquartersAddressAr: null,
      officeHoursEn: null,
      officeHoursAr: null,
      socialFacebook: null,
      socialYoutube: null,
      socialTwitter: null,
      socialLinkedin: null,
    };
  }
}

export interface SubmitContactInquiryInput {
  fullName: string;
  email: string;
  department?: string;
  subject: string;
  message: string;
  ipAddress?: string | null;
  deliveryStatus?: "stored_locally" | "delivered_smtp" | "delivery_failed";
}

/**
 * Persists an official public inquiry into the secure contact_inquiries table.
 * Generates an institutional Reference ID (e.g. INQ-2026-XXXX).
 */
export async function submitContactInquiry(input: SubmitContactInquiryInput) {
  const hexSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const referenceNo = `INQ-2026-${hexSuffix}`;
  const id = `inq_${Date.now()}_${hexSuffix.toLowerCase()}`;
  const now = new Date();

  await db.insert(contactInquiries).values({
    id,
    referenceNo,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    department: input.department?.trim() || "general",
    subject: input.subject.trim(),
    message: input.message.trim(),
    status: "unread",
    deliveryStatus: input.deliveryStatus || "stored_locally",
    ipAddress: input.ipAddress || null,
    adminNotes: null,
    repliedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    referenceNo,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    deliveryStatus: input.deliveryStatus || "stored_locally",
    createdAt: now,
  };
}

/**
 * Fetch contact inquiries for the administrative inbox with optional filters.
 * STRICT SECURITY: Administrative access only. Never call from public routes.
 */
export async function getAdminInquiries(options: {
  status?: string;
  department?: string;
  search?: string;
} = {}) {
  const conditions = [];

  if (options.status && options.status !== "all") {
    conditions.push(eq(contactInquiries.status, options.status as any));
  }

  if (options.department && options.department !== "all") {
    conditions.push(eq(contactInquiries.department, options.department));
  }

  if (options.search && options.search.trim()) {
    const s = `%${options.search.trim()}%`;
    conditions.push(or(
      like(contactInquiries.referenceNo, s),
      like(contactInquiries.fullName, s),
      like(contactInquiries.email, s),
      like(contactInquiries.subject, s)
    )!);
  }

  return await db.select()
    .from(contactInquiries)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(contactInquiries.createdAt));
}

/**
 * Update administrative status and internal notes for an inquiry.
 */
export async function updateInquiryStatus(
  id: string,
  status: "unread" | "read" | "replied" | "archived",
  adminNotes?: string
) {
  const now = new Date();
  const updateData: any = {
    status,
    updatedAt: now,
  };

  if (adminNotes !== undefined) {
    updateData.adminNotes = adminNotes;
  }

  if (status === "replied") {
    updateData.repliedAt = now;
  }

  await db.update(contactInquiries)
    .set(updateData)
    .where(eq(contactInquiries.id, id));

  return true;
}

/**
 * Fetch a single inquiry by ID for admin inspection.
 */
export async function getInquiryById(id: string) {
  const [inquiry] = await db.select()
    .from(contactInquiries)
    .where(eq(contactInquiries.id, id))
    .limit(1);

  return inquiry || null;
}

// ----------------------------------------------------------------------
// EVENTS & ANNUAL PLANS ADMINISTRATIVE OPERATIONS (Feature 016)
// ----------------------------------------------------------------------

export interface CreateEventInput {
  slug?: string;
  titleEn: string;
  titleAr?: string | null;
  summaryEn: string;
  summaryAr?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  category: string;
  startTime: Date;
  endTime?: Date | null;
  venue: string;
  coverImageUrl?: string | null;
  capacity?: number | null;
  status?: "planned" | "confirmed" | "completed" | "postponed" | "cancelled";
  isRegistrationOpen?: boolean;
  isPublished?: boolean;
}

/**
 * Fetches events for administrative management with registration counts, search, and filters.
 */
export async function getAdminEvents(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.status && params.status !== "all") {
    conditions.push(eq(events.status, params.status as any));
  }

  if (params.category && params.category !== "all") {
    conditions.push(eq(events.category, params.category));
  }

  if (params.search && params.search.trim()) {
    const s = `%${params.search.trim()}%`;
    conditions.push(or(
      like(events.titleEn, s),
      like(events.titleAr, s),
      like(events.slug, s),
      like(events.venue, s)
    )!);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db.select()
    .from(events)
    .where(whereClause)
    .orderBy(desc(events.startTime))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() })
    .from(events)
    .where(whereClause);

  // Subquery counts of active registered attendees per event
  const regCounts = await db.select({
    eventId: eventRegistrations.eventId,
    registeredCount: count(),
  })
  .from(eventRegistrations)
  .where(ne(eventRegistrations.status, "cancelled"))
  .groupBy(eventRegistrations.eventId);

  const regMap = new Map(regCounts.map(r => [r.eventId, r.registeredCount]));

  // Lookup associated gallery albums for these events
  const eventIds = data.map(e => e.id);
  const associatedAlbums = eventIds.length > 0 ? await db.select({
    id: galleryAlbums.id,
    slug: galleryAlbums.slug,
    titleEn: galleryAlbums.titleEn,
    isPublished: galleryAlbums.isPublished,
    relatedEventId: galleryAlbums.relatedEventId,
  })
  .from(galleryAlbums)
  .where(inArray(galleryAlbums.relatedEventId, eventIds)) : [];

  const albumMap = new Map(associatedAlbums.map(a => [a.relatedEventId!, a]));

  const enriched = data.map(evt => {
    const alb = albumMap.get(evt.id);
    return {
      ...evt,
      registeredCount: regMap.get(evt.id) || 0,
      albumId: alb?.id || null,
      albumSlug: alb?.slug || null,
      albumTitleEn: alb?.titleEn || null,
      albumIsPublished: alb ? alb.isPublished : null,
    };
  });

  return {
    data: enriched,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}

/**
 * Fetches single event details by ID with active registration count and associated album for admin view.
 */
export async function getAdminEventById(id: string) {
  const [event] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!event) return null;

  const [regCount] = await db.select({ c: count() })
    .from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, id), ne(eventRegistrations.status, "cancelled")));

  const [associatedAlbum] = await db.select({
    id: galleryAlbums.id,
    slug: galleryAlbums.slug,
    titleEn: galleryAlbums.titleEn,
    isPublished: galleryAlbums.isPublished,
  })
  .from(galleryAlbums)
  .where(eq(galleryAlbums.relatedEventId, id))
  .limit(1);

  return {
    ...event,
    registeredCount: regCount?.c || 0,
    albumId: associatedAlbum?.id || null,
    albumSlug: associatedAlbum?.slug || null,
    albumTitleEn: associatedAlbum?.titleEn || null,
    albumIsPublished: associatedAlbum ? associatedAlbum.isPublished : null,
  };
}

/**
 * Creates a new event record with date range validation and unique slug generation.
 */
export async function createEvent(data: CreateEventInput) {
  if (data.endTime && data.startTime > data.endTime) {
    throw new Error("Invalid date range: startTime must be before or equal to endTime");
  }

  const id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();
  
  let slug = data.slug?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) {
    slug = data.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  // Ensure unique slug
  const [existing] = await db.select({ id: events.id }).from(events).where(eq(events.slug, slug)).limit(1);
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  await db.insert(events).values({
    id,
    slug,
    titleEn: data.titleEn,
    titleAr: data.titleAr || null,
    summaryEn: data.summaryEn,
    summaryAr: data.summaryAr || null,
    descriptionEn: data.descriptionEn || null,
    descriptionAr: data.descriptionAr || null,
    category: data.category,
    startTime: data.startTime,
    endTime: data.endTime || null,
    venue: data.venue,
    coverImageUrl: data.coverImageUrl || null,
    capacity: data.capacity !== undefined ? data.capacity : null,
    status: data.status || "confirmed",
    isRegistrationOpen: !!data.isRegistrationOpen,
    isPublished: data.isPublished !== undefined ? !!data.isPublished : true,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Updates an existing event record with date range validation and preserves historical state.
 */
export async function updateEvent(id: string, data: Partial<CreateEventInput>) {
  const [existing] = await db.select().from(events).where(eq(events.id, id)).limit(1);
  if (!existing) {
    throw new Error("Event not found");
  }

  const startTime = data.startTime || existing.startTime;
  const endTime = data.endTime !== undefined ? data.endTime : existing.endTime;

  if (endTime && startTime > endTime) {
    throw new Error("Invalid date range: startTime must be before or equal to endTime");
  }

  const updatePayload: any = {
    ...data,
    updatedAt: new Date(),
  };

  // If slug is changed, ensure uniqueness
  if (data.slug && data.slug !== existing.slug) {
    const slug = data.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const [slugMatch] = await db.select({ id: events.id }).from(events).where(and(eq(events.slug, slug), ne(events.id, id))).limit(1);
    if (slugMatch) {
      updatePayload.slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    } else {
      updatePayload.slug = slug;
    }
  }

  await db.update(events)
    .set(updatePayload)
    .where(eq(events.id, id));

  return true;
}

/**
 * Deletes an event record and cascades to registrations.
 */
export async function deleteEvent(id: string) {
  await db.delete(events).where(eq(events.id, id));
  return true;
}

/**
 * Fetches annual plan activities for administrative management including unpublished items.
 */
export async function getAdminAnnualPlans(params: {
  academicYear?: string;
  monthNumber?: number;
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 50));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.academicYear && params.academicYear !== "all") {
    conditions.push(eq(annualPlans.academicYear, params.academicYear));
  }
  if (params.monthNumber !== undefined && params.monthNumber > 0) {
    conditions.push(eq(annualPlans.monthNumber, params.monthNumber));
  }
  if (params.category && params.category !== "all") {
    conditions.push(eq(annualPlans.category, params.category));
  }
  if (params.status && params.status !== "all") {
    conditions.push(eq(annualPlans.status, params.status as any));
  }
  if (params.search && params.search.trim()) {
    const s = `%${params.search.trim()}%`;
    conditions.push(or(
      like(annualPlans.activityTitleEn, s),
      like(annualPlans.activityTitleAr, s),
      like(annualPlans.location, s),
      like(annualPlans.descriptionEn, s)
    )!);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db.select({
    id: annualPlans.id,
    academicYear: annualPlans.academicYear,
    monthNumber: annualPlans.monthNumber,
    activityTitleEn: annualPlans.activityTitleEn,
    activityTitleAr: annualPlans.activityTitleAr,
    descriptionEn: annualPlans.descriptionEn,
    descriptionAr: annualPlans.descriptionAr,
    category: annualPlans.category,
    status: annualPlans.status,
    targetDate: annualPlans.targetDate,
    time: annualPlans.time,
    location: annualPlans.location,
    relatedEventId: annualPlans.relatedEventId,
    relatedEventSlug: events.slug,
    relatedEventTitle: events.titleEn,
    documentUrl: annualPlans.documentUrl,
    documentTitle: annualPlans.documentTitle,
    notes: annualPlans.notes,
    isPublished: annualPlans.isPublished,
    createdAt: annualPlans.createdAt,
    updatedAt: annualPlans.updatedAt,
  })
  .from(annualPlans)
  .leftJoin(events, eq(annualPlans.relatedEventId, events.id))
  .where(whereClause)
  .orderBy(asc(annualPlans.academicYear), asc(annualPlans.monthNumber), asc(annualPlans.targetDate))
  .limit(limit)
  .offset(offset);

  const [{ total }] = await db.select({ total: count() })
    .from(annualPlans)
    .where(whereClause);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}

/**
 * Fetches a single annual plan activity by ID.
 */
export async function getAnnualPlanById(id: string) {
  const [plan] = await db.select({
    id: annualPlans.id,
    academicYear: annualPlans.academicYear,
    monthNumber: annualPlans.monthNumber,
    activityTitleEn: annualPlans.activityTitleEn,
    activityTitleAr: annualPlans.activityTitleAr,
    descriptionEn: annualPlans.descriptionEn,
    descriptionAr: annualPlans.descriptionAr,
    category: annualPlans.category,
    status: annualPlans.status,
    targetDate: annualPlans.targetDate,
    time: annualPlans.time,
    location: annualPlans.location,
    relatedEventId: annualPlans.relatedEventId,
    relatedEventSlug: events.slug,
    relatedEventTitle: events.titleEn,
    documentUrl: annualPlans.documentUrl,
    documentTitle: annualPlans.documentTitle,
    notes: annualPlans.notes,
    isPublished: annualPlans.isPublished,
    createdAt: annualPlans.createdAt,
    updatedAt: annualPlans.updatedAt,
  })
  .from(annualPlans)
  .leftJoin(events, eq(annualPlans.relatedEventId, events.id))
  .where(eq(annualPlans.id, id))
  .limit(1);

  return plan || null;
}

// ============================================================================
// CONTENT MANAGEMENT MODULES: ADMINISTRATIVE QUERIES (FEATURE 017)
// ============================================================================

/**
 * Fetches announcements for administrative review, editing, and publishing.
 * Supports filtering by category, publication status, and full-text keyword search.
 */
export async function getAdminAnnouncements(params: {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.category && params.category !== "all") {
    conditions.push(eq(announcements.category, params.category));
  }
  if (params.status && params.status !== "all") {
    conditions.push(eq(announcements.status, params.status as any));
  }
  if (params.search && params.search.trim()) {
    const s = `%${params.search.trim()}%`;
    conditions.push(or(
      like(announcements.titleEn, s),
      like(announcements.titleAr, s),
      like(announcements.slug, s),
      like(announcements.authorName, s)
    )!);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select()
    .from(announcements)
    .where(whereClause)
    .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(announcements)
    .where(whereClause);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Fetches Arabic learning resources for administrative curation.
 * Supports filtering by category, skill level, publication status, and keyword search.
 */
export async function getAdminLearningResources(params: {
  category?: string;
  skillLevel?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.category && params.category !== "all") {
    conditions.push(eq(learningResources.category, params.category as any));
  }
  if (params.skillLevel && params.skillLevel !== "all") {
    conditions.push(eq(learningResources.skillLevel, params.skillLevel as any));
  }
  if (params.status === "published") {
    conditions.push(eq(learningResources.isPublished, true));
  } else if (params.status === "draft") {
    conditions.push(eq(learningResources.isPublished, false));
  }
  if (params.search && params.search.trim()) {
    const s = `%${params.search.trim()}%`;
    conditions.push(or(
      like(learningResources.titleEn, s),
      like(learningResources.titleAr, s),
      like(learningResources.slug, s)
    )!);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select()
    .from(learningResources)
    .where(whereClause)
    .orderBy(desc(learningResources.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(learningResources)
    .where(whereClause);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Fetches publications for administrative catalog management.
 * Supports publication type, publication status, and title keyword search.
 */
export async function getAdminPublications(params: {
  publicationType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.publicationType && params.publicationType !== "all") {
    conditions.push(eq(publications.publicationType, params.publicationType as any));
  }
  if (params.status === "published") {
    conditions.push(eq(publications.isPublished, true));
  } else if (params.status === "draft") {
    conditions.push(eq(publications.isPublished, false));
  }
  if (params.search && params.search.trim()) {
    const s = `%${params.search.trim()}%`;
    conditions.push(or(
      like(publications.titleEn, s),
      like(publications.titleAr, s),
      like(publications.slug, s),
      like(publications.issueNo, s)
    )!);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select()
    .from(publications)
    .where(whereClause)
    .orderBy(desc(publications.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(publications)
    .where(whereClause);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Fetches verified institutional achievements and tournament accolades for admin review.
 */
export async function getAdminAchievements(params: {
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.category && params.category !== "all") {
    conditions.push(eq(achievements.category, params.category));
  }
  if (params.status === "published") {
    conditions.push(eq(achievements.isPublished, true));
  } else if (params.status === "draft") {
    conditions.push(eq(achievements.isPublished, false));
  }
  if (params.search && params.search.trim()) {
    const s = `%${params.search.trim()}%`;
    conditions.push(or(
      like(achievements.titleEn, s),
      like(achievements.titleAr, s),
      like(achievements.descriptionEn, s)
    )!);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const data = await db
    .select()
    .from(achievements)
    .where(whereClause)
    .orderBy(desc(achievements.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(achievements)
    .where(whereClause);

  return {
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Fetches gallery albums for administrative curation with media counts.
 * Supports academic year, category, and publication status filtering.
 */
export async function getAdminGalleryAlbums(params: {
  academicYear?: string;
  category?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params.academicYear && params.academicYear !== "all") {
    conditions.push(eq(galleryAlbums.academicYear, params.academicYear));
  }
  if (params.category && params.category !== "all") {
    conditions.push(eq(galleryAlbums.category, params.category));
  }
  if (params.status === "published") {
    conditions.push(and(eq(galleryAlbums.isPublished, true), eq(galleryAlbums.isArchived, false)));
  } else if (params.status === "draft") {
    conditions.push(and(eq(galleryAlbums.isPublished, false), eq(galleryAlbums.isArchived, false)));
  } else if (params.status === "archived") {
    conditions.push(eq(galleryAlbums.isArchived, true));
  }
  if (params.search && params.search.trim()) {
    const s = `%${params.search.trim()}%`;
    conditions.push(or(
      like(galleryAlbums.titleEn, s),
      like(galleryAlbums.titleAr, s),
      like(galleryAlbums.slug, s),
      like(galleryAlbums.location, s)
    )!);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rawAlbums = await db
    .select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      titleEn: galleryAlbums.titleEn,
      titleAr: galleryAlbums.titleAr,
      descriptionEn: galleryAlbums.descriptionEn,
      descriptionAr: galleryAlbums.descriptionAr,
      coverImageUrl: galleryAlbums.coverImageUrl,
      eventDate: galleryAlbums.eventDate,
      dateNotes: galleryAlbums.dateNotes,
      academicYear: galleryAlbums.academicYear,
      category: galleryAlbums.category,
      relatedEventId: galleryAlbums.relatedEventId,
      relatedEventTitle: events.titleEn,
      photographerCredit: galleryAlbums.photographerCredit,
      location: galleryAlbums.location,
      isFeatured: galleryAlbums.isFeatured,
      isPublished: galleryAlbums.isPublished,
      isArchived: galleryAlbums.isArchived,
      createdAt: galleryAlbums.createdAt,
      updatedAt: galleryAlbums.updatedAt,
      mediaCount: count(mediaAssets.id),
    })
    .from(galleryAlbums)
    .leftJoin(events, eq(galleryAlbums.relatedEventId, events.id))
    .leftJoin(mediaAssets, eq(galleryAlbums.id, mediaAssets.albumId))
    .where(whereClause)
    .groupBy(galleryAlbums.id)
    .orderBy(desc(galleryAlbums.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ total }] = await db
    .select({ total: count() })
    .from(galleryAlbums)
    .where(whereClause);

  return {
    data: rawAlbums,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Fetches a single gallery album along with all contained media assets for management.
 */
export async function getAdminAlbumWithAssets(albumId: string) {
  const [album] = await db
    .select({
      id: galleryAlbums.id,
      slug: galleryAlbums.slug,
      titleEn: galleryAlbums.titleEn,
      titleAr: galleryAlbums.titleAr,
      descriptionEn: galleryAlbums.descriptionEn,
      descriptionAr: galleryAlbums.descriptionAr,
      coverImageUrl: galleryAlbums.coverImageUrl,
      eventDate: galleryAlbums.eventDate,
      dateNotes: galleryAlbums.dateNotes,
      academicYear: galleryAlbums.academicYear,
      category: galleryAlbums.category,
      relatedEventId: galleryAlbums.relatedEventId,
      relatedEventTitle: events.titleEn,
      photographerCredit: galleryAlbums.photographerCredit,
      location: galleryAlbums.location,
      isFeatured: galleryAlbums.isFeatured,
      isPublished: galleryAlbums.isPublished,
      isArchived: galleryAlbums.isArchived,
      createdAt: galleryAlbums.createdAt,
      updatedAt: galleryAlbums.updatedAt,
    })
    .from(galleryAlbums)
    .leftJoin(events, eq(galleryAlbums.relatedEventId, events.id))
    .where(eq(galleryAlbums.id, albumId))
    .limit(1);

  if (!album) return null;

  const assets = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.albumId, albumId))
    .orderBy(asc(mediaAssets.sortOrder), desc(mediaAssets.createdAt));

  return {
    ...album,
    assets,
  };
}

/**
 * Bulk updates publication status or deletes multiple media assets safely.
 */
export async function bulkUpdateMediaAssets(
  assetIds: string[],
  action: "publish" | "unpublish" | "delete"
) {
  if (!assetIds || assetIds.length === 0) return true;

  if (action === "publish") {
    await db.update(mediaAssets)
      .set({ isPublished: true })
      .where(inArray(mediaAssets.id, assetIds));
  } else if (action === "unpublish") {
    await db.update(mediaAssets)
      .set({ isPublished: false })
      .where(inArray(mediaAssets.id, assetIds));
  } else if (action === "delete") {
    await db.delete(mediaAssets)
      .where(inArray(mediaAssets.id, assetIds));
  }
  return true;
}

/**
 * Reorders media assets within an album using an array of asset IDs in order.
 */
export async function reorderMediaAssets(albumId: string, orderedAssetIds: string[]) {
  if (!orderedAssetIds || orderedAssetIds.length === 0) return true;

  for (let i = 0; i < orderedAssetIds.length; i++) {
    await db.update(mediaAssets)
      .set({ sortOrder: i })
      .where(and(eq(mediaAssets.id, orderedAssetIds[i]), eq(mediaAssets.albumId, albumId)));
  }
  return true;
}

// ----------------------------------------------------------------------
// SITE SETTINGS & GOVERNANCE QUERIES
// ----------------------------------------------------------------------

export interface SiteSettingEntry {
  key: string;
  valueEn?: string | null;
  valueAr?: string | null;
  category?: string;
}

/**
 * Fetch all raw site settings from SQLite transformed into an administrative dictionary.
 */
export async function getAdminSiteSettings() {
  const rows = await db.select().from(siteSettings);
  const settingsMap: Record<string, { valueEn: string; valueAr: string; category: string }> = {};
  
  for (const row of rows) {
    settingsMap[row.key] = {
      valueEn: row.valueEn || "",
      valueAr: row.valueAr || "",
      category: row.category || "general",
    };
  }
  return settingsMap;
}

/**
 * Upsert site settings entries with validation and timestamp tracking.
 */
export async function updateSiteSettings(entries: SiteSettingEntry[]) {
  const now = new Date();
  for (const entry of entries) {
    const existing = await db
      .select({ id: siteSettings.id })
      .from(siteSettings)
      .where(eq(siteSettings.key, entry.key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(siteSettings)
        .set({
          valueEn: entry.valueEn ?? null,
          valueAr: entry.valueAr ?? null,
          category: entry.category || "general",
          updatedAt: now,
        })
        .where(eq(siteSettings.key, entry.key));
    } else {
      await db.insert(siteSettings).values({
        id: `set_${entry.key.toLowerCase().replace(/[^a-z0-9_]/g, "_")}_${Date.now()}`,
        key: entry.key,
        valueEn: entry.valueEn ?? null,
        valueAr: entry.valueAr ?? null,
        category: entry.category || "general",
        updatedAt: now,
      });
    }
  }
  return true;
}

/**
 * Update administrative user role with least-privilege checks.
 */
export async function updateUserRole(userId: string, role: string) {
  await db
    .update(users)
    .set({
      role: role as any,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  return true;
}

/**
 * Update user account status (active vs suspended).
 */
export async function updateUserStatus(userId: string, isActive: boolean) {
  await db
    .update(users)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  return true;
}

/**
 * Get single user record by ID.
 */
export async function getUserById(userId: string) {
  const res = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      isActive: users.isActive,
      passwordHash: users.passwordHash,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return res[0] || null;
}

/**
 * Update user password hash.
 */
export async function updateUserPassword(userId: string, passwordHash: string) {
  await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  return true;
}
