import { z } from "zod";

export const VIDEO_PLATFORM_OPTIONS = ["youtube", "instagram", "facebook", "other"] as const;
export const POST_LINK_PLATFORM_OPTIONS = ["facebook", "instagram", "youtube", "news", "other"] as const;

export const photoItemSchema = z.object({
  url: z.string().url(),
  fileName: z.string().trim().optional(),
  caption: z.string().trim().optional(),
});

/**
 * One video, either uploaded (platform null, fileName set) or linked
 * to an external platform (platform set, no fileName) - a single
 * shape so both VideoUploader.tsx and VideoListEditor.tsx can share
 * one `videos` array in form state.
 */
export const videoItemSchema = z.object({
  platform: z.enum(VIDEO_PLATFORM_OPTIONS).nullable(),
  url: z.string().url("Enter a valid video URL"),
  fileName: z.string().trim().optional(),
  caption: z.string().trim().optional(),
});

export const documentItemSchema = z.object({
  url: z.string().url(),
  fileName: z.string().trim().min(1),
});

export const linkItemSchema = z.object({
  platform: z.enum(POST_LINK_PLATFORM_OPTIONS),
  url: z.string().url("Enter a valid URL"),
  label: z.string().trim().optional(),
});

/**
 * Shared create/edit post form schema. Unlike lib/coins/schema.ts,
 * this never sees raw FormData strings - the form calls the Server
 * Action directly with an already-typed object (uploads happen
 * client-side first, so no File objects ever need to cross the
 * boundary) - so no string-to-number/boolean preprocessing is needed.
 */
export const postFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  excerpt: z.string().trim().optional(),
  content: z.string().trim().min(1, "Content is required"),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  published: z.boolean(),
  photos: z.array(photoItemSchema),
  videos: z.array(videoItemSchema),
  documents: z.array(documentItemSchema),
  links: z.array(linkItemSchema),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
export type PhotoItem = z.infer<typeof photoItemSchema>;
export type VideoItem = z.infer<typeof videoItemSchema>;
export type DocumentItem = z.infer<typeof documentItemSchema>;
export type LinkItem = z.infer<typeof linkItemSchema>;

/** Suggests a URL slug from a title (e.g. "20 Years of Postcrossing" -> "20-years-of-postcrossing"). */
export function suggestPostSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
