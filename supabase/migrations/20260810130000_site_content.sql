-- New sitewide content table for the homepage rebuild
-- (Homepage_UI_Design_Brief_wordpress.md / PRD_Navigation_IA_Homepage_Template_wordpress.md).
-- Deliberately separate from `profiles`: hero images, highlight-strip
-- quotes, and the pull-quote banner are page/site chrome, not facts
-- about Tripti as a person - keeping the two apart means a future
-- "redesign the homepage" change never touches the same table as a
-- future "update Tripti's bio" change. Singleton row, same pattern
-- `profiles` already uses. All nullable, no backfill - Tripti supplies
-- real values directly in Supabase.
create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  -- Keyed by page slug ("home", "about", "collections", "museum",
  -- "gallery", "blog") so each page can eventually carry its own hero
  -- image once built - only "home" is read by this task.
  -- Shape per entry: { imageUrl, alt, heading?, tagline? }
  hero_content jsonb,
  -- Array of { pillar: "numismatics" | "philately" | "postal", quote, imageUrl, alt, href }
  highlight_strip jsonb,
  pull_quote text,
  pull_quote_attribution text,
  -- Array of { platform: "Numista" | "Instagram" | "Facebook" | "LinkedIn" | "Postcrossing", url }.
  -- No real handle/profile URL is known for any platform yet, so this
  -- stays null until Tripti supplies real ones - the footer renders
  -- each of the five icons in a visibly inert state rather than a
  -- fabricated link, per "never fabricate."
  social_links jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
