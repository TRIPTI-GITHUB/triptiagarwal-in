import { MonogramIcon } from "@/components/layout/SocialIcons";
import { parseYouTubeVideoId } from "@/lib/blog/queries";
import type { PostMedia, VideoPlatform } from "@/lib/supabase/database.types";

interface VideoEmbedProps {
  video: PostMedia;
}

const PLATFORM_LABEL: Record<VideoPlatform, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  facebook: "Facebook",
  other: "the source",
};

const PLATFORM_LETTER: Record<VideoPlatform, string> = {
  youtube: "Y",
  instagram: "I",
  facebook: "F",
  other: "V",
};

/**
 * One post_media video row. YouTube plays inline via an iframe embed
 * when a video ID can actually be parsed from the URL; every other
 * platform (and any unparseable YouTube URL) renders a "Watch on X ↗"
 * link-out card instead - videos are only ever linked, never uploaded,
 * so there's no local file to fall back to rendering.
 */
export function VideoEmbed({ video }: VideoEmbedProps) {
  const platform = video.video_platform ?? "other";
  const videoId = platform === "youtube" ? parseYouTubeVideoId(video.url) : null;

  if (videoId) {
    return (
      <div>
        <div className="aspect-video w-full bg-brand-charcoal/5 border border-brand-gold/20 rounded-sm overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={video.caption ?? "YouTube video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="w-full h-full"
          />
        </div>
        {video.caption && <p className="text-sm text-brand-charcoal/70 mt-2">{video.caption}</p>}
      </div>
    );
  }

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 border border-brand-gold/20 rounded-sm bg-white px-5 py-4 hover:border-brand-gold transition-colors"
    >
      <span className="text-brand-charcoal/60">
        <MonogramIcon letter={PLATFORM_LETTER[platform]} />
      </span>
      <span className="text-sm font-medium text-brand-charcoal">
        Watch on {PLATFORM_LABEL[platform]} ↗
        {video.caption && <span className="block text-xs font-normal text-brand-charcoal/60 mt-0.5">{video.caption}</span>}
      </span>
    </a>
  );
}
