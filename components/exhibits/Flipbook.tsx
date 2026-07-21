"use client";

import { useState } from "react";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface FlipbookProps {
  sheets: ExhibitSheet[];
  title: string;
}

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

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl aspect-[4/3] bg-white border border-brand-gold/20 shadow-xl flex items-center justify-center overflow-hidden">
        <img
          key={sheet.id}
          src={sheet.image_url}
          alt={title + " - Sheet " + sheet.sheet_number}
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
    </div>
  );
}