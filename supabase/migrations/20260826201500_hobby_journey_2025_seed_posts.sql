-- Seeds 10 draft posts (published = false) transcribed from a
-- timeline image of 2025 hobby milestones. Reconstructed from the
-- live data for this repo's migration history - `on conflict (slug)
-- do nothing` makes re-running this a safe no-op. Real photos/videos/
-- links get filled in through the /admin/blog UI, not here.

insert into public.posts (title, slug, excerpt, content, event_date, published)
values
  (
    'Shri Ram Janmabhoomi Silver Coin Added to Collection',
    'shri-ram-janmabhoomi-silver-coin',
    'A Shri Ram Janmabhoomi silver coin joined the collection.',
    E'A Shri Ram Janmabhoomi silver coin was added to the collection this month.\n\nAdd the full story, photos, and any related links here.',
    '2025-01-01',
    false
  ),
  (
    'Vasant Utsav 2025 — Flower Theme Exhibit',
    'vasant-utsav-2025-flower-theme',
    'Participated in Vasant Utsav 2025 with exhibits on a flower theme.',
    E'Participated in Vasant Utsav 2025 with exhibits on a flower theme.\n\nAdd the full story, photos, and any related links here.',
    '2025-03-01',
    false
  ),
  (
    'Virtual Stampex, London — "Guardians of the Tricolor"',
    'virtual-stampex-london-guardians-of-the-tricolor',
    'Participated in Virtual Stampex, London, with exhibits on the theme "Guardians of the Tricolor."',
    E'Participated in Virtual Stampex, London, with exhibits on the theme "Guardians of the Tricolor."\n\nAdd the full story, photos, and any related links here.',
    '2025-03-02',
    false
  ),
  (
    '20 Years of Postcrossing — Meetup & Philately Workshop, Kala Kendra Dehradun',
    '20-years-of-postcrossing-kala-kendra-dehradun',
    'Celebrated 20 years of Postcrossing with a meetup and philately workshop at Kala Kendra, Dehradun.',
    E'Celebrated 20 years of Postcrossing by organizing a Postcrossing meetup and philately workshop at Kala Kendra, Dehradun. A private meetup card was released for the occasion.\n\nAdd the full story, photos, and any related links here.',
    '2025-07-13',
    false
  ),
  (
    'World Postcard Day — Kala Kendra Dehradun',
    'world-postcard-day-2025-kala-kendra-dehradun',
    'Celebrated World Postcard Day at Kala Kendra Dehradun with a private picture postcard release and philately workshop.',
    E'Celebrated World Postcard Day at Kala Kendra Dehradun with the release of a private picture postcard, alongside a philately workshop for participants from FRI (Forest Research Institute).\n\nAdd the full story, photos, and any related links here.',
    '2025-10-01',
    false
  ),
  (
    'Kids'' Philately & Postcard Writing Activity — Punnya Experiential Learning School',
    'kids-philately-postcard-writing-punnya-school',
    'Hosted a kids-friendly philately and postcard-writing activity for students of Punnya Experiential Learning School, Dehradun.',
    E'Hosted a kids-friendly philately and postcard-writing activity for students of Punnya Experiential Learning School, Dehradun.\n\nAdd the full story, photos, and any related links here.',
    '2025-10-09',
    false
  ),
  (
    '150th Birth Anniversary of Sardar Vallabhbhai Patel — Proof Coin Set & Stamp',
    'sardar-patel-150th-birth-anniversary-proof-coin-set',
    'Acquired a proof coin set and stamp for the 150th birth anniversary of Sardar Vallabhbhai Patel.',
    E'Acquired a proof coin set and stamp on the occasion of the 150th birth anniversary of Sardar Vallabhbhai Patel.\n\nAdd the full story, photos, and any related links here.',
    '2025-11-01',
    false
  ),
  (
    'Children''s Day Exhibit',
    'childrens-day-exhibit-2025',
    'Prepared exhibits for the Children''s Day theme.',
    E'Prepared exhibits for the Children\'s Day theme.\n\nAdd the full story, photos, and any related links here.',
    '2025-11-14',
    false
  ),
  (
    'Constitution Day — Significance Exhibit',
    'constitution-day-exhibit-2025',
    'Prepared exhibits related to the significance of Constitution Day.',
    E'Prepared exhibits related to the significance of Constitution Day.\n\nAdd the full story, photos, and any related links here.',
    '2025-11-26',
    false
  ),
  (
    'December 2025 Milestone (Coming Soon)',
    'december-2025-milestone',
    'Reserved for a December 2025 milestone — details to come.',
    E'Placeholder for a December 2025 milestone — the timeline graphic left this one blank.\n\nAdd the story, photos, and any related links here once there\'s something to share.',
    '2025-12-01',
    false
  )
on conflict (slug) do nothing;
