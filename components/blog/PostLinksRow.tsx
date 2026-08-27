import { MonogramIcon } from "@/components/layout/SocialIcons";
import type { PostLink, PostLinkPlatform } from "@/lib/supabase/database.types";

interface PostLinksRowProps {
  links: PostLink[];
}

const PLATFORM_LETTER: Record<PostLinkPlatform, string> = {
  facebook: "F",
  instagram: "I",
  youtube: "Y",
  other: "L",
};

const PLATFORM_LABEL: Record<PostLinkPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  other: "the source",
};

/** "View on Facebook/Instagram/YouTube" outbound buttons from post_links. */
export function PostLinksRow({ links }: PostLinksRowProps) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-brand-gold/40 px-4 py-2 text-sm font-medium text-brand-charcoal hover:bg-brand-gold/10 transition-colors"
        >
          <MonogramIcon letter={PLATFORM_LETTER[link.platform]} />
          {link.label || `View on ${PLATFORM_LABEL[link.platform]}`}
        </a>
      ))}
    </div>
  );
}
