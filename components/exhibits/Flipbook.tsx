"use client";

import { useState } from "react";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface FlipbookProps {
  sheets: ExhibitSheet[];
  title: string;
}

const CONTENT_SECTIONS = [
  { key: "description", label: "Description" },
  { key: "historical_context", label: "Historical Context" },
  { key: "interesting_facts", label: "Interesting Facts" },
  { key: "design_features", label: "Design Features" },
  { key: "personal_notes", label: "Personal Notes" },
] as const;

/**
 * Flipbook
 * The 2D parallel to the 3D vitrine viewer (ExhibitModal) - same sheet
 * fields, always visible rather than behind an accordion toggle, so a
 * keyboard or screen-reader visitor gets the full content in one pass
 * per section 13's "same content, never a lesser one" requirement.
 */
export function Flipbook(props: FlipbookProps) {
  const sheets = props.sheets;
  const title = props.title;
  const [index, setIndex] = useState(0);

  const sheet = sheets[index];

  function goPrev() {
    if (index > 0) {
      setIndex(index - 1);
    }
  }

  function goNext() {
    if (index < sheets.length - 1) {
      setIndex(index + 1);
    }
  }

  const sections = CONTENT_SECTIONS.filter((s) => sheet[s.key]);
  const altText = sheet.heading
    ? title + " - " + sheet.heading
    : title + " - Sheet " + sheet.sheet_number;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl aspect-[4/3] bg-white border border-brand-gold/20 shadow-xl flex items-center justify-center overflow-hidden">
        <img
          key={sheet.id}
          src={sheet.image_url}
          alt={altText}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex items-center gap-6 mt-6">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="px-4 py-2 rounded-full border border-brand-gold/40 text-brand-charcoal text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-gold/10 transition-colors"
        >
          Previous
        </button>

        <p className="text-sm text-brand-charcoal/70 tabular-nums">
          Sheet {index + 1} of {sheets.length}
        </p>

        <button
          onClick={goNext}
          disabled={index === sheets.length - 1}
          className="px-4 py-2 rounded-full border border-brand-gold/40 text-brand-charcoal text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-gold/10 transition-colors"
        >
          Next
        </button>
      </div>

      <div className="w-full max-w-2xl mt-8 space-y-5">
        {(sheet.heading || sheet.category === "award") && (
          <div className="flex items-center gap-3 flex-wrap">
            {sheet.heading && (
              <h2
                className="text-xl font-semibold text-brand-charcoal"
                style={{ fontFamily: "Playfair Display, Georgia, serif" }}
              >
                {sheet.heading}
              </h2>
            )}
            {sheet.category === "award" && (
              <span className="px-2.5 py-1 rounded-full bg-brand-gold/15 text-brand-gold text-xs font-medium tracking-wide">
                Award-Winning
              </span>
            )}
          </div>
        )}

        {sections.length > 0 ? (
          sections.map((s) => (
            <div key={s.key}>
              <h3 className="text-sm font-medium text-brand-gold tracking-wide uppercase">{s.label}</h3>
              <p className="text-brand-charcoal/80 text-sm leading-relaxed whitespace-pre-line mt-1">
                {sheet[s.key] as string}
              </p>
            </div>
          ))
        ) : (
          <p className="text-brand-charcoal/50 text-sm italic">Details for this piece are being added.</p>
        )}

        {sheet.curator_note && (
          <div className="pt-3 border-t border-brand-gold/20">
            <h3 className="text-sm font-medium text-brand-gold tracking-wide uppercase">Curator&rsquo;s Note</h3>
            <p className="text-brand-charcoal/80 text-sm italic leading-relaxed mt-1">
              &ldquo;{sheet.curator_note}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
