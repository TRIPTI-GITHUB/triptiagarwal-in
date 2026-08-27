"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CoverImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/**
 * Uploads straight from the browser to the blog-media bucket via the
 * Supabase browser client (never through a Server Action) - the
 * signed-in admin's session already satisfies the bucket's
 * "authenticated users can upload" storage policy.
 */
export function CoverImageUploader({ value, onChange }: CoverImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Image must be under 8MB.");
      return;
    }

    setError(null);
    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("blog-media")
      .upload(path, file, { contentType: file.type, upsert: true });

    setUploading(false);

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
    onChange(data.publicUrl);
  }

  return (
    <div>
      {value && (
        <img src={value} alt="Cover preview" className="w-full max-w-xs h-40 object-cover rounded-xl border border-brand-charcoal/10 mb-2" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="w-full text-sm text-brand-charcoal file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-brand-gold/15 file:text-brand-gold file:text-sm file:font-medium"
      />
      {uploading && <p className="text-xs text-brand-charcoal/50 mt-1">Uploading…</p>}
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}
    </div>
  );
}
