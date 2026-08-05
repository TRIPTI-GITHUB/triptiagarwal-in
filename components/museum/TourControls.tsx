"use client";

interface TourControlsProps {
  tourMode: boolean;
  onToggleMode: () => void;
}

/**
 * TourControls
 * Top-right mode toggle. The sheet-counter label was removed -
 * headings now render directly above each frame in 3D, making a
 * separate on-screen counter redundant.
 */
export function TourControls({ tourMode, onToggleMode }: TourControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-10">
      <button
        onClick={onToggleMode}
        className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-brand-charcoal text-xs font-medium shadow"
      >
        {tourMode ? "Switch to Free Roam" : "Start Guided Tour"}
      </button>
    </div>
  );
}