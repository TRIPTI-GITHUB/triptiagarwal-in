"use client";

interface WelcomeOverlayProps {
  title: string;
  visible: boolean;
  onEnter: () => void;
}

/**
 * WelcomeOverlay
 * Full-screen entrance card shown before a visitor steps into the
 * museum - doubles as a graceful loading buffer, since the 3D scene
 * finishes loading quietly behind it while this is on screen. Fades
 * out on click rather than disappearing abruptly.
 */
export function WelcomeOverlay({ title, visible, onEnter }: WelcomeOverlayProps) {
  return (
    <div
      className={
        "absolute inset-0 z-30 flex flex-col items-center justify-center bg-brand-charcoal text-center px-6 transition-opacity duration-700 " +
        (visible ? "opacity-100" : "opacity-0 pointer-events-none")
      }
    >
      <p className="text-brand-gold text-xs uppercase tracking-[0.35em] mb-4">
        Tripti Agarwal Heritage Lab
      </p>
      <h1
        className="text-white text-4xl md:text-6xl font-bold mb-3"
        style={{ fontFamily: "Playfair Display, Georgia, serif" }}
      >
        {title}
      </h1>
      <p className="text-white/60 italic text-sm md:text-base mb-10">
        Preserving the Past. Inspiring the Future.
      </p>
      <button
        onClick={onEnter}
        className="px-8 py-3 rounded-full bg-brand-gold text-white text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
      >
        Step Through the Doors
      </button>
      <p className="text-white/40 text-xs mt-6 max-w-xs">
        Walk forward, look around, and click any exhibit sheet to view it closely.
      </p>
    </div>
  );
}