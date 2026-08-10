import Link from "next/link";
import type { Profile } from "@/lib/supabase/database.types";

interface StoryTeaserProps {
  profile: Pick<Profile, "bio" | "full_name" | "about_photos"> | null;
}

function firstParagraphs(bio: string, count: number): string {
  const paragraphs = bio.split(/\n{2,}/).filter(Boolean);
  return paragraphs.slice(0, count).join("\n\n");
}

/**
 * StoryTeaser
 * A human moment before the Pull-Quote Banner (Design Brief section 5)
 * - reuses the real, already-approved `profiles.bio` and the
 * "supporting" about_photos entry (the same photo already scoped for
 * /about-scrapbook) rather than writing new copy from scratch, per the
 * brief's own recommendation. Renders nothing if there's no bio yet -
 * a section with no real content to excerpt just doesn't render,
 * rather than showing a placeholder paragraph.
 */
export function StoryTeaser({ profile }: StoryTeaserProps) {
  if (!profile?.bio) return null;

  const photo = profile.about_photos?.find((p) => p.role === "supporting") ?? null;
  const excerpt = firstParagraphs(profile.bio, 2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
      <div className="order-1">
        <div className="aspect-[4/5] w-full max-w-md mx-auto overflow-hidden rounded-sm bg-brand-teal/5">
          {photo ? (
            <img src={photo.url} alt={photo.alt || profile.full_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-charcoal/30 text-sm italic">
              Photo coming soon
            </div>
          )}
        </div>
      </div>
      <div className="order-2">
        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-brand-charcoal mb-5">
          {profile.full_name}&rsquo;s Story
        </h2>
        <div className="text-brand-charcoal/85 text-lg leading-relaxed whitespace-pre-line mb-6">{excerpt}</div>
        <Link href="/about" className="text-brand-teal font-medium hover:underline underline-offset-4">
          Read the full story →
        </Link>
      </div>
    </div>
  );
}
