"use client";

interface TourArrowNavProps {
  onPrev: () => void;
  onNext: () => void;
  atStart: boolean;
  atEnd: boolean;
}

/**
 * TourArrowNav
 * Left/right edge arrow buttons for guided tour navigation - plain
 * round arrow icons that reveal a "Previous"/"Next" text label on
 * hover, keeping the view uncluttered while still discoverable.
 */
export function TourArrowNav({ onPrev, onNext, atStart, atEnd }: TourArrowNavProps) {
  return (
    <>
      <button
        onClick={onPrev}
        disabled={atStart}
        className="group absolute left-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white text-2xl flex items-center justify-center backdrop-blur-sm">
          {"<"}
        </span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-200 text-white text-sm bg-black/50 rounded-full group-hover:px-3 py-1.5 whitespace-nowrap">
          Previous
        </span>
      </button>

      <button
        onClick={onNext}
        disabled={atEnd}
        className="group absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center flex-row-reverse gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <span className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white text-2xl flex items-center justify-center backdrop-blur-sm">
          {">"}
        </span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-200 text-white text-sm bg-black/50 rounded-full group-hover:px-3 py-1.5 whitespace-nowrap">
          Next
        </span>
      </button>
    </>
  );
}