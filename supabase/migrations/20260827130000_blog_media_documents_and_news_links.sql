-- Blog admin form update: real video/document uploads, "news" link
-- platform. Reconstructed from the live schema for this repo's
-- migration history - the actual changes were already applied
-- directly against the project before this file was added here, so
-- running this again is a safe no-op (every statement is idempotent).

-- Original filename for an upload (any media_type can have one -
-- mainly used for documents, so a download shows "Exhibit
-- Program.pdf" instead of a storage path). Null for a linked video,
-- which has no local file.
alter table public.post_media
  add column if not exists file_name text;

-- 'document' joins 'image'/'video' - PPT/PDF/etc. uploads now get
-- their own post_media rows alongside photos and videos.
alter table public.post_media drop constraint if exists post_media_media_type_check;
alter table public.post_media
  add constraint post_media_media_type_check
  check (media_type in ('image', 'video', 'document'));

-- 'news' joins the existing platforms - for linking out to a news
-- article about the milestone, separate from an actual video upload.
alter table public.post_links drop constraint if exists post_links_platform_check;
alter table public.post_links
  add constraint post_links_platform_check
  check (platform in ('facebook', 'instagram', 'youtube', 'news', 'other'));

-- Videos and documents can run larger than the original photo-only
-- bucket assumed; 200MB per file.
update storage.buckets
set file_size_limit = 209715200
where id = 'blog-media';
