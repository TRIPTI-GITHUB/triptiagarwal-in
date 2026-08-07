"use client";

import { TourAudioToggle } from "@/components/museum/TourAudioToggle";

interface TourControlsProps {
  tourMode: boolean;
  onToggleMode: () => void;
}

/**
 * TourControls
 * Top-right mode toggle. While exploring freely, offers "Continue as
 * Guided Tour" - picking up the tour from whichever stop is nearest to
 * the visitor's current position (section 6), never restarting from the
 * entrance. While touring, this is "Skip tour, explore freely" (section
 * 5) - always visible, exits immediately without touching the visitor's
 * position, since the camera was never hijacked to begin with. The
 * stubbed narration-audio toggle sits alongside it, tour mode only.
 */
export function TourControls({ tourMode, onToggleMode }: TourControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
      {tourMode && <TourAudioToggle />}
      <button
        onClick={onToggleMode}
        className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-brand-charcoal text-xs font-medium shadow"
      >
        {tourMode ? "Skip Tour, Explore Freely" : "Continue as Guided Tour"}
      </button>
    </div>
  );
}