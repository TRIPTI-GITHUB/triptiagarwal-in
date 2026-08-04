"use client";

interface TourControlsProps {
  tourMode: boolean;
  onToggleMode: () => void;
  currentLabel: string;
}

/**
 * TourControls
 * Top-right mode toggle, plus a status label shown while tour mode is
 * active. Next/Previous navigation itself now lives in TourArrowNav
 * (edge arrow buttons), not here.
 */
export function TourControls({ tourMode, onToggleMode, currentLabel }: TourControlsProps) {
  return (
    <>
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onToggleMode}
          className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-brand-charcoal text-xs font-medium shadow"
        >
          {tourMode ? "Switch to Free Roam" : "Start Guided Tour"}
        </button>
      </div>

      {tourMode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-10">
          <p className="text-white/80 text-sm bg-black/50 px-4 py-1.5 rounded-full">
            {currentLabel}
          </p>
        </div>
      )}
    </>
  );
}