/**
 * Hand-written TypeScript types matching the current Supabase schema.
 * Keep this file in sync whenever a table is added or changed in Step 5+.
 * (Later, this can be auto-generated via the Supabase CLI instead of
 * maintained by hand — not necessary yet at this project size.)
 */

export interface Profile {
  id: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}