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
import { eq, desc, asc, and, like, or, count, sql } from "drizzle-orm";

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
 * Fetch photo gallery albums with pagination.
 */
export async function getPublicGalleryAlbums(params: { page?: number; limit?: number; year?: string } = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 12));
  const offset = (page - 1) * limit;

  const conditions = [eq(galleryAlbums.isPublished, true)];
  if (params.year && params.year !== "all") {
    conditions.push(eq(galleryAlbums.academicYear, params.year));
  }

  const data = await db.select()
    .from(galleryAlbums)
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
 */
export async function getAlbumMediaAssets(albumId: string) {
  return await db.select()
    .from(mediaAssets)
    .where(and(eq(mediaAssets.albumId, albumId), eq(mediaAssets.isPublished, true)))
    .orderBy(asc(mediaAssets.sortOrder));
}

/**
 * Fetch public announcements with pagination.
 */
export async function getPublicAnnouncements(params: { page?: number; limit?: number } = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 10));
  const offset = (page - 1) * limit;

  const conditions = [eq(announcements.isPublished, true)];

  const data = await db.select({
    id: announcements.id,
    slug: announcements.slug,
    titleEn: announcements.titleEn,
    titleAr: announcements.titleAr,
    contentEn: announcements.contentEn,
    contentAr: announcements.contentAr,
    category: announcements.category,
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
    conditions.push(or(like(learningResources.titleEn, s), like(learningResources.titleAr, s))!);
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
 * Fetch published achievements.
 */
export async function getPublicAchievements() {
  return await db.select()
    .from(achievements)
    .where(eq(achievements.isPublished, true))
    .orderBy(desc(achievements.dateAchieved));
}

/**
 * Fetch published magazines and publications.
 */
export async function getPublicPublications() {
  return await db.select()
    .from(publications)
    .where(eq(publications.isPublished, true))
    .orderBy(desc(publications.publicationDate));
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
 * Fetch a single gallery album by slug with its media photos.
 */
export async function getPublicGalleryAlbumBySlug(slug: string) {
  const [album] = await db.select()
    .from(galleryAlbums)
    .where(and(eq(galleryAlbums.slug, slug), eq(galleryAlbums.isPublished, true)))
    .limit(1);

  if (!album) return null;

  const photos = await getAlbumMediaAssets(album.id);
  return { ...album, photos };
}

/**
 * Fetch membership applications for administrative review.
 */
export async function getAdminMembershipApplications(status: "approved" | "pending" | "rejected" | "under_review" | "withdrawn" = "pending") {
  return await db.select()
    .from(membershipApplications)
    .where(eq(membershipApplications.status, status))
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



