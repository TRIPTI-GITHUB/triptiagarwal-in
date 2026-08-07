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

/**
 * ExhibitType
 * Mirrors the database "check" constraint on exhibits.type (Step 2.1) —
 * keeping this in sync ensures TypeScript rejects invalid values at
 * write-time, matching what Postgres already enforces at save-time.
 */
export type ExhibitType = "stamps" | "coins" | "mixed";

export interface Exhibit {
  id: string;
  title: string;
  slug: string;
  type: ExhibitType;
  description: string | null;
  sheet_count: number;
  cover_image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * ExhibitSheetCategory
 * Mirrors the database "check" constraint on exhibit_sheets.category -
 * 'award' sheets get the distinct spotlight/glow treatment (Design Doc
 * section 9); everything else is 'collection'.
 */
export type ExhibitSheetCategory = "collection" | "award";

/**
 * ExhibitSheet
 * `caption` is legacy/unused (kept for backward compatibility, never
 * populated going forward) - content is now authored across the five
 * structured fields below, matching ContentGuidelines.md's Collection
 * Pages structure exactly. `curator_note` is a rare, deliberate-discovery
 * micro-interaction (Design Doc section 9) - shown only when a visitor
 * explicitly asks for it, never by default.
 */
export interface ExhibitSheet {
  id: string;
  exhibit_id: string;
  sheet_number: number;
  image_url: string;
  caption: string | null;
  section_title: string | null;
  heading: string | null;
  description: string | null;
  historical_context: string | null;
  interesting_facts: string | null;
  design_features: string | null;
  personal_notes: string | null;
  curator_note: string | null;
  category: ExhibitSheetCategory;
  featured: boolean;
  created_at: string;
  updated_at: string;
}