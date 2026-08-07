-- Adds a `featured` flag to exhibit_sheets so the site owner can curate
-- the "Quick Look" guided tour (Design Doc section 5) directly in
-- Supabase - no admin UI needed. Defaults to false; every existing sheet
-- stays out of Quick Look until deliberately flagged, so this is a pure
-- additive, no-op-for-existing-data change (same pattern as the Phase 2
-- content fields and Phase 3 category column).
alter table public.exhibit_sheets
  add column if not exists featured boolean not null default false;
