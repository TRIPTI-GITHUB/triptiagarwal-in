"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { VideoItem } from "@/lib/blog/schema";

interface VideoUploaderProps {
  videos: VideoItem[];
  onChange: (videos: VideoItem[]) => void;
}

// Matches the blog-media bucket's own file_size_limit (200MB) - failing
// fast client-side avoids waiting for the upload to start just to be
// rejected by Storage.
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

function formatBytes(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1000 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
}

/**
 * Uploads real video files to blog-media (unlike VideoListEditor,
 * which links to a video that already lives elsewhere). Both write
 * into the same shared `videos` array - this component only ever
 * touches the entries it created (platform === null).
 */
export function VideoUploader({ videos, onChange }: VideoUploaderProps) {
  const [pending, setPending] = useState<{ name: string; sizeLabel: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const uploaded = videos.filter((v) => v.platform === null);

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const invalid = files.find((f) => !f.type.startsWith("video/") || f.size > MAX_VIDEO_BYTES);
    if (invalid) {
      setError("Every file must be a video under 200MB.");
      return;
    }

    setError(null);
    setPending(files.map((f) => ({ name: f.name, sizeLabel: formatBytes(f.size) })));
    const supabase = createClient();
    const newItems: VideoItem[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("blog-media")
        .upload(path, file, { contentType: file.type, upsert: true });

      setPending((prev) => prev.filter((p) => p.name !== file.name));

      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
      newItems.push({ platform: null, url: data.publicUrl, fileName: file.name, caption: "" });
    }

    if (newItems.length > 0) onChange([...videos, ...newItems]);
  }

  function updateCaption(item: VideoItem, caption: string) {
    onChange(videos.map((v) => (v === item ? { ...v, caption } : v)));
  }

  function remove(item: VideoItem) {
    onChange(videos.filter((v) => v !== item));
  }

  return (
    <div>
      <span className="block text-sm font-medium text-brand-charcoal mb-1.5">Upload video files</span>
      <input
        type="file"
        accept="video/*"
        multiple
        onChange={handleFilesChange}
        className="w-full text-sm text-brand-charcoal file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-brand-gold/15 file:text-brand-gold file:text-sm file:font-medium"
      />
      {pending.map((p) => (
        <p key={p.name} className="text-xs text-brand-charcoal/50 mt-1">
          Uploading {p.name} ({p.sizeLabel})…
        </p>
      ))}
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}

      {uploaded.length > 0 && (
        <ul className="space-y-2 mt-3">
          {uploaded.map((video) => (
            <li key={video.url} className="flex items-center gap-3 border border-brand-gold/20 rounded-md px-3 py-2">
              <span className="text-sm text-brand-charcoal truncate flex-shrink-0 max-w-[40%]" title={video.fileName}>
                {video.fileName}
              </span>
              <input
                type="text"
                value={video.caption ?? ""}
                onChange={(e) => updateCaption(video, e.target.value)}
                placeholder="Caption (optional)"
                className="flex-1 text-sm border border-brand-gold/30 rounded px-2 py-1 outline-none focus:border-brand-gold"
              />
              <button type="button" onClick={() => remove(video)} className="text-red-700 hover:underline text-sm flex-shrink-0">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
