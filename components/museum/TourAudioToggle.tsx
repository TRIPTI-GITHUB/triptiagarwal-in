"use client";

import { VolumeX } from "lucide-react";

/**
 * TourAudioToggle
 * Stubbed narration-audio control for the guided tour. Phase 5 is
 * captions-only (audio narration is Phase 4/the audio layer, deferred) -
 * this is visually present and wired for a future onClick, but disabled
 * and labeled so it fails honestly ("coming soon") rather than looking
 * broken or doing nothing silently.
 */
export function TourAudioToggle() {
  return (
    <button
      disabled
      title="Narration audio - coming soon"
      aria-label="Narration audio - coming soon"
      className="w-10 h-10 rounded-full bg-white/10 text-white/40 flex items-center justify-center backdrop-blur-sm cursor-not-allowed"
    >
      <VolumeX size={16} />
    </button>
  );
}
