/**
 * Hand-written TypeScript types matching the current Supabase schema.
 * Keep this file in sync whenever a table is added or changed in Step 5+.
 * (Later, this can be auto-generated via the Supabase CLI instead of
 * maintained by hand — not necessary yet at this project size.)
 */

/**
 * AboutPhotoRole
 * Mirrors the shape stored in profiles.about_photos (Design Doc:
 * /about-scrapbook draft page) - "hero" for the top portrait, one
 * "supporting" photo in the Story zone, "ceremony" for the (up to two)
 * overlapping polaroids in the Recognition zone.
 */
export type AboutPhotoRole = "hero" | "supporting" | "ceremony";

export interface AboutPhoto {
  url: string;
  alt: string;
  role: AboutPhotoRole;
}

export interface Profile {
  id: string;
  full_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  // Added for the /about-scrapbook draft page only - all nullable, no
  // effect on the existing /about page's query or rendering.
  tagline: string | null;
  what_i_love_doing: string[] | null;
  accolades: string[] | null;
  about_photos: AboutPhoto[] | null;
  contact_phone: string | null;
  contact_email: string | null;
}

/**
 * HeroContentKey / HighlightStripPillar
 * Mirror the shapes stored in site_content (Homepage rebuild) - a
 * sitewide/page-chrome content table, deliberately separate from
 * `profiles` (see the site_content migration for the reasoning).
 */
export type HeroContentKey = "home" | "about" | "collections" | "museum" | "gallery" | "blog";

export interface HeroContentEntry {
  imageUrl: string;
  alt: string;
  heading?: string;
  tagline?: string;
}

export type HighlightStripPillar = "numismatics" | "philately" | "postal";

export interface HighlightStripItem {
  pillar: HighlightStripPillar;
  quote: string;
  imageUrl: string;
  alt: string;
  href: string;
}

export type SocialPlatform = "Numista" | "Instagram" | "Facebook" | "LinkedIn" | "Postcrossing";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface SiteContent {
  id: string;
  hero_content: Partial<Record<HeroContentKey, HeroContentEntry>> | null;
  highlight_strip: HighlightStripItem[] | null;
  pull_quote: string | null;
  pull_quote_attribution: string | null;
  social_links: SocialLink[] | null;
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
  // The date the milestone actually happened, independent of
  // created_at (when the row was authored) - blog ordering/display
  // uses this, not created_at, so a post can be backdated freely.
  event_date: string;
}

export type PostMediaType = "image" | "video" | "document";
export type VideoPlatform = "youtube" | "instagram" | "facebook" | "other";
export type PostLinkPlatform = "facebook" | "instagram" | "youtube" | "news" | "other";

/**
 * PostMedia
 * A post's photo gallery (media_type "image"), videos (media_type
 * "video" - either a real upload to the blog-media bucket, when
 * `video_platform` is null, or a link to wherever it already lives on
 * YouTube/Instagram/Facebook, when `video_platform` is set), and other
 * uploaded files like PPT/PDF (media_type "document"). `file_name` is
 * the original filename for an upload (any media_type can have one;
 * mainly used for documents, so a download shows "Exhibit Program.pdf"
 * instead of a storage path) - null for a linked video, which has no
 * local file.
 */
export interface PostMedia {
  id: string;
  post_id: string;
  media_type: PostMediaType;
  url: string;
  video_platform: VideoPlatform | null;
  caption: string | null;
  file_name: string | null;
  sort_order: number;
  created_at: string;
}

/** A single "View on X" outbound link attached to a post. */
export interface PostLink {
  id: string;
  post_id: string;
  platform: PostLinkPlatform;
  url: string;
  label: string | null;
  sort_order: number;
  created_at: string;
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
  // museum-v2 (/museum-v2) only - wing numbering/signage order for the
  // new lobby's Entry/Exit arches. Nullable; falls back to created_at
  // order when unset. The existing /museum route never reads this.
  wing_order: number | null;
}

/**
 * LobbyPhoto / MuseumV2Content
 * museum-v2 (/museum-v2) only - the new lobby's photo wall content.
 * Mirrors the shape stored in museum_v2_content.lobby_photos.
 */
export interface LobbyPhoto {
  url: string;
  alt: string;
  position: number;
}

export interface MuseumV2Content {
  id: string;
  lobby_photos: LobbyPhoto[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * CoinType / CoinGrade
 * Mirror the database "check" constraints on coins.coin_type and
 * coins.grade — keeping these in sync ensures TypeScript rejects
 * invalid values at write-time, matching what Postgres already
 * enforces at save-time. `country`, `composition`, and `mintmark` have
 * no such constraint (genuinely free text across 819 imported rows),
 * so they stay `string` and filter options for those are read from
 * DISTINCT values in the data rather than a hardcoded union.
 */
export type CoinType =
  | "Standard circulation coin"
  | "Circulating commemorative coin"
  | "Non-circulating coin"
  | "Other";

export type CoinGrade = "G" | "VG" | "F" | "VF" | "XF" | "AU" | "UNC";

/**
 * Coin
 * The full `coins` base table row, including the three
 * collector-private financial/notes fields (`buying_price_inr`,
 * `estimate_inr`, `private_comment`). Only ever query this shape from
 * authenticated/admin code paths — public pages must query
 * `coins_public` (the `CoinPublic` type below) instead, which the
 * database view enforces by omitting these columns outright.
 */
export interface Coin {
  id: string;
  country: string;
  issuer: string | null;
  currency: string | null;
  face_value: number | null;
  title: string;
  coin_type: CoinType | null;
  shape: string | null;
  composition: string | null;
  weight_g: number | null;
  diameter_mm: number | null;
  thickness_mm: number | null;
  orientation: string | null;
  year: number | null;
  year_raw: string | null;
  year_calendar: string | null;
  mintmark: string | null;
  grade: CoinGrade | null;
  quantity: number;
  for_exchange: boolean;
  collection_tag: string | null;
  obverse_image_url: string | null;
  reverse_image_url: string | null;
  comment: string | null;
  public_comment: string | null;
  buying_price_inr: number | null;
  estimate_inr: number | null;
  private_comment: string | null;
  slug: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * CoinPublic
 * The `coins_public` view — every `Coin` field except the three
 * private financial/notes columns, already filtered to
 * `is_published = true` by the view definition itself. `comment` (the
 * curator's internal working note, distinct from `public_comment`) is
 * still present in the view as defined in the database today; treat it
 * as not intended for display and prefer `public_comment` in any
 * public-facing UI.
 */
export type CoinPublic = Omit<Coin, "buying_price_inr" | "estimate_inr" | "private_comment">;

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