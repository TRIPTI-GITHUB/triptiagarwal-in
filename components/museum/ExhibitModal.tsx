"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Sparkles, X, ZoomIn, ZoomOut } from "lucide-react";
import { DOLLY_STANDOFF_MIN, DOLLY_STANDOFF_MAX } from "@/lib/museum/roomConstants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface ExhibitModalProps {
  sheet: ExhibitSheet;
  label?: string;
  visible: boolean;
  standoff: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  atStart: boolean;
  atEnd: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

const CAPTION_SECTIONS = [
  { key: "description", label: "Description" },
  { key: "historical_context", label: "Historical Context" },
  { key: "interesting_facts", label: "Interesting Facts" },
  { key: "design_features", label: "Design Features" },
  { key: "personal_notes", label: "Personal Notes" },
] as const;

function CaptionSection({
  label,
  text,
  defaultOpen,
}: {
  label: string;
  text: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 text-left text-white text-sm font-medium tracking-wide"
      >
        {label}
        <ChevronDown
          size={16}
          className={"text-white/50 transition-transform duration-300 shrink-0 " + (open ? "rotate-180" : "")}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="text-white/70 text-sm leading-relaxed pb-3 whitespace-pre-line">{text}</p>
      </motion.div>
    </div>
  );
}

/**
 * ExhibitModal
 * The 2D chrome for the exhibit vitrine viewer - caption panel, zoom,
 * prev/next, close - rendered as a DOM overlay outside <Canvas>, beside
 * ExhibitDolly which does the actual camera movement in-scene. It only
 * fades in once the parent reports the dolly has settled (`visible`),
 * so the sheet fills the view first and chrome follows, per section 9's
 * vitrine approach.
 */
export function ExhibitModal({
  sheet,
  label,
  visible,
  standoff,
  onClose,
  onPrev,
  onNext,
  atStart,
  atEnd,
  onZoomIn,
  onZoomOut,
}: ExhibitModalProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const sections = CAPTION_SECTIONS.filter((s) => sheet[s.key]);

  return (
    <div
      className={
        "fixed inset-0 z-50 flex flex-col justify-between transition-opacity duration-500 " +
        (visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")
      }
    >
      <div className="flex items-start justify-between p-4 md:p-6 bg-gradient-to-b from-black/60 to-transparent">
        <div>
          {sheet.heading && (
            <p
              className="text-white text-lg md:text-xl font-semibold"
              style={{ fontFamily: "Playfair Display, Georgia, serif" }}
            >
              {sheet.heading}
            </p>
          )}
          <p className="text-white/60 text-xs mt-1">{label ?? "Sheet " + sheet.sheet_number}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-sm shrink-0"
        >
          <X size={18} />
        </button>
      </div>

      <div className="md:absolute md:top-24 md:right-6 md:bottom-24 md:w-80 w-full px-4 md:px-0">
        <div className="bg-brand-charcoal/85 backdrop-blur-md rounded-2xl px-4 py-1 md:h-full md:overflow-y-auto max-h-[40vh] overflow-y-auto">
          {sections.length > 0 ? (
            sections.map((s, i) => (
              <CaptionSection key={s.key} label={s.label} text={sheet[s.key] as string} defaultOpen={i === 0} />
            ))
          ) : (
            <p className="text-white/50 text-sm py-4 italic">Details for this piece are being added.</p>
          )}

          {sheet.curator_note && (
            <div className="pt-2 pb-3 border-t border-white/10">
              <button
                onClick={() => setNoteOpen((o) => !o)}
                className="flex items-center gap-1.5 text-brand-gold text-xs font-medium tracking-wide mt-2"
              >
                <Sparkles size={13} />
                {noteOpen ? "Hide Curator's Note" : "Curator's Note"}
              </button>
              <motion.div
                initial={false}
                animate={{ height: noteOpen ? "auto" : 0, opacity: noteOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="text-white/80 text-sm italic leading-relaxed pt-2">&ldquo;{sheet.curator_note}&rdquo;</p>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 p-4 md:p-6 bg-gradient-to-t from-black/60 to-transparent">
        <button
          onClick={onPrev}
          disabled={atStart}
          aria-label="Previous sheet"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={onZoomOut}
          disabled={standoff >= DOLLY_STANDOFF_MAX}
          aria-label="Zoom out"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={onZoomIn}
          disabled={standoff <= DOLLY_STANDOFF_MIN}
          aria-label="Zoom in"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={onNext}
          disabled={atEnd}
          aria-label="Next sheet"
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed backdrop-blur-sm"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
