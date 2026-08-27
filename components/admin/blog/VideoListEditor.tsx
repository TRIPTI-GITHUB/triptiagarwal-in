"use client";

import { useState } from "react";
import { VIDEO_PLATFORM_OPTIONS, type VideoItem } from "@/lib/blog/schema";

interface VideoListEditorProps {
  videos: VideoItem[];
  onChange: (videos: VideoItem[]) => void;
}

/**
 * Links to a video that already lives elsewhere (YouTube/Instagram/
 * Facebook), as opposed to VideoUploader's real file uploads - both
 * write into the same shared `videos` array, so this component only
 * ever touches/displays the entries it created (platform set, not null).
 */
export function VideoListEditor({ videos, onChange }: VideoListEditorProps) {
  const [platform, setPlatform] = useState<Exclude<VideoItem["platform"], null>>("youtube");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);

  const linked = videos.filter((v) => v.platform !== null);

  function addVideo() {
    if (!url.trim()) {
      setError("Enter a video URL first.");
      return;
    }
    try {
      new URL(url.trim());
    } catch {
      setError("That doesn't look like a valid URL.");
      return;
    }
    setError(null);
    onChange([...videos, { platform, url: url.trim(), caption: caption.trim() || undefined }]);
    setUrl("");
    setCaption("");
  }

  function remove(item: VideoItem) {
    onChange(videos.filter((v) => v !== item));
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Exclude<VideoItem["platform"], null>)}
          className="rounded-md border border-brand-gold/30 bg-white px-2 py-1.5 text-sm"
        >
          {VIDEO_PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Video URL"
          className="flex-1 rounded-md border border-brand-gold/30 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-gold"
        />
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className="flex-1 rounded-md border border-brand-gold/30 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-gold"
        />
        <button
          type="button"
          onClick={addVideo}
          className="rounded-full bg-brand-gold/15 text-brand-gold text-sm font-medium px-4 py-1.5 hover:bg-brand-gold/25 transition-colors"
        >
          Add video
        </button>
      </div>
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}

      {linked.length > 0 && (
        <ul className="space-y-2 mt-3">
          {linked.map((video) => (
            <li key={video.url} className="flex items-center justify-between gap-3 border border-brand-gold/20 rounded-md px-3 py-2 text-sm">
              <div className="min-w-0">
                <span className="uppercase text-xs text-brand-gold font-medium mr-2">{video.platform}</span>
                <span className="text-brand-charcoal truncate">{video.caption || video.url}</span>
              </div>
              <button type="button" onClick={() => remove(video)} className="text-red-700 hover:underline flex-shrink-0">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
