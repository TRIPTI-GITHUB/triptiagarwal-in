"use client";

import { useState } from "react";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface SheetModalProps {
  sheet: ExhibitSheet;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.5;

/**
 * SheetModal
 * Full-screen popup for viewing one sheet closely, with explicit
 * Zoom In / Zoom Out buttons. Built without a third-party zoom
 * library, for the same reliability reasons the flipbook library
 * was replaced earlier in this project.
 */
export function SheetModal({ sheet, onClose }: SheetModalProps) {
  const [scale, setScale] = useState(MIN_SCALE);

  function zoomIn() {
    setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP));
  }

  function zoomOut() {
    setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP));
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 text-sm font-medium z-10"
      >
        Close
      </button>

      <div className="max-w-3xl w-full max-h-[70vh] overflow-auto">
        <img
          src={sheet.image_url}
          alt={"Sheet " + sheet.sheet_number}
          style={{ width: scale * 100 + "%" }}
          className="h-auto rounded-sm mx-auto"
        />
      </div>

      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg font-medium disabled:opacity-30 disabled:cursor-not-allowed"
        >
          -
        </button>
        <p className="text-white/70 text-sm w-16 text-center tabular-nums">
          {Math.round(scale * 100)}%
        </p>
        <button
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-lg font-medium disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>

      <p className="text-white/70 text-sm mt-3">
        Sheet {sheet.sheet_number}
        {sheet.section_title ? " - " + sheet.section_title : ""}
      </p>
    </div>
  );
}