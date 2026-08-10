"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

/**
 * HeaderSearch
 * An icon that expands into an inline field on click, per the design
 * brief's "quieter, more Apple-like" utility element (replacing the
 * reference video's separate black search-button panel). UI affordance
 * only for now - it doesn't return real results. Actual cross-content
 * search is Roadmap Phase 1's separate "Global Search" feature, a
 * bigger, separately-scoped piece of work.
 */
export function HeaderSearch({ light, className = "" }: { light?: boolean; className?: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className={
          (light ? "text-white/85 hover:text-white" : "text-brand-charcoal/70 hover:text-brand-charcoal") +
          ` transition-colors ${className}`
        }
      >
        <Search size={18} strokeWidth={1.5} />
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        autoFocus
        type="search"
        placeholder="Search..."
        aria-label="Search the site"
        className="w-40 sm:w-56 px-3 py-1.5 rounded-full border border-brand-gold/30 text-sm outline-none focus:border-brand-gold bg-white/80"
      />
      <button
        onClick={() => setOpen(false)}
        aria-label="Close search"
        className="text-brand-charcoal/50 hover:text-brand-charcoal"
      >
        <X size={16} />
      </button>
    </div>
  );
}
