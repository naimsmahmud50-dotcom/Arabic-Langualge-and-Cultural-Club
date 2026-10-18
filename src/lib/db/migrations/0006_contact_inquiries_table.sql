-- Migration 0006: Contact Inquiries and Institutional Correspondence Table
CREATE TABLE IF NOT EXISTS `contact_inquiries` (
  `id` text PRIMARY KEY NOT NULL,
  `reference_no` text NOT NULL UNIQUE,
  `full_name` text NOT NULL,
  `email` text NOT NULL,
  `department` text DEFAULT 'general' NOT NULL,
  `subject` text NOT NULL,
  `message` text NOT NULL,
  `status` text DEFAULT 'unread' NOT NULL,
  `delivery_status` text DEFAULT 'stored_locally' NOT NULL,
  `ip_address` text,
  `admin_notes` text,
  `replied_at` integer,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `inquiries_status_idx` ON `contact_inquiries` (`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `inquiries_ref_idx` ON `contact_inquiries` (`reference_no`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `inquiries_email_idx` ON `contact_inquiries` (`email`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `inquiries_dept_idx` ON `contact_inquiries` (`department`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `inquiries_created_idx` ON `contact_inquiries` (`created_at`);
