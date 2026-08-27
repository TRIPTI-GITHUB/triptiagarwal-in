# Changelog

All notable changes to this project are recorded here, newest first.

## 2026-08-27 — Blog: hobby-journey milestones (photos, videos, links)

- `posts` gained `event_date` (the date a milestone actually happened, independent of `created_at`) — `/blog` now orders and displays by this, not `created_at`.
- New `post_media` and `post_links` tables: a per-post photo gallery, linked videos (YouTube embeds inline; Instagram/Facebook/other render as a "Watch on X ↗" card), and outbound social links.
- New `blog-media` storage bucket for uploaded photos — videos are always linked, never uploaded.
- Auth-gated admin at `/admin/blog` (list, create, edit, delete) reusing the Supabase Auth gate (`proxy.ts`, `/admin/login`) built for the coins admin. Not linked from the public nav.
- 10 draft posts seeded from a 2025 hobby-milestones timeline, awaiting real photos/videos/links via the new admin UI.

## 2026-08-27 — Coins collection: listing, detail, and admin CRUD

- `/collections/coins`: paginated, filterable (country/type/composition/grade/mintmark/year range/exchange), searchable listing querying `coins_public` only (never the base `coins` table, which carries private financial fields), with a stats strip and a decade-of-mint histogram.
- `/collections/coins/[slug]`: full spec table, public comment, related coins (same country, falling back to same decade), SEO metadata, OG tags, and JSON-LD structured data.
- Auth-gated admin at `/admin` (Supabase Auth) for coin CRUD with obverse/reverse image upload to a new `coins` storage bucket.
- `proxy.ts` introduced as the auth gate (Next.js 16 renamed `middleware.ts` → `proxy.ts`).

## 2026-08-27 — Milestones page

- New `/about/key-milestones` page displaying the four milestone infographic images from the Supabase `Milestones` storage bucket, one at a time with Previous/Next navigation. Linked under **About → Key Milestones**.
