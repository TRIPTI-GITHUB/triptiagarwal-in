-- Blog feature: hobby-journey milestones (photos, videos, links).
-- Reconstructed from the live schema for this repo's migration
-- history - the actual changes were already applied directly against
-- the project before this file was added here, so running this again
-- is a safe no-op (every statement is idempotent).

-- The date a milestone actually happened, independent of created_at
-- (when the row was authored) - blog ordering/display uses this, not
-- created_at, so a post can be backdated or scheduled freely.
alter table public.posts
  add column if not exists event_date date not null default current_date;

-- posts previously had no insert/update/delete policy at all
-- (dashboard/service-role only). The new admin UI writes as a
-- signed-in user, so it needs its own manage policy.
drop policy if exists "Authenticated users can view all posts" on public.posts;
create policy "Authenticated users can view all posts"
  on public.posts
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users manage posts" on public.posts;
create policy "Authenticated users manage posts"
  on public.posts
  for all
  to authenticated
  using (true)
  with check (true);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  url text not null,
  -- Only set for media_type = 'video'. Videos are never uploaded, only
  -- linked (to whatever's already on YouTube/Instagram/Facebook), to
  -- avoid storage/bandwidth cost.
  video_platform text check (video_platform in ('youtube', 'instagram', 'facebook', 'other')),
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.post_media enable row level security;

drop policy if exists "Anyone can view media for published posts" on public.post_media;
create policy "Anyone can view media for published posts"
  on public.post_media
  for select
  to anon, authenticated
  using (exists (select 1 from public.posts p where p.id = post_id and p.published = true));

drop policy if exists "Authenticated users can view all post media" on public.post_media;
create policy "Authenticated users can view all post media"
  on public.post_media
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users manage post media" on public.post_media;
create policy "Authenticated users manage post media"
  on public.post_media
  for all
  to authenticated
  using (true)
  with check (true);

create table if not exists public.post_links (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  platform text not null check (platform in ('facebook', 'instagram', 'youtube', 'other')),
  url text not null,
  label text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.post_links enable row level security;

drop policy if exists "Anyone can view links for published posts" on public.post_links;
create policy "Anyone can view links for published posts"
  on public.post_links
  for select
  to anon, authenticated
  using (exists (select 1 from public.posts p where p.id = post_id and p.published = true));

drop policy if exists "Authenticated users can view all post links" on public.post_links;
create policy "Authenticated users can view all post links"
  on public.post_links
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users manage post links" on public.post_links;
create policy "Authenticated users manage post links"
  on public.post_links
  for all
  to authenticated
  using (true)
  with check (true);

-- Photos only (never videos) upload here from the admin UI, straight
-- from the browser via the Supabase browser client.
insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

drop policy if exists "Public can view blog media" on storage.objects;
create policy "Public can view blog media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'blog-media');

drop policy if exists "Authenticated users can upload blog media" on storage.objects;
create policy "Authenticated users can upload blog media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'blog-media');

drop policy if exists "Authenticated users can update blog media" on storage.objects;
create policy "Authenticated users can update blog media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'blog-media');

drop policy if exists "Authenticated users can delete blog media" on storage.objects;
create policy "Authenticated users can delete blog media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'blog-media');
