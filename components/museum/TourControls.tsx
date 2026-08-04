"use client";

interface TourControlsProps {
  tourMode: boolean;
  onToggleMode: () => void;
  navIndex: number;
  totalSheets: number;
  currentLabel: string;
  onNext: () => void;
  onPrev: () => void;
}

/**
 * TourControls
 * Top-right mode toggle ("Start Guided Tour" / "Switch to Free Roam"),
 * plus Next/Previous buttons and a status label - only shown while
 * tour mode is active.
 */
export function TourControls({
  tourMode,
  onToggleMode,
  navIndex,
  totalSheets,
  currentLabel,
  onNext,
  onPrev,
}: TourControlsProps) {
  const atStart = navIndex <= -1;
  const atEnd = navIndex >= totalSheets - 1;

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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
          <p className="text-white/80 text-sm bg-black/50 px-4 py-1.5 rounded-full">
            {currentLabel}
          </p>
          <div className="flex items-center gap-4">
            <button
              onClick={onPrev}
              disabled={atStart}
              className="px-5 py-2.5 rounded-full bg-white/90 text-brand-charcoal text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              Previous
            </button>
            <button
              onClick={onNext}
              disabled={atEnd}
              className="px-5 py-2.5 rounded-full bg-brand-gold text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}