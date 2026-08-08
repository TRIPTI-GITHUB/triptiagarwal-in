"use client";

import { TourAudioToggle } from "@/components/museum/TourAudioToggle";

interface TourControlsProps {
  tourMode: boolean;
  onToggleMode: () => void;
}

/**
 * TourControls
 * Mode toggle - the buttons only, no positioning of its own, so a
 * parent can group it with other top-bar controls (e.g. TeleportMenu)
 * in one row. While exploring freely, offers "Continue as Guided Tour"
 * - picking up the tour from whichever stop is nearest to the visitor's
 * current position (section 6), never restarting from the entrance.
 * While touring, this is "Skip tour, explore freely" (section 5) -
 * always visible, exits immediately without touching the visitor's
 * position, since the camera was never hijacked to begin with. The
 * stubbed narration-audio toggle sits alongside it, tour mode only.
 */
export function TourControls({ tourMode, onToggleMode }: TourControlsProps) {
  return (
    <>
      {tourMode && <TourAudioToggle />}
      <button
        onClick={onToggleMode}
        className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-brand-charcoal text-xs font-medium shadow"
      >
        {tourMode ? "Skip Tour, Explore Freely" : "Continue as Guided Tour"}
      </button>
    </>
  );
}