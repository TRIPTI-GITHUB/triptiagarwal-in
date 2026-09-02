import { z } from "zod";

/**
 * Shared contact form schema. `honeypot` is a hidden field real
 * visitors never see or fill - anything in it means a bot filled
 * every input it found, so the action treats it as spam. No format
 * enforced on `phone` since people write numbers differently
 * (spaces, dashes, country codes) and it's optional besides.
 */
export const contactFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().optional(),
  message: z.string().trim().min(1, "Please enter a message"),
  honeypot: z.string().optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
