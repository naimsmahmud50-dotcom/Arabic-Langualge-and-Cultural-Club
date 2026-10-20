-- Migration 0004: Gallery Enhancements (Event Linking, Photographer Attribution, Location, and Video Media Support)
ALTER TABLE `gallery_albums` ADD `related_event_id` text REFERENCES `events`(`id`) ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE `gallery_albums` ADD `photographer_credit` text;
--> statement-breakpoint
ALTER TABLE `gallery_albums` ADD `location` text;
--> statement-breakpoint
ALTER TABLE `gallery_albums` ADD `date_notes` text;
--> statement-breakpoint
ALTER TABLE `gallery_albums` ADD `is_archived` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `albums_category_idx` ON `gallery_albums` (`category`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `albums_archived_idx` ON `gallery_albums` (`is_archived`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `albums_event_idx` ON `gallery_albums` (`related_event_id`);
--> statement-breakpoint
ALTER TABLE `media_assets` ADD `media_type` text DEFAULT 'image' NOT NULL;
--> statement-breakpoint
ALTER TABLE `media_assets` ADD `video_url` text;
--> statement-breakpoint
ALTER TABLE `media_assets` ADD `alt_text` text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `media_published_idx` ON `media_assets` (`is_published`);
