-- Adds a category to exhibit_sheets so award/recognition sheets can get
-- the distinct spotlight/glow treatment from regular collection sheets
-- (Design Doc section 9). A checked `text` column rather than a native
-- Postgres enum - enums are painful to extend later (adding a value is
-- its own migration, non-transactional on older PG versions), while
-- widening this check constraint is a one-line ALTER.
--
-- Existing rows default to 'collection' - none of the current 32 sheets
-- are award content, so this is a pure additive, no-op-for-existing-data
-- change.
alter table public.exhibit_sheets
  add column if not exists category text not null default 'collection';

alter table public.exhibit_sheets
  drop constraint if exists exhibit_sheets_category_check;

alter table public.exhibit_sheets
  add constraint exhibit_sheets_category_check check (category in ('collection', 'award'));
