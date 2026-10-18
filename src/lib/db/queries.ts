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
  pageSections
} from "./schema";
import { eq, ne, desc, asc, and, like, or, count, sql } from "drizzle-orm";

// ----------------------------------------------------------------------
// PUBLIC QUERIES (Zero Sensitive Data Exposure)
// ----------------------------------------------------------------------

/**
 * Fetch verified founders for the public narrative.
 */
export async function getPublicFounders() {
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
}

/**
 * Fetch active committee term and historical terms list.
 */
export async function getCommitteeTerms() {
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
}

/**
 * Fetch committee members for a specific term (Current or Historical Archive).
 * Notice: Email, phone, studentId are completely excluded from the projection.
 */
export async function getCommitteeMembersByTerm(termId: string) {
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
}

/**
 * Fetch public member directory.
 * Strictly respects isPublic = true and excludes private personal contacts.
 */
export async function getPublicMembers(params: { page?: number; limit?: number; search?: string } = {}) {
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
}

/**
 * Fetch upcoming and past events with pagination and category filtering.
 */
export async function getPublicEvents(params: { 
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
}

/**
 * Fetch single event details by slug.
 */
export async function getPublicEventBySlug(slug: string) {
  const result = await db.select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.isPublished, true)))
    .limit(1);

  return result[0] || null;
}

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
export async function getPublicAnnualPlans(options: { 
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
}

/**
 * Fetch all distinct academic years that have published annual plans.
 */
export async function getAnnualPlanYears(): Promise<string[]> {
  const results = await db.selectDistinct({
    academicYear: annualPlans.academicYear,
  })
  .from(annualPlans)
  .where(eq(annualPlans.isPublished, true))
  .orderBy(desc(annualPlans.academicYear));

  return results.map(r => r.academicYear);
}

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
export async function getPublicGalleryAlbums(params: GetPublicGalleryAlbumsParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 12));
  const offset = (page - 1) * limit;

  const conditions = [eq(galleryAlbums.isPublished, true)];

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
}

/**
 * Fetch all media assets inside an album.
 * Security: Filters `mediaAssets.isPublished = true` and orders by `sortOrder` ASC.
 */
export async function getAlbumMediaAssets(albumId: string) {
  return await db.select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.albumId, albumId), eq(mediaAssets.isPublished, true)))
    .orderBy(asc(mediaAssets.sortOrder), asc(mediaAssets.createdAt));
}

/**
 * Fetch distinct academic years represented in published gallery albums.
 */
export async function getPublicGalleryYears(): Promise<string[]> {
  const results = await db.selectDistinct({
    academicYear: galleryAlbums.academicYear,
  })
  .from(galleryAlbums)
  .where(eq(galleryAlbums.isPublished, true))
  .orderBy(desc(galleryAlbums.academicYear));

  return results.map(r => r.academicYear);
}

/**
 * Fetch public announcements with category filtering, search, and pagination.
 * Security constraint: Only retrieves isPublished === true AND status === 'published'.
 * Drafts and archived bulletins are strictly excluded from public listing.
 */
export async function getPublicAnnouncements(params: { 
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
}

/**
 * Fetch a single public announcement by slug.
 * Strictly enforces isPublished === true AND status === 'published'.
 * Non-existent or unpublished announcements return null.
 */
export async function getPublicAnnouncementBySlug(slug: string) {
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
}

/**
 * Fetch Arabic learning resources with skill level, category and search filtering.
 */
export async function getPublicLearningResources(params: {
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
}

/**
 * Atomically increment download count for a learning resource upon user access.
 */
export async function incrementResourceDownloadCount(id: string) {
  await db.update(learningResources)
    .set({ downloadCount: sql`${learningResources.downloadCount} + 1` })
    .where(eq(learningResources.id, id));
  return true;
}

/**
 * Fetch published achievements.
 */
export async function getPublicAchievements(params: { category?: string } = {}) {
  const conditions = [eq(achievements.isPublished, true)];

  if (params.category && params.category !== "all") {
    conditions.push(eq(achievements.category, params.category));
  }

  return await db.select()
    .from(achievements)
    .where(and(...conditions))
    .orderBy(desc(achievements.dateAchieved));
}

/**
 * Fetch published magazines and publications with optional type filter.
 */
export async function getPublicPublications(params: { 
  type?: string; 
  search?: string; 
  page?: number; 
  limit?: number; 
} = {}) {
  const conditions = [eq(publications.isPublished, true)];

  if (params.type && params.type !== "all") {
    conditions.push(eq(publications.publicationType, params.type as any));
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
}

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

// ----------------------------------------------------------------------
// EDITABLE CMS PAGES & SECTIONS QUERIES
// ----------------------------------------------------------------------

export interface SectionContentItem {
  id?: string;
  title: string;
  arabicTitle?: string;
  description: string;
  arabicDescription?: string;
  iconName?: string;
  badge?: string;
  year?: string;
  date?: string;
  citation?: string;
  isVerified?: boolean;
  imageUrl?: string;
  imageCaption?: string;
  documentUrl?: string;
  documentTitle?: string;
}

export interface SectionContentData {
  heading?: string;
  subheading?: string;
  badge?: string;
  body?: string;
  quote?: {
    text: string;
    arabicText?: string;
    attribution?: string;
  };
  items?: SectionContentItem[];
  imageUrl?: string;
  imageCaption?: string;
  documentUrl?: string;
  documentTitle?: string;
  documentSize?: string;
  publicationStatus?: "draft" | "published" | "archived";
}

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

function parseSectionJson(rawText: string | null): SectionContentData {
  if (!rawText) return {};
  try {
    const trimmed = rawText.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return JSON.parse(trimmed);
    }
    return { body: trimmed };
  } catch {
    return { body: rawText };
  }
}

/**
 * Fetch a published editable page by slug with all its associated sections ordered by sortOrder.
 * Safely parses JSON structured content for headings, body copy, quotes, items, and documents.
 */
export async function getPageWithSections(slug: string): Promise<PageWithSections | null> {
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
}

// ----------------------------------------------------------------------
// ADMIN METRICS QUERY (Zero Fake Stats)
// ----------------------------------------------------------------------

export async function getAdminDashboardMetrics() {
  const [
    [{ totalEvents }],
    [{ totalUpcoming }],
    [{ totalMembers }],
    [{ pendingApplications }],
    [{ totalAlbums }],
    [{ totalAnnouncements }]
  ] = await Promise.all([
    db.select({ totalEvents: count() }).from(events),
    db.select({ totalUpcoming: count() }).from(events).where(
      and(eq(events.status, "confirmed"), sql`${events.startTime} >= ${Math.floor(Date.now() / 1000)}`)
    ),
    db.select({ totalMembers: count() }).from(members).where(eq(members.status, "active")),
    db.select({ pendingApplications: count() }).from(membershipApplications).where(eq(membershipApplications.status, "pending")),
    db.select({ totalAlbums: count() }).from(galleryAlbums),
    db.select({ totalAnnouncements: count() }).from(announcements).where(eq(announcements.isPublished, true)),
  ]);

  const recentLogs = await db.select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(8);

  return {
    totalEvents,
    totalUpcoming,
    totalMembers,
    pendingApplications,
    totalAlbums,
    totalAnnouncements,
    recentLogs,
  };
}

/**
 * Fetch a single gallery album by slug with its media photos and associated event details.
 * Security: Returns null if album is draft or unpublished (Strix-Supabase isolation).
 */
export async function getPublicGalleryAlbumBySlug(slug: string) {
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
  .where(and(eq(galleryAlbums.slug, slug), eq(galleryAlbums.isPublished, true)))
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

/**
 * Fetch audit logs for security review.
 */
export async function getAdminAuditLogs(limit: number = 50) {
  return await db.select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
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
 * Updates a member's public directory visibility preference.
 */
export async function setMemberPublicVisibility(memberId: string, isPublic: boolean) {
  await db.update(members)
    .set({ isPublic, updatedAt: new Date() })
    .where(eq(members.id, memberId));
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
  academicYear: string;
  category?: string;
  relatedEventId?: string | null;
  photographerCredit?: string | null;
  location?: string | null;
  isFeatured?: boolean;
  isPublished?: boolean;
}

/**
 * Creates a new curated archival photo/media album.
 */
export async function createGalleryAlbum(data: CreateGalleryAlbumInput) {
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
    academicYear: data.academicYear,
    category: data.category ?? "cultural",
    relatedEventId: data.relatedEventId ?? null,
    photographerCredit: data.photographerCredit ?? null,
    location: data.location ?? null,
    isFeatured: data.isFeatured ?? false,
    isPublished: data.isPublished ?? true,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

/**
 * Updates metadata or publication status for an archival album.
 */
export async function updateGalleryAlbum(id: string, data: Partial<CreateGalleryAlbumInput>) {
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





