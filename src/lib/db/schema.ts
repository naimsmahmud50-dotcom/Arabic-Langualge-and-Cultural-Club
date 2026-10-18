import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ----------------------------------------------------------------------
// 1. SITE SETTINGS
// ----------------------------------------------------------------------
export const siteSettings = sqliteTable("site_settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  valueEn: text("value_en"),
  valueAr: text("value_ar"),
  category: text("category").notNull().default("general"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ----------------------------------------------------------------------
// 2. USERS & ROLES
// ----------------------------------------------------------------------
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { 
    enum: [
      "super_admin",
      "administrator",
      "content_editor",
      "membership_manager",
      "event_manager",
      "president",
      "secretary",
      "media_manager",
      "read_only"
    ] 
  }).notNull().default("read_only"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("users_role_idx").on(table.role),
  index("users_email_idx").on(table.email),
]);

// ----------------------------------------------------------------------
// 2b. SESSIONS (Server-Managed Revocable Sessions)
// ----------------------------------------------------------------------
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // secure token identifier
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  userEmail: text("user_email").notNull(),
  fullName: text("full_name").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
}, (table) => [
  index("sessions_user_idx").on(table.userId),
  index("sessions_expires_idx").on(table.expiresAt),
]);

// ----------------------------------------------------------------------
// 2c. PASSWORD RESET TOKENS
// ----------------------------------------------------------------------
export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("pwd_reset_user_idx").on(table.userId),
  index("pwd_reset_token_idx").on(table.tokenHash),
]);

// ----------------------------------------------------------------------
// 2d. LOGIN ATTEMPTS & RATE LIMITING
// ----------------------------------------------------------------------
export const loginAttempts = sqliteTable("login_attempts", {
  id: text("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  email: text("email").notNull(),
  attemptedAt: integer("attempted_at", { mode: "timestamp" }).notNull(),
  isSuccessful: integer("is_successful", { mode: "boolean" }).notNull(),
}, (table) => [
  index("login_attempts_ip_idx").on(table.ipAddress, table.attemptedAt),
  index("login_attempts_email_idx").on(table.email, table.attemptedAt),
]);

// ----------------------------------------------------------------------
// 3. MEMBERS (Internal Directory & Public Profiles)
// ----------------------------------------------------------------------
export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  membershipId: text("membership_id").notNull().unique(), // e.g. ALC-2024-001
  fullNameEn: text("full_name_en").notNull(),
  fullNameAr: text("full_name_ar"),
  photoUrl: text("photo_url"),
  email: text("email").notNull(), // Private: never exposed in public queries
  phone: text("phone"),           // Private
  studentId: text("student_id"),   // Private
  status: text("status", { enum: ["active", "alumni", "honorary", "suspended"] }).notNull().default("active"),
  isPublic: integer("is_public", { mode: "boolean" }).notNull().default(false), // Visibility privacy filter
  bioEn: text("bio_en"),
  bioAr: text("bio_ar"),
  joinedAt: integer("joined_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("members_status_idx").on(table.status),
  index("members_is_public_idx").on(table.isPublic),
  index("members_membership_id_idx").on(table.membershipId),
]);

// ----------------------------------------------------------------------
// 4. MEMBERSHIP APPLICATIONS
// ----------------------------------------------------------------------
export const membershipApplications = sqliteTable("membership_applications", {
  id: text("id").primaryKey(),
  referenceNo: text("reference_no").notNull().unique(), // e.g. APP-2026-9812
  applicantName: text("applicant_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  category: text("category").notNull().default("general_student"),
  motivation: text("motivation").notNull(),
  status: text("status", { 
    enum: ["pending", "under_review", "approved", "rejected", "withdrawn"] 
  }).notNull().default("pending"),
  reviewerNotes: text("reviewer_notes"),
  reviewedById: text("reviewed_by_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("applications_status_idx").on(table.status),
  index("applications_ref_idx").on(table.referenceNo),
]);

// ----------------------------------------------------------------------
// 5. FOUNDERS
// ----------------------------------------------------------------------
export const founders = sqliteTable("founders", {
  id: text("id").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar"),
  portraitUrl: text("portrait_url"),
  roleTitleEn: text("role_title_en").notNull(),
  roleTitleAr: text("role_title_ar"),
  bioEn: text("bio_en"),
  bioAr: text("bio_ar"),
  foundingYear: integer("founding_year"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("founders_sort_idx").on(table.sortOrder),
  index("founders_published_idx").on(table.isPublished),
]);

// ----------------------------------------------------------------------
// 6. COMMITTEE TERMS (Historical Preservation Rule)
// ----------------------------------------------------------------------
export const committeeTerms = sqliteTable("committee_terms", {
  id: text("id").primaryKey(),
  academicYear: text("academic_year").notNull().unique(), // e.g. "2024–2025" or "Founding Term"
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar"),
  startDate: text("start_date").notNull(), // ISO YYYY-MM-DD
  endDate: text("end_date"),
  isCurrent: integer("is_current", { mode: "boolean" }).notNull().default(false),
  summaryEn: text("summary_en"),
  summaryAr: text("summary_ar"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("terms_academic_year_idx").on(table.academicYear),
  index("terms_is_current_idx").on(table.isCurrent),
]);

// ----------------------------------------------------------------------
// 7. COMMITTEE POSITIONS
// ----------------------------------------------------------------------
export const committeePositions = sqliteTable("committee_positions", {
  id: text("id").primaryKey(),
  titleEn: text("title_en").notNull().unique(),
  titleAr: text("title_ar"),
  defaultRank: integer("default_rank").notNull().default(100),
  category: text("category").notNull().default("executive"), // executive, advisor, secretarial, editorial
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ----------------------------------------------------------------------
// 8. COMMITTEE ASSIGNMENTS (Historical Link Junction)
// ----------------------------------------------------------------------
export const committeeAssignments = sqliteTable("committee_assignments", {
  id: text("id").primaryKey(),
  termId: text("term_id").notNull().references(() => committeeTerms.id, { onDelete: "cascade" }),
  memberId: text("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  positionTitleEn: text("position_title_en").notNull(),
  positionTitleAr: text("position_title_ar"),
  rankOrder: integer("rank_order").notNull().default(100),
  roleDescription: text("role_description"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("assignments_term_idx").on(table.termId),
  index("assignments_member_idx").on(table.memberId),
  index("assignments_rank_idx").on(table.rankOrder),
]);

// ----------------------------------------------------------------------
// 9. EVENTS
// ----------------------------------------------------------------------
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar"),
  summaryEn: text("summary_en").notNull(),
  summaryAr: text("summary_ar"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull().default("academic"), // workshop, competition, seminar, cultural, social
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }),
  venue: text("venue").notNull(),
  coverImageUrl: text("cover_image_url"),
  capacity: integer("capacity"),
  status: text("status", { 
    enum: ["planned", "confirmed", "completed", "postponed", "cancelled"] 
  }).notNull().default("confirmed"),
  isRegistrationOpen: integer("is_registration_open", { mode: "boolean" }).notNull().default(false),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("events_slug_idx").on(table.slug),
  index("events_status_idx").on(table.status),
  index("events_start_time_idx").on(table.startTime),
  index("events_published_idx").on(table.isPublished),
]);

// ----------------------------------------------------------------------
// 10. EVENT REGISTRATIONS
// ----------------------------------------------------------------------
export const eventRegistrations = sqliteTable("event_registrations", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  attendeeName: text("attendee_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  studentId: text("student_id"),
  status: text("status", { 
    enum: ["registered", "confirmed", "attended", "cancelled"] 
  }).notNull().default("registered"),
  registeredAt: integer("registered_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("registrations_event_idx").on(table.eventId),
  index("registrations_email_event_idx").on(table.email, table.eventId),
]);

// ----------------------------------------------------------------------
// 11. ANNUAL PLANS (12-Month Program)
// ----------------------------------------------------------------------
export const annualPlans = sqliteTable("annual_plans", {
  id: text("id").primaryKey(),
  academicYear: text("academic_year").notNull(),
  monthNumber: integer("month_number").notNull(), // 1 to 12
  activityTitleEn: text("activity_title_en").notNull(),
  activityTitleAr: text("activity_title_ar"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull().default("academic"),
  status: text("status", { 
    enum: ["planned", "confirmed", "completed", "postponed", "cancelled"] 
  }).notNull().default("planned"),
  targetDate: text("target_date"), // YYYY-MM-DD when verified
  time: text("time"), // e.g. "10:00 AM - 1:00 PM" when verified
  location: text("location"), // e.g. "Faculty Auditorium" when verified
  relatedEventId: text("related_event_id").references(() => events.id, { onDelete: "set null" }),
  documentUrl: text("document_url"),
  documentTitle: text("document_title"),
  notes: text("notes"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("annual_plans_year_month_idx").on(table.academicYear, table.monthNumber),
  index("annual_plans_published_idx").on(table.isPublished),
  index("annual_plans_target_date_idx").on(table.targetDate),
]);

// ----------------------------------------------------------------------
// 12. ANNOUNCEMENTS & NEWS
// ----------------------------------------------------------------------
export const announcements = sqliteTable("announcements", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar"),
  summaryEn: text("summary_en"),
  summaryAr: text("summary_ar"),
  contentEn: text("content_en").notNull(),
  contentAr: text("content_ar"),
  category: text("category").notNull().default("notice"), // notice, news, press, achievement, academic
  coverImageUrl: text("cover_image_url"),
  authorName: text("author_name"),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("published"),
  isPinned: integer("is_pinned", { mode: "boolean" }).notNull().default(false),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("announcements_slug_idx").on(table.slug),
  index("announcements_published_idx").on(table.isPublished),
  index("announcements_status_idx").on(table.status),
  index("announcements_pinned_idx").on(table.isPinned),
]);

// ----------------------------------------------------------------------
// 13. GALLERY ALBUMS
// ----------------------------------------------------------------------
export const galleryAlbums = sqliteTable("gallery_albums", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  coverImageUrl: text("cover_image_url"),
  eventDate: text("event_date"), // YYYY-MM-DD
  academicYear: text("academic_year").notNull(),
  category: text("category").notNull().default("cultural"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("albums_slug_idx").on(table.slug),
  index("albums_published_idx").on(table.isPublished),
  index("albums_year_idx").on(table.academicYear),
]);

// ----------------------------------------------------------------------
// 14. MEDIA ASSETS (Photos inside Albums)
// ----------------------------------------------------------------------
export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  albumId: text("album_id").notNull().references(() => galleryAlbums.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  captionEn: text("caption_en"),
  captionAr: text("caption_ar"),
  credit: text("credit"),
  width: integer("width"),
  height: integer("height"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("media_album_idx").on(table.albumId),
  index("media_sort_idx").on(table.sortOrder),
]);

// ----------------------------------------------------------------------
// 15. LEARNING RESOURCES
// ----------------------------------------------------------------------
export const learningResources = sqliteTable("learning_resources", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar"),
  category: text("category", { 
    enum: ["grammar", "morphology", "rhetoric", "vocabulary", "literature", "reading", "general"] 
  }).notNull().default("grammar"),
  skillLevel: text("skill_level", { 
    enum: ["beginner", "intermediate", "advanced"] 
  }).notNull().default("beginner"),
  fileUrl: text("file_url"),
  contentEn: text("content_en"),
  contentAr: text("content_ar"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  downloadCount: integer("download_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("resources_slug_idx").on(table.slug),
  index("resources_category_idx").on(table.category),
  index("resources_published_idx").on(table.isPublished),
]);

// ----------------------------------------------------------------------
// 16. ACHIEVEMENTS & AWARDS
// ----------------------------------------------------------------------
export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar"),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  category: text("category").notNull().default("competition"), // competition, academic, institutional
  dateAchieved: text("date_achieved"), // YYYY-MM-DD
  certificateUrl: text("certificate_url"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("achievements_published_idx").on(table.isPublished),
]);

// ----------------------------------------------------------------------
// 17. PUBLICATIONS (Magazines, Newsletters, Papers)
// ----------------------------------------------------------------------
export const publications = sqliteTable("publications", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar"),
  publicationType: text("publication_type", { 
    enum: ["magazine", "newsletter", "journal", "report"] 
  }).notNull().default("magazine"),
  issueNo: text("issue_no"),
  publicationDate: text("publication_date"), // YYYY-MM-DD
  coverImageUrl: text("cover_image_url"),
  fileUrl: text("file_url").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("publications_slug_idx").on(table.slug),
  index("publications_type_idx").on(table.publicationType),
  index("publications_published_idx").on(table.isPublished),
]);

// ----------------------------------------------------------------------
// 18. EDITABLE PAGES & CMS SECTIONS
// ----------------------------------------------------------------------
export const editablePages = sqliteTable("editable_pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(), // 'home', 'about', 'history', etc.
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar"),
  metaDescriptionEn: text("meta_description_en"),
  metaDescriptionAr: text("meta_description_ar"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("pages_slug_idx").on(table.slug),
]);

export const pageSections = sqliteTable("page_sections", {
  id: text("id").primaryKey(),
  pageId: text("page_id").notNull().references(() => editablePages.id, { onDelete: "cascade" }),
  sectionKey: text("section_key").notNull(), // 'hero', 'mission', 'values', 'vision'
  contentEn: text("content_en"),
  contentAr: text("content_ar"),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("sections_page_idx").on(table.pageId),
  index("sections_key_idx").on(table.sectionKey),
]);

// ----------------------------------------------------------------------
// 19. AUDIT LOGS (Immutable Activity Log)
// ----------------------------------------------------------------------
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"),
  action: text("action").notNull(), // create, update, delete, publish, archive, login
  targetEntity: text("target_entity").notNull(), // events, members, committee_terms, etc.
  targetId: text("target_id"),
  detailsJson: text("details_json"), // JSON stringified details
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [
  index("audit_user_idx").on(table.userId),
  index("audit_action_idx").on(table.action),
  index("audit_target_idx").on(table.targetEntity),
  index("audit_created_idx").on(table.createdAt),
]);

// ----------------------------------------------------------------------
// 20. CONSENT & TAKEDOWN RECORDS
// ----------------------------------------------------------------------
export const consentRecords = sqliteTable("consent_records", {
  id: text("id").primaryKey(),
  subjectType: text("subject_type", { enum: ["member", "applicant", "attendee"] }).notNull(),
  subjectId: text("subject_id").notNull(),
  consentType: text("consent_type", { enum: ["photo_publication", "data_processing"] }).notNull(),
  isConsented: integer("is_consented", { mode: "boolean" }).notNull().default(true),
  consentTimestamp: integer("consent_timestamp", { mode: "timestamp" }).notNull(),
  notes: text("notes"),
}, (table) => [
  index("consent_subject_idx").on(table.subjectType, table.subjectId),
]);

// ======================================================================
// DRIZZLE RELATIONS
// ======================================================================

export const usersRelations = relations(users, ({ many }) => ({
  auditLogs: many(auditLogs),
  reviewedApplications: many(membershipApplications),
}));

export const membershipApplicationsRelations = relations(membershipApplications, ({ one }) => ({
  reviewer: one(users, {
    fields: [membershipApplications.reviewedById],
    references: [users.id],
  }),
}));

export const membersRelations = relations(members, ({ many }) => ({
  assignments: many(committeeAssignments),
}));

export const committeeTermsRelations = relations(committeeTerms, ({ many }) => ({
  assignments: many(committeeAssignments),
}));

export const committeeAssignmentsRelations = relations(committeeAssignments, ({ one }) => ({
  term: one(committeeTerms, {
    fields: [committeeAssignments.termId],
    references: [committeeTerms.id],
  }),
  member: one(members, {
    fields: [committeeAssignments.memberId],
    references: [members.id],
  }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  registrations: many(eventRegistrations),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
}));

export const galleryAlbumsRelations = relations(galleryAlbums, ({ many }) => ({
  media: many(mediaAssets),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  album: one(galleryAlbums, {
    fields: [mediaAssets.albumId],
    references: [galleryAlbums.id],
  }),
}));

export const editablePagesRelations = relations(editablePages, ({ many }) => ({
  sections: many(pageSections),
}));

export const pageSectionsRelations = relations(pageSections, ({ one }) => ({
  page: one(editablePages, {
    fields: [pageSections.pageId],
    references: [editablePages.id],
  }),
}));
