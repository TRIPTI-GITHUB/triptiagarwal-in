"use client";

import { forwardRef } from "react";
import HTMLFlipBook from "react-pageflip";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface FlipbookProps {
  sheets: ExhibitSheet[];
  title: string;
}

/**
 * Page
 * A single flippable page inside the book — just a full-bleed sheet
 * image. forwardRef is required here because react-pageflip needs
 * direct access to each page's underlying DOM element to animate it.
 */
const Page = forwardRef<HTMLDivElement, { sheet: ExhibitSheet; title: string }>(
  ({ sheet, title }, ref) => (
    <div ref={ref} className="bg-white flex items-center justify-center">
      <img
        src={sheet.image_url}
        alt={`${title} — Sheet ${sheet.sheet_number}`}
        className="w-full h-full object-contain"
      />
    </div>
  )
);
Page.displayName = "Page";

/**
 * Flipbook
 * Client Component — renders an exhibit's sheets as a page-turning
 * book using react-pageflip. Must be a Client Component ("use client")
 * because the flip interaction (drag, click) runs entirely in the
 * browser, unlike the Server Component that fetches the sheet data.
 */
export function Flipbook({ sheets, title }: FlipbookProps) {
  return (
    <div className="flex justify-center">
      {/* @ts-expect-error react-pageflip's types don't fully match React 19 yet */}
      <HTMLFlipBook
        width={500}
        height={700}
        size="stretch"
        minWidth={300}
        maxWidth={800}
        minHeight={400}
        maxHeight={1100}
        showCover={false}
        maxShadowOpacity={0.4}
        className="shadow-xl"
      >
        {sheets.map((sheet) => (
          <Page key={sheet.id} sheet={sheet} title={title} />
        ))}
      </HTMLFlipBook>
    </div>
  );
}