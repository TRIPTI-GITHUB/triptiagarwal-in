-- museum-v2 (parallel route, /museum-v2) - the new lobby's own
-- content, deliberately separate from `profiles` (these photos are
-- museum-lobby set-dressing, not facts about Tripti as a person - same
-- reasoning as why `site_content` stayed separate from `profiles`) and
-- from `site_content` (that table is the live homepage's chrome; this
-- one is scoped to the /museum-v2 experiment so the two can evolve, or
-- be torn down, independently). Singleton row, same pattern as
-- `site_content`. All nullable, no backfill - Tripti supplies real
-- values directly in Supabase.
create table if not exists public.museum_v2_content (
  id uuid primary key default gen_random_uuid(),
  -- Array of { url, alt, position }. Up to 4 entries (3 confirmed
  -- photos + one reserved empty slot) - fewer entries just render
  -- fewer frames on the photo wall, never a broken-image placeholder.
  lobby_photos jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Public content, same posture as site_content: readable by anyone via
-- the anon key, writable only via the Supabase dashboard / service role.
alter table public.museum_v2_content enable row level security;

create policy "museum_v2_content is publicly readable"
  on public.museum_v2_content
  for select
  to anon, authenticated
  using (true);
