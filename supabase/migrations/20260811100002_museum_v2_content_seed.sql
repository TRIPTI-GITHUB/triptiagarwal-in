-- Seeds the 3 confirmed lobby photo URLs (already public, TriptiProfile
-- bucket) into the museum_v2_content singleton. Alt text is a clearly
-- marked TODO, not a fabricated description - see the final report for
-- this task: this route is not launch-ready until Tripti supplies real
-- alt text for each photo. `position` is the photo wall's 1-based slot
-- order; slot 4 is intentionally left unseeded (reserved, renders
-- gracefully empty rather than a broken-image placeholder).
insert into public.museum_v2_content (lobby_photos)
select '[
  {
    "url": "https://fegcrymnvukdglzffeja.supabase.co/storage/v1/object/public/TriptiProfile/Tripti%20-%20Snapshot%20of%20some%20memories.jpeg",
    "alt": "TODO: alt text pending from Tripti",
    "position": 1
  },
  {
    "url": "https://fegcrymnvukdglzffeja.supabase.co/storage/v1/object/public/TriptiProfile/Tripti@RajBhavan.jpeg",
    "alt": "TODO: alt text pending from Tripti",
    "position": 2
  },
  {
    "url": "https://fegcrymnvukdglzffeja.supabase.co/storage/v1/object/public/TriptiProfile/a%20good%20one%20tg.jpg",
    "alt": "TODO: alt text pending from Tripti",
    "position": 3
  }
]'::jsonb
where not exists (select 1 from public.museum_v2_content);
