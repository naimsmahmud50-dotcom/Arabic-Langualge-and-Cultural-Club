/**
 * DEVELOPER NOTE:
 * File: src/lib/validations/membership.ts
 * Purpose: Zod Input Validation Schema for Membership Applications & Status Tracking.
 * Institution: Kabi Nazrul Government College, Dhaka
 * Club: Arabic Language & Cultural Club
 * Strictly zero AI emojis.
 */

import { z } from "zod";

export const MembershipApplicationSchema = z.object({
  applicantName: z
    .string()
    .min(2, "Full name must be at least 2 characters.")
    .max(100, "Full name cannot exceed 100 characters.")
    .trim(),
  applicantNameAr: z
    .string()
    .max(100, "Arabic name cannot exceed 100 characters.")
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  email: z
    .string()
    .email("Please enter a valid institutional or personal email address.")
    .toLowerCase()
    .trim(),
  phone: z
    .string()
    .min(6, "Please provide a valid contact phone or WhatsApp number.")
    .max(25, "Phone number cannot exceed 25 characters.")
    .trim(),
  studentId: z
    .string()
    .max(30, "Student ID cannot exceed 30 characters.")
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  department: z
    .string()
    .max(100, "Department cannot exceed 100 characters.")
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  faculty: z
    .string()
    .max(100, "Faculty cannot exceed 100 characters.")
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  academicLevel: z
    .string()
    .max(50, "Academic level cannot exceed 50 characters.")
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  category: z
    .string()
    .default("general_student"),
  arabicProficiency: z
    .enum(["beginner", "intermediate", "advanced", "native"])
    .default("intermediate"),
  motivation: z
    .string()
    .min(15, "Statement of intent must be at least 15 characters.")
    .max(2000, "Statement of intent cannot exceed 2000 characters.")
    .trim(),
  consentAgreed: z
    .boolean()
    .refine(val => val === true, "You must agree to the club constitution and bylaws."),
  directoryConsent: z
    .boolean()
    .optional()
    .default(false),
});

export const StatusTrackingSchema = z.object({
  referenceNo: z
    .string()
    .min(4, "Reference number is required.")
    .max(30, "Reference number is invalid.")
    .trim()
    .toUpperCase(),
  email: z
    .string()
    .email("Valid email required.")
    .toLowerCase()
    .trim(),
});

export type MembershipApplicationInput = z.infer<typeof MembershipApplicationSchema>;
export type StatusTrackingInput = z.infer<typeof StatusTrackingSchema>;
