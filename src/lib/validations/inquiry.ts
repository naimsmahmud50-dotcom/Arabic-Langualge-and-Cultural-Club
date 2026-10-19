/**
 * DEVELOPER NOTE:
 * File: src/lib/validations/inquiry.ts
 * Purpose: Zod Input Validation Schema for Official Correspondence & Inquiries.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly zero AI emojis.
 */

import { z } from "zod";

export const ContactInquirySchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters.")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid correspondence email address.")
    .max(150, "Email address is too long.")
    .toLowerCase()
    .trim(),
  department: z
    .enum(["general", "academic", "debate", "membership", "media"])
    .default("general"),
  subject: z
    .string()
    .min(3, "Subject must be at least 3 characters.")
    .max(200, "Subject cannot exceed 200 characters.")
    .trim(),
  message: z
    .string()
    .min(10, "Message must contain at least 10 characters.")
    .max(3000, "Message cannot exceed 3000 characters.")
    .trim(),
  // Anti-Spam Honeypot: Must be empty
  website_url: z
    .string()
    .optional()
    .nullable(),
});

export type ContactInquiryInput = z.infer<typeof ContactInquirySchema>;
