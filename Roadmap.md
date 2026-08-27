# Roadmap

Near-term next steps, grouped by area. Not a commitment or a timeline — just what's visibly next given what's shipped so far.

## Blog

- Fill in real photos, videos, and links for the 10 seeded 2025 draft posts via `/admin/blog`, then publish them.
- Consider a rich-text or Markdown editor for `content` if plain text + line breaks stops being enough.

## Coins collection

- `coins_public` still exposes a `comment` column (distinct from `public_comment`) that reads like an internal curator note — worth excluding from the view if it's not meant to be public. Not currently rendered anywhere on the public site, but the view itself doesn't hide it.
- `coins` has a full-text-search index (`to_tsvector` on title/country/issuer) that the `/collections/coins` search bar doesn't use yet (it uses `ilike` instead, since PostgREST's `.textSearch()` needs a real column, and exposing a `tsvector` column would mean altering `coins_public`). Fine at 819 rows; revisit if the collection grows an order of magnitude.
- Filters are single-select today (one country, one composition, etc.) — multi-select would let a visitor compare across countries in one view, at real UI complexity cost.

## Collections nav (still "coming soon")

- `/collections/thematic-highlights` and `/about/recognition` are placeholder pages per the original nav plan — not started.

## Admin

- Single shared Supabase Auth account today (no per-admin roles) — fine for a single-owner site; would need real role-based access if a second editor ever joins.
