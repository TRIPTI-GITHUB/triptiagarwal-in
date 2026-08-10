import type { ReactNode } from "react";
import { SOCIAL_PLATFORMS } from "@/lib/navigation";
import type { SocialLink, SocialPlatform } from "@/lib/supabase/database.types";

interface SocialIconsProps {
  links: SocialLink[] | null;
  className?: string;
}

// This project's installed lucide-react version ships no brand icons
// at all (Instagram/Facebook/Linkedin included - removed upstream over
// licensing) - simple inline monogram badges for all five platforms,
// matching BrandIdentity.md's "minimal, consistent, elegant"
// iconography rule rather than sourcing external brand marks.
function MonogramIcon({ letter }: { letter: string }) {
  return (
    <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-semibold leading-none">
      {letter}
    </span>
  );
}

const PLATFORM_ICON: Record<SocialPlatform, ReactNode> = {
  Numista: <MonogramIcon letter="N" />,
  Instagram: <MonogramIcon letter="I" />,
  Facebook: <MonogramIcon letter="F" />,
  LinkedIn: <MonogramIcon letter="L" />,
  Postcrossing: <MonogramIcon letter="P" />,
};

/**
 * SocialIcons
 * Renders all five confirmed platforms (PRD section 7.5) in a fixed
 * order regardless of which ones have a real URL yet - platforms
 * without a URL in `links` render visibly inert (no fabricated link)
 * rather than being silently dropped, so the row's width/spacing
 * never shifts once real URLs are added.
 */
export function SocialIcons({ links, className = "" }: SocialIconsProps) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {SOCIAL_PLATFORMS.map((platform) => {
        const url = links?.find((l) => l.platform === platform)?.url;
        const icon = PLATFORM_ICON[platform];

        if (url) {
          return (
            <a
              key={platform}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={platform}
              className="text-brand-charcoal/60 hover:text-brand-gold transition-colors"
            >
              {icon}
            </a>
          );
        }

        return (
          <span key={platform} aria-hidden="true" className="text-brand-charcoal/20 cursor-default">
            {icon}
          </span>
        );
      })}
    </div>
  );
}
