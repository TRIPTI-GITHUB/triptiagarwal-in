-- Adds the fields the new /about-scrapbook draft page needs (a parallel
-- review page, not a replacement for /about) - all nullable/empty by
-- default so the existing /about page's query and rendering are
-- completely unaffected, and no placeholder content is backfilled;
-- Tripti supplies real values directly in Supabase.
alter table public.profiles
  add column if not exists tagline text,
  add column if not exists what_i_love_doing jsonb,
  add column if not exists accolades jsonb,
  add column if not exists about_photos jsonb,
  add column if not exists contact_phone text,
  add column if not exists contact_email text;
