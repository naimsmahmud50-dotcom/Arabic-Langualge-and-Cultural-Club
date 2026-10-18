ALTER TABLE `annual_plans` ADD `description_en` text;
--> statement-breakpoint
ALTER TABLE `annual_plans` ADD `description_ar` text;
--> statement-breakpoint
ALTER TABLE `annual_plans` ADD `target_date` text;
--> statement-breakpoint
ALTER TABLE `annual_plans` ADD `time` text;
--> statement-breakpoint
ALTER TABLE `annual_plans` ADD `location` text;
--> statement-breakpoint
ALTER TABLE `annual_plans` ADD `related_event_id` text REFERENCES `events`(`id`) ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE `annual_plans` ADD `document_url` text;
--> statement-breakpoint
ALTER TABLE `annual_plans` ADD `document_title` text;
--> statement-breakpoint
ALTER TABLE `annual_plans` ADD `is_published` integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `annual_plans_published_idx` ON `annual_plans` (`is_published`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `annual_plans_target_date_idx` ON `annual_plans` (`target_date`);
