"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { DocumentItem } from "@/lib/blog/schema";

interface DocumentUploaderProps {
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

const MAX_DOCUMENT_BYTES = 200 * 1024 * 1024;

/** Any file type (PPT, PDF, etc.) - listed by filename with a remove button, no preview/caption. */
export function DocumentUploader({ documents, onChange }: DocumentUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const invalid = files.find((f) => f.size > MAX_DOCUMENT_BYTES);
    if (invalid) {
      setError("Every file must be under 200MB.");
      return;
    }

    setError(null);
    setUploading(true);
    const supabase = createClient();
    const uploaded: DocumentItem[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `documents/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("blog-media")
        .upload(path, file, { contentType: file.type || undefined, upsert: true });
      if (uploadError) {
        setError(uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from("blog-media").getPublicUrl(path);
      uploaded.push({ url: data.publicUrl, fileName: file.name });
    }

    setUploading(false);
    if (uploaded.length > 0) onChange([...documents, ...uploaded]);
  }

  function remove(item: DocumentItem) {
    onChange(documents.filter((d) => d !== item));
  }

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleFilesChange}
        disabled={uploading}
        className="w-full text-sm text-brand-charcoal file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-brand-gold/15 file:text-brand-gold file:text-sm file:font-medium"
      />
      {uploading && <p className="text-xs text-brand-charcoal/50 mt-1">Uploading…</p>}
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}

      {documents.length > 0 && (
        <ul className="space-y-2 mt-3">
          {documents.map((doc) => (
            <li key={doc.url} className="flex items-center justify-between gap-3 border border-brand-gold/20 rounded-md px-3 py-2 text-sm">
              <span className="text-brand-charcoal truncate">{doc.fileName}</span>
              <button type="button" onClick={() => remove(doc)} className="text-red-700 hover:underline flex-shrink-0">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
