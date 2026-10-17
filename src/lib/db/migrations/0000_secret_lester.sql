CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text,
	`description_en` text,
	`description_ar` text,
	`category` text DEFAULT 'competition' NOT NULL,
	`date_achieved` text,
	`certificate_url` text,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `achievements_published_idx` ON `achievements` (`is_published`);--> statement-breakpoint
CREATE TABLE `announcements` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text,
	`content_en` text NOT NULL,
	`content_ar` text,
	`category` text DEFAULT 'notice' NOT NULL,
	`is_pinned` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`published_at` integer NOT NULL,
	`expires_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `announcements_slug_unique` ON `announcements` (`slug`);--> statement-breakpoint
CREATE INDEX `announcements_slug_idx` ON `announcements` (`slug`);--> statement-breakpoint
CREATE INDEX `announcements_published_idx` ON `announcements` (`is_published`);--> statement-breakpoint
CREATE INDEX `announcements_pinned_idx` ON `announcements` (`is_pinned`);--> statement-breakpoint
CREATE TABLE `annual_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`academic_year` text NOT NULL,
	`month_number` integer NOT NULL,
	`activity_title_en` text NOT NULL,
	`activity_title_ar` text,
	`category` text DEFAULT 'academic' NOT NULL,
	`status` text DEFAULT 'planned' NOT NULL,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `annual_plans_year_month_idx` ON `annual_plans` (`academic_year`,`month_number`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`user_email` text,
	`action` text NOT NULL,
	`target_entity` text NOT NULL,
	`target_id` text,
	`details_json` text,
	`ip_address` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_user_idx` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `audit_target_idx` ON `audit_logs` (`target_entity`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `committee_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`term_id` text NOT NULL,
	`member_id` text NOT NULL,
	`position_title_en` text NOT NULL,
	`position_title_ar` text,
	`rank_order` integer DEFAULT 100 NOT NULL,
	`role_description` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`term_id`) REFERENCES `committee_terms`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `assignments_term_idx` ON `committee_assignments` (`term_id`);--> statement-breakpoint
CREATE INDEX `assignments_member_idx` ON `committee_assignments` (`member_id`);--> statement-breakpoint
CREATE INDEX `assignments_rank_idx` ON `committee_assignments` (`rank_order`);--> statement-breakpoint
CREATE TABLE `committee_positions` (
	`id` text PRIMARY KEY NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text,
	`default_rank` integer DEFAULT 100 NOT NULL,
	`category` text DEFAULT 'executive' NOT NULL,
	`description` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `committee_positions_title_en_unique` ON `committee_positions` (`title_en`);--> statement-breakpoint
CREATE TABLE `committee_terms` (
	`id` text PRIMARY KEY NOT NULL,
	`academic_year` text NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`is_current` integer DEFAULT false NOT NULL,
	`summary_en` text,
	`summary_ar` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `committee_terms_academic_year_unique` ON `committee_terms` (`academic_year`);--> statement-breakpoint
CREATE INDEX `terms_academic_year_idx` ON `committee_terms` (`academic_year`);--> statement-breakpoint
CREATE INDEX `terms_is_current_idx` ON `committee_terms` (`is_current`);--> statement-breakpoint
CREATE TABLE `consent_records` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`consent_type` text NOT NULL,
	`is_consented` integer DEFAULT true NOT NULL,
	`consent_timestamp` integer NOT NULL,
	`notes` text
);
--> statement-breakpoint
CREATE INDEX `consent_subject_idx` ON `consent_records` (`subject_type`,`subject_id`);--> statement-breakpoint
CREATE TABLE `editable_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text,
	`meta_description_en` text,
	`meta_description_ar` text,
	`is_published` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `editable_pages_slug_unique` ON `editable_pages` (`slug`);--> statement-breakpoint
CREATE INDEX `pages_slug_idx` ON `editable_pages` (`slug`);--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`attendee_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`student_id` text,
	`status` text DEFAULT 'registered' NOT NULL,
	`registered_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `registrations_event_idx` ON `event_registrations` (`event_id`);--> statement-breakpoint
CREATE INDEX `registrations_email_event_idx` ON `event_registrations` (`email`,`event_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text,
	`summary_en` text NOT NULL,
	`summary_ar` text,
	`description_en` text,
	`description_ar` text,
	`category` text DEFAULT 'academic' NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`venue` text NOT NULL,
	`cover_image_url` text,
	`capacity` integer,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`is_registration_open` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE INDEX `events_slug_idx` ON `events` (`slug`);--> statement-breakpoint
CREATE INDEX `events_status_idx` ON `events` (`status`);--> statement-breakpoint
CREATE INDEX `events_start_time_idx` ON `events` (`start_time`);--> statement-breakpoint
CREATE INDEX `events_published_idx` ON `events` (`is_published`);--> statement-breakpoint
CREATE TABLE `founders` (
	`id` text PRIMARY KEY NOT NULL,
	`name_en` text NOT NULL,
	`name_ar` text,
	`portrait_url` text,
	`role_title_en` text NOT NULL,
	`role_title_ar` text,
	`bio_en` text,
	`bio_ar` text,
	`founding_year` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `founders_sort_idx` ON `founders` (`sort_order`);--> statement-breakpoint
CREATE INDEX `founders_published_idx` ON `founders` (`is_published`);--> statement-breakpoint
CREATE TABLE `gallery_albums` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text,
	`description_en` text,
	`description_ar` text,
	`cover_image_url` text,
	`event_date` text,
	`academic_year` text NOT NULL,
	`category` text DEFAULT 'cultural' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gallery_albums_slug_unique` ON `gallery_albums` (`slug`);--> statement-breakpoint
CREATE INDEX `albums_slug_idx` ON `gallery_albums` (`slug`);--> statement-breakpoint
CREATE INDEX `albums_published_idx` ON `gallery_albums` (`is_published`);--> statement-breakpoint
CREATE INDEX `albums_year_idx` ON `gallery_albums` (`academic_year`);--> statement-breakpoint
CREATE TABLE `learning_resources` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text,
	`category` text DEFAULT 'grammar' NOT NULL,
	`skill_level` text DEFAULT 'beginner' NOT NULL,
	`file_url` text,
	`content_en` text,
	`content_ar` text,
	`is_published` integer DEFAULT true NOT NULL,
	`download_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learning_resources_slug_unique` ON `learning_resources` (`slug`);--> statement-breakpoint
CREATE INDEX `resources_slug_idx` ON `learning_resources` (`slug`);--> statement-breakpoint
CREATE INDEX `resources_category_idx` ON `learning_resources` (`category`);--> statement-breakpoint
CREATE INDEX `resources_published_idx` ON `learning_resources` (`is_published`);--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`album_id` text NOT NULL,
	`file_url` text NOT NULL,
	`thumbnail_url` text,
	`caption_en` text,
	`caption_ar` text,
	`credit` text,
	`width` integer,
	`height` integer,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`album_id`) REFERENCES `gallery_albums`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `media_album_idx` ON `media_assets` (`album_id`);--> statement-breakpoint
CREATE INDEX `media_sort_idx` ON `media_assets` (`sort_order`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`membership_id` text NOT NULL,
	`full_name_en` text NOT NULL,
	`full_name_ar` text,
	`photo_url` text,
	`email` text NOT NULL,
	`phone` text,
	`student_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`bio_en` text,
	`bio_ar` text,
	`joined_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `members_membership_id_unique` ON `members` (`membership_id`);--> statement-breakpoint
CREATE INDEX `members_status_idx` ON `members` (`status`);--> statement-breakpoint
CREATE INDEX `members_is_public_idx` ON `members` (`is_public`);--> statement-breakpoint
CREATE INDEX `members_membership_id_idx` ON `members` (`membership_id`);--> statement-breakpoint
CREATE TABLE `membership_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`reference_no` text NOT NULL,
	`applicant_name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`category` text DEFAULT 'general_student' NOT NULL,
	`motivation` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`reviewer_notes` text,
	`reviewed_by_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `membership_applications_reference_no_unique` ON `membership_applications` (`reference_no`);--> statement-breakpoint
CREATE INDEX `applications_status_idx` ON `membership_applications` (`status`);--> statement-breakpoint
CREATE INDEX `applications_ref_idx` ON `membership_applications` (`reference_no`);--> statement-breakpoint
CREATE TABLE `page_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`section_key` text NOT NULL,
	`content_en` text,
	`content_ar` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `editable_pages`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sections_page_idx` ON `page_sections` (`page_id`);--> statement-breakpoint
CREATE INDEX `sections_key_idx` ON `page_sections` (`section_key`);--> statement-breakpoint
CREATE TABLE `publications` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title_en` text NOT NULL,
	`title_ar` text,
	`publication_type` text DEFAULT 'magazine' NOT NULL,
	`issue_no` text,
	`publication_date` text,
	`cover_image_url` text,
	`file_url` text NOT NULL,
	`description_en` text,
	`description_ar` text,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `publications_slug_unique` ON `publications` (`slug`);--> statement-breakpoint
CREATE INDEX `publications_slug_idx` ON `publications` (`slug`);--> statement-breakpoint
CREATE INDEX `publications_type_idx` ON `publications` (`publication_type`);--> statement-breakpoint
CREATE INDEX `publications_published_idx` ON `publications` (`is_published`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`value_en` text,
	`value_ar` text,
	`category` text DEFAULT 'general' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `site_settings_key_unique` ON `site_settings` (`key`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`full_name` text NOT NULL,
	`role` text DEFAULT 'read_only' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);