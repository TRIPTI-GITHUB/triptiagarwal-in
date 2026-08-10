import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { milestones } from "@/data/milestones";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description: "Moments from exhibitions, workshops, and milestones along the journey.",
};

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
}

/**
 * collectGalleryPhotos
 * Reframes the existing Milestones imagery (data/milestones.ts) into a
 * flat photo list, per PRD_Navigation_IA_Homepage_Template section 4's
 * "Photo Gallery → existing Milestones imagery, reframed" - no new
 * data model. Real mechanism, not a placeholder: as soon as any
 * milestone gets a `coverImageUrl` or `media[]` entry, it appears here
 * automatically with no code change.
 */
function collectGalleryPhotos(): GalleryPhoto[] {
  const photos: GalleryPhoto[] = [];
  for (const milestone of milestones) {
    if (milestone.coverImageUrl) {
      photos.push({ id: milestone.id, url: milestone.coverImageUrl, caption: milestone.title });
    }
    for (const media of milestone.media ?? []) {
      photos.push({ id: media.id, url: media.imageUrl, caption: media.caption ?? milestone.title });
    }
  }
  return photos;
}

export default function PhotoGalleryPage() {
  const photos = collectGalleryPhotos();

  return (
    <Section>
      <Container>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-charcoal mb-3">Photo Gallery</h1>
        <p className="text-lg text-brand-charcoal/70 mb-12 max-w-2xl">
          Moments from exhibitions, workshops, and milestones along the journey.
        </p>

        {photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <figure key={photo.id} className="border border-brand-gold/20 rounded-sm overflow-hidden bg-white">
                <img src={photo.url} alt={photo.caption} className="w-full aspect-[4/3] object-cover" />
                <figcaption className="px-4 py-3 text-sm text-brand-charcoal/70">{photo.caption}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-brand-charcoal/70">Photos are being added — check back soon.</p>
        )}
      </Container>
    </Section>
  );
}
