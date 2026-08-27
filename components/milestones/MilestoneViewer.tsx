"use client";

import { useState } from "react";

interface MilestoneImage {
  url: string;
  caption: string;
}

interface MilestoneViewerProps {
  images: MilestoneImage[];
}

/**
 * One image at a time, large as the viewport allows, with Previous/Next
 * navigation - mirrors the prev/next index pattern used by
 * components/exhibits/Flipbook.tsx elsewhere in the app.
 */
export function MilestoneViewer({ images }: MilestoneViewerProps) {
  const [index, setIndex] = useState(0);
  const image = images[index];

  function goPrev() {
    if (index > 0) setIndex(index - 1);
  }

  function goNext() {
    if (index < images.length - 1) setIndex(index + 1);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full flex items-center justify-center">
        <button
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous milestone"
          className="absolute left-0 sm:-left-4 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-brand-gold/40 text-brand-charcoal flex items-center justify-center shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-gold/10 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="w-full max-h-[75vh] bg-white border border-brand-gold/20 shadow-xl overflow-hidden flex items-center justify-center">
          <img
            key={image.url}
            src={image.url}
            alt={image.caption}
            className="w-full h-full max-h-[75vh] object-contain"
          />
        </div>

        <button
          onClick={goNext}
          disabled={index === images.length - 1}
          aria-label="Next milestone"
          className="absolute right-0 sm:-right-4 z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-brand-gold/40 text-brand-charcoal flex items-center justify-center shadow-md disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-gold/10 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4 mt-6">
        <p className="text-sm text-brand-charcoal/70 tabular-nums">
          {index + 1} of {images.length}
        </p>
        <div className="flex items-center gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setIndex(i)}
              aria-label={`Go to ${img.caption}`}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === index ? "bg-brand-gold" : "bg-brand-gold/25 hover:bg-brand-gold/50"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-brand-charcoal/80 text-sm sm:text-base font-medium">{image.caption}</p>
    </div>
  );
}
