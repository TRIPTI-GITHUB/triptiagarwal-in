interface CrosshairProps {
  label: string | null;
}

/**
 * Crosshair
 * Small aiming reticle in the exact center of the screen, matching
 * where FrameInteraction's raycaster points. Highlights and shows a
 * label when currently aimed at a frame.
 */
export function Crosshair({ label }: CrosshairProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-2">
        <div
          className={
            label
              ? "w-3 h-3 rounded-full border-2 border-brand-gold bg-brand-gold/30"
              : "w-3 h-3 rounded-full border-2 border-white/50"
          }
        />
        {label && (
          <p className="text-xs bg-black/60 text-white px-2 py-1 rounded-full whitespace-nowrap">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}