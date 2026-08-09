"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import type { TourStop } from "@/lib/museum/layout";

interface FrontDeskSearchProps {
  points: TourStop[];
  sheetLabels: Map<string, string>;
  onSelect: (stop: TourStop) => void;
  isTouch?: boolean;
}

/**
 * FrontDeskSearch
 * "Front Desk = search... resolves to a room + wall" (Museum
 * Navigation, section 3), made "one tap from anywhere via a
 * persistent, minimal UI element" and more prominent specifically on
 * mobile (section 12, via a text label alongside the icon) - thumb-
 * driven free exploration to find a specific exhibit is the friction
 * point this exists to remove.
 *
 * Jumps are instant (the same TeleportTarget shape TeleportMenu and
 * ReturnToLobbyButton already use), not an eased walk - a search
 * result can be in any room, and a straight-line eased move risks
 * cutting through walls the way the tour's doorway waypoints exist to
 * avoid. Deliberately minimal: search-by-heading only, no fuzzy
 * matching or multi-word ranking.
 */
export function FrontDeskSearch({ points, sheetLabels, onSelect, isTouch }: FrontDeskSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim().toLowerCase();
  const matches =
    trimmedQuery.length === 0
      ? []
      : points
          .filter((p) => p.type === "sheet" && p.sheet?.heading?.toLowerCase().includes(trimmedQuery))
          .slice(0, 8);

  function handleSelect(stop: TourStop) {
    onSelect(stop);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Search exhibit sheets"
        title="Search exhibit sheets"
        className={
          "rounded-full bg-white/90 hover:bg-white text-brand-charcoal shadow flex items-center justify-center gap-1.5 " +
          (isTouch ? "px-3.5 h-9 text-xs font-medium" : "w-9 h-9")
        }
      >
        <Search size={16} />
        {isTouch && <span>Search</span>}
      </button>

      {open && (
        <div className="absolute top-11 right-0 w-64 bg-white rounded-xl shadow-xl p-3 text-brand-charcoal z-20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">Find an exhibit</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close search"
              className="text-brand-charcoal/50 hover:text-brand-charcoal"
            >
              <X size={16} />
            </button>
          </div>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sheet title..."
            className="w-full px-3 py-1.5 rounded-lg border border-brand-gold/30 text-sm outline-none focus:border-brand-gold"
          />
          <div className="mt-2 max-h-56 overflow-y-auto">
            {trimmedQuery.length === 0 && (
              <p className="text-xs text-brand-charcoal/50 py-2">Start typing a title to jump straight there.</p>
            )}
            {trimmedQuery.length > 0 && matches.length === 0 && (
              <p className="text-xs text-brand-charcoal/50 py-2">No matches.</p>
            )}
            {matches.map((stop) => (
              <button
                key={stop.sheet!.id}
                onClick={() => handleSelect(stop)}
                className="w-full text-left px-2 py-2 rounded-lg text-sm hover:bg-brand-cream"
              >
                <p className="font-medium">{stop.sheet!.heading}</p>
                <p className="text-xs text-brand-charcoal/50">{sheetLabels.get(stop.sheet!.id)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
