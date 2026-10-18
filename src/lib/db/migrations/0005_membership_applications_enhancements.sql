-- Migration 0005: Membership Applications Enhancements (Educational Info, Proficiency, Consent, and Review Timestamps)
ALTER TABLE `membership_applications` ADD `applicant_name_ar` text;
--> statement-breakpoint
ALTER TABLE `membership_applications` ADD `student_id` text;
--> statement-breakpoint
ALTER TABLE `membership_applications` ADD `department` text;
--> statement-breakpoint
ALTER TABLE `membership_applications` ADD `faculty` text;
--> statement-breakpoint
ALTER TABLE `membership_applications` ADD `academic_level` text;
--> statement-breakpoint
ALTER TABLE `membership_applications` ADD `arabic_proficiency` text DEFAULT 'intermediate';
--> statement-breakpoint
ALTER TABLE `membership_applications` ADD `consent_agreed` integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE `membership_applications` ADD `directory_consent` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `membership_applications` ADD `reviewed_at` integer;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `applications_email_idx` ON `membership_applications` (`email`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `applications_student_id_idx` ON `membership_applications` (`student_id`);
