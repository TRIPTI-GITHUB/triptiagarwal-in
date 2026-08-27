"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PhotoItem } from "@/lib/blog/schema";

interface PhotoGalleryUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function PhotoGalleryUploader({ photos, onChange }: PhotoGalleryUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const invalid = files.find((f) => !f.type.startsWith("image/") || f.size > MAX_IMAGE_BYTES);
    if (invalid) {
      setError("Every file must be an image under 8MB.");
      return;
    }

    setError(null);
    setUploading(true);
    const supabase = createClient();
    const uploaded: PhotoItem[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("blog-media")
        .upload(path, file, { contentType: file.type, upsert: true });
      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
      uploaded.push({ url: data.publicUrl, fileName: file.name, caption: "" });
    }

    setUploading(false);
    if (uploaded.length > 0) onChange([...photos, ...uploaded]);
  }

  function updateCaption(index: number, caption: string) {
    onChange(photos.map((p, i) => (i === index ? { ...p, caption } : p)));
  }

  function remove(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChange}
        disabled={uploading}
        className="w-full text-sm text-brand-charcoal file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-brand-gold/15 file:text-brand-gold file:text-sm file:font-medium"
      />
      {uploading && <p className="text-xs text-brand-charcoal/50 mt-1">Uploading…</p>}
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}

      {photos.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {photos.map((photo, index) => (
            <li key={photo.url} className="flex gap-3 border border-brand-gold/20 rounded-md p-2">
              <img src={photo.url} alt="" className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={photo.caption ?? ""}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  placeholder="Caption (optional)"
                  className="w-full text-sm border border-brand-gold/30 rounded px-2 py-1 outline-none focus:border-brand-gold"
                />
                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  <button type="button" onClick={() => move(index, -1)} className="text-brand-charcoal/60 hover:text-brand-charcoal">
                    Move up
                  </button>
                  <button type="button" onClick={() => move(index, 1)} className="text-brand-charcoal/60 hover:text-brand-charcoal">
                    Move down
                  </button>
                  <button type="button" onClick={() => remove(index)} className="text-red-700 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
