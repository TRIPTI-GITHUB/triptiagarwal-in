"use client";

import { useState } from "react";
import { POST_LINK_PLATFORM_OPTIONS, type LinkItem } from "@/lib/blog/schema";

interface LinkListEditorProps {
  links: LinkItem[];
  onChange: (links: LinkItem[]) => void;
}

export function LinkListEditor({ links, onChange }: LinkListEditorProps) {
  const [platform, setPlatform] = useState<LinkItem["platform"]>("facebook");
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  function addLink() {
    if (!url.trim()) {
      setError("Enter a URL first.");
      return;
    }
    try {
      new URL(url.trim());
    } catch {
      setError("That doesn't look like a valid URL.");
      return;
    }
    setError(null);
    onChange([...links, { platform, url: url.trim(), label: label.trim() || undefined }]);
    setUrl("");
    setLabel("");
  }

  function remove(index: number) {
    onChange(links.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as LinkItem["platform"])}
          className="rounded-md border border-brand-gold/30 bg-white px-2 py-1.5 text-sm"
        >
          {POST_LINK_PLATFORM_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Link URL"
          className="flex-1 rounded-md border border-brand-gold/30 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-gold"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional)"
          className="flex-1 rounded-md border border-brand-gold/30 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-gold"
        />
        <button
          type="button"
          onClick={addLink}
          className="rounded-full bg-brand-gold/15 text-brand-gold text-sm font-medium px-4 py-1.5 hover:bg-brand-gold/25 transition-colors"
        >
          Add link
        </button>
      </div>
      {error && <p className="text-xs text-red-700 mt-1">{error}</p>}

      {links.length > 0 && (
        <ul className="space-y-2 mt-3">
          {links.map((link, index) => (
            <li key={`${link.url}-${index}`} className="flex items-center justify-between gap-3 border border-brand-gold/20 rounded-md px-3 py-2 text-sm">
              <div className="min-w-0">
                <span className="uppercase text-xs text-brand-gold font-medium mr-2">{link.platform}</span>
                <span className="text-brand-charcoal truncate">{link.label || link.url}</span>
              </div>
              <button type="button" onClick={() => remove(index)} className="text-red-700 hover:underline flex-shrink-0">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
