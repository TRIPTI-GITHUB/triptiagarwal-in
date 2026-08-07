"use client";

interface ApproachCueProps {
  visible: boolean;
}

/**
 * ApproachCue
 * The "walking near a mounted sheet" cue (section 9) - a soft vignette
 * dimming the screen's edges plus a small "View Closer" pill, both
 * fading in only once a ProximityTrigger reports the visitor is near a
 * sheet. Never a hard popup, and never blocks movement - purely visual,
 * pointer-events-none throughout.
 */
export function ApproachCue({ visible }: ApproachCueProps) {
  return (
    <div
      className={
        "absolute inset-0 z-10 pointer-events-none transition-opacity duration-500 " +
        (visible ? "opacity-100" : "opacity-0")
      }
      style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)",
      }}
    >
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
        <p className="text-white text-xs bg-black/60 px-4 py-2 rounded-full tracking-wide">View Closer</p>
      </div>
    </div>
  );
}
