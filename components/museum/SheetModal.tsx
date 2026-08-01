"use client";

import { useState } from "react";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface SheetModalProps {
  sheet: ExhibitSheet;
  onClose: () => void;
}

/**
 * SheetModal
 * Full-screen overlay showing one sheet, with a simple built-in
 * click-to-zoom: clicking toggles between "fit to screen" and
 * "enlarged and scrollable." Built without a third-party zoom
 * library, after react-medium-image-zoom proved unreliable here -
 * same reasoning as replacing react-pageflip earlier in this project.
 */
export function SheetModal({ sheet, onClose }: SheetModalProps) {
  const [zoomed, setZoomed] = useState(false);

  function toggleZoom() {
    setZoomed(!zoomed);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 text-sm font-medium z-10"
      >
        Close
      </button>

      <div
        className={
          zoomed
            ? "max-w-2xl w-full max-h-[75vh] overflow-auto"
            : "max-w-2xl w-full"
        }
      >
        <img
          src={sheet.image_url}
          alt={"Sheet " + sheet.sheet_number}
          onClick={toggleZoom}
          className={
            zoomed
              ? "w-[180%] max-w-none h-auto rounded-sm cursor-zoom-out"
              : "w-full h-auto rounded-sm cursor-zoom-in"
          }
        />
      </div>

      <p className="text-white/70 text-sm mt-4">
        Sheet {sheet.sheet_number}
        {sheet.section_title ? " - " + sheet.section_title : ""}
      </p>
      <p className="text-white/40 text-xs mt-1">
        Click the image to zoom {zoomed ? "out" : "in"} - Close to return to
        the gallery
      </p>
    </div>
  );
}