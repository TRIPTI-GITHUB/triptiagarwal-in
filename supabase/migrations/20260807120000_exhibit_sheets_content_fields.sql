-- Adds the structured content fields Phase 2 (Exhibit Interactions) needs
-- on exhibit_sheets.
--
-- `caption` is left in place but becomes legacy/unused - content is now
-- authored across five fields matching ContentGuidelines.md's Collection
-- Pages structure. All five are nullable: a sheet can be published with
-- only some (or none) filled in, and the caption panel only renders the
-- sections that have content.
--
-- `curator_note` already exists in production (added directly via the
-- Supabase dashboard ahead of this migration) - the ADD COLUMN IF NOT
-- EXISTS here is just to keep this file as an accurate, idempotent record
-- of the full column so a fresh environment ends up with the same schema.
alter table public.exhibit_sheets
  add column if not exists description text,
  add column if not exists historical_context text,
  add column if not exists interesting_facts text,
  add column if not exists design_features text,
  add column if not exists personal_notes text,
  add column if not exists curator_note text;
