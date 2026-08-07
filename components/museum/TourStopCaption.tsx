"use client";

import { Bird } from "lucide-react";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

const EXCERPT_LENGTH = 140;

function excerpt(text: string | null): string | null {
  if (!text) return null;
  if (text.length <= EXCERPT_LENGTH) return text;
  return text.slice(0, EXCERPT_LENGTH).trimEnd() + "…";
}

interface TourStopCaptionProps {
  visible: boolean;
  sheet: ExhibitSheet | null;
  label?: string;
  finished: boolean;
  onViewCloser: () => void;
  onExitTour: () => void;
}

/**
 * TourStopCaption
 * Short, layered caption for the guided tour's current stop (section 5)
 * - a fixed-position card (same reasoning as DakDialogueBubble: Dak's
 * stop isn't guaranteed to be in the visitor's exact view direction, so
 * a screen-anchored card is more reliably legible than a 3D-anchored
 * one) showing just the heading and a short excerpt. "View Closer"
 * opens the full ExhibitModal from Phase 2 for visitors who want the
 * complete Description/Historical Context/etc. - going deeper is
 * always optional, never forced.
 */
export function TourStopCaption({ visible, sheet, label, finished, onViewCloser, onExitTour }: TourStopCaptionProps) {
  const body = sheet ? excerpt(sheet.description) : null;

  return (
    <div
      className={
        "absolute bottom-24 left-1/2 -translate-x-1/2 z-10 w-[min(90vw,26rem)] transition-all duration-500 " +
        (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none")
      }
    >
      <div className="bg-brand-charcoal/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
        {finished ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-white text-sm">That&apos;s the tour — thanks for walking through with Dak.</p>
            <button
              onClick={onExitTour}
              className="shrink-0 px-3 py-1.5 rounded-full bg-brand-gold text-white text-xs font-medium hover:opacity-90"
            >
              Explore Freely
            </button>
          </div>
        ) : sheet ? (
          <div className="flex items-start gap-2.5">
            <span className="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0 mt-0.5">
              <Bird size={15} />
            </span>
            <div className="min-w-0">
              {label && <p className="text-white/50 text-[11px] mb-0.5">{label}</p>}
              {sheet.heading && <p className="text-white text-sm font-semibold leading-snug">{sheet.heading}</p>}
              {body && <p className="text-white/70 text-xs leading-snug mt-1">{body}</p>}
              <button
                onClick={onViewCloser}
                className="mt-2 text-brand-gold text-xs font-medium hover:opacity-80"
              >
                View Closer →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
