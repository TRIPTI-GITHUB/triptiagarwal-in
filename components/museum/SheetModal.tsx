"use client";

import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface SheetModalProps {
  sheet: ExhibitSheet;
  onClose: () => void;
}

/**
 * SheetModal
 * Full-screen overlay showing one sheet large and zoomable, using the
 * same react-medium-image-zoom library from the 2D exhibit viewer
 * (Step 2.7) - reused rather than duplicated.
 */
export function SheetModal({ sheet, onClose }: SheetModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 text-sm font-medium"
      >
        Close
      </button>

      <div className="max-w-2xl w-full">
        <Zoom key={sheet.id}>
          <img
            src={sheet.image_url}
            alt={"Sheet " + sheet.sheet_number}
            className="w-full h-auto rounded-sm"
          />
        </Zoom>
      </div>

      <p className="text-white/70 text-sm mt-4">
        Sheet {sheet.sheet_number}
        {sheet.section_title ? " - " + sheet.section_title : ""}
      </p>
      <p className="text-white/40 text-xs mt-1">
        Click the image to zoom - Close to return to the gallery
      </p>
    </div>
  );
}