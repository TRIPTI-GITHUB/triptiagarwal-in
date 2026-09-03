import { z } from "zod";

// A relative site path, not an absolute URL - keeps the analytics
// tables from ever storing something like "javascript:..." or a
// full external URL a tampered client might send.
const pathSchema = z.string().trim().min(1).max(500).regex(/^\//, "Must be a relative path");

/**
 * These three endpoints are public by nature (any browser can call
 * them), so every field is validated the same way any public form
 * submission would be - untrusted input, not "the client already
 * checked this."
 */
export const sessionStartSchema = z.object({
  sessionKey: z.string().uuid(),
  entryPage: pathSchema,
  referrerDomain: z.string().trim().max(255).optional(),
  utmSource: z.string().trim().max(255).optional(),
  utmMedium: z.string().trim().max(255).optional(),
  utmCampaign: z.string().trim().max(255).optional(),
});

export const pageViewSchema = z.object({
  sessionKey: z.string().uuid(),
  path: pathSchema,
});

export const sessionEndSchema = z.object({
  sessionKey: z.string().uuid(),
  exitPage: pathSchema.optional(),
  durationSeconds: z.number().int().min(0).max(86400),
});

export type SessionStartInput = z.infer<typeof sessionStartSchema>;
export type PageViewInput = z.infer<typeof pageViewSchema>;
export type SessionEndInput = z.infer<typeof sessionEndSchema>;
