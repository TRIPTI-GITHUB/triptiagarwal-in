import type { PostMedia } from "@/lib/supabase/database.types";

interface PhotoGalleryProps {
  photos: PostMedia[];
}

/**
 * Grid of a post's uploaded photos (post_media where media_type =
 * "image"). Same card styling as app/gallery/photo/page.tsx, for
 * visual consistency with the site's other photo grids.
 */
export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {photos.map((photo) => (
        <figure key={photo.id} className="border border-brand-gold/20 rounded-sm overflow-hidden bg-white">
          <img src={photo.url} alt={photo.caption ?? ""} className="w-full aspect-[4/3] object-cover" />
          {photo.caption && (
            <figcaption className="px-4 py-3 text-sm text-brand-charcoal/70">{photo.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
