ALTER TABLE `announcements` ADD `summary_en` text;
--> statement-breakpoint
ALTER TABLE `announcements` ADD `summary_ar` text;
--> statement-breakpoint
ALTER TABLE `announcements` ADD `cover_image_url` text;
--> statement-breakpoint
ALTER TABLE `announcements` ADD `author_name` text;
--> statement-breakpoint
ALTER TABLE `announcements` ADD `status` text DEFAULT 'published' NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `announcements_status_idx` ON `announcements` (`status`);
