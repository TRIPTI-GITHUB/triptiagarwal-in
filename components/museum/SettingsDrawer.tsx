"use client";

import { useState } from "react";
import { Settings, X } from "lucide-react";

export const TEXT_SCALES = [
  { key: "default", label: "A", value: "100%" },
  { key: "large", label: "A+", value: "115%" },
  { key: "largest", label: "A++", value: "130%" },
] as const;

interface SettingsDrawerProps {
  reducedMotionOverride: boolean | null;
  systemReducedMotion: boolean;
  onSetReducedMotionOverride: (value: boolean | null) => void;
  textScale: string;
  onSetTextScale: (value: string) => void;
  highContrast: boolean;
  onSetHighContrast: (value: boolean) => void;
}

/**
 * SettingsDrawer
 * The accessibility hub section 15 names - motion, text size, and
 * contrast in one place. Purely presentational: all three settings are
 * owned and persisted one level up in RoomMuseumScene (which stays
 * mounted for the whole museum-page lifetime), not here - this drawer
 * itself unmounts every time the exhibit vitrine viewer opens
 * (`!viewerActive`), and a setting tied to *this* component's lifetime
 * would be lost the moment a visitor looked closely at a sheet.
 */
export function SettingsDrawer({
  reducedMotionOverride,
  systemReducedMotion,
  onSetReducedMotionOverride,
  textScale,
  onSetTextScale,
  highContrast,
  onSetHighContrast,
}: SettingsDrawerProps) {
  const [open, setOpen] = useState(false);

  const motionStatus =
    reducedMotionOverride === true
      ? "On"
      : reducedMotionOverride === false
        ? "Off"
        : systemReducedMotion
          ? "Auto (following system: on)"
          : "Auto (following system: off)";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Accessibility settings: motion, text size, and contrast"
        title="Accessibility settings"
        className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-brand-charcoal flex items-center justify-center shadow"
      >
        <Settings size={16} />
      </button>

      {open && (
        <div className="absolute top-11 right-0 w-64 bg-white rounded-xl shadow-xl p-4 text-brand-charcoal z-20">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Accessibility</p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close accessibility settings"
              className="text-brand-charcoal/50 hover:text-brand-charcoal"
            >
              <X size={16} />
            </button>
          </div>

          <fieldset className="mb-4">
            <legend className="text-xs font-medium text-brand-charcoal/60 uppercase tracking-wide mb-1.5">Motion</legend>
            <div className="flex gap-1.5" role="group" aria-label="Reduced motion setting">
              {(
                [
                  { label: "Auto", value: null },
                  { label: "On", value: true },
                  { label: "Off", value: false },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => onSetReducedMotionOverride(opt.value)}
                  aria-pressed={reducedMotionOverride === opt.value}
                  className={
                    "flex-1 px-2 py-1.5 rounded-lg text-xs border " +
                    (reducedMotionOverride === opt.value
                      ? "bg-brand-gold/15 border-brand-gold text-brand-charcoal"
                      : "border-brand-gold/20 text-brand-charcoal/70 hover:bg-brand-gold/5")
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-brand-charcoal/50 mt-1.5">{motionStatus}. Reduces camera and mascot motion to instant moves.</p>
          </fieldset>

          <fieldset className="mb-4">
            <legend className="text-xs font-medium text-brand-charcoal/60 uppercase tracking-wide mb-1.5">Text Size</legend>
            <div className="flex gap-1.5" role="group" aria-label="Text size setting">
              {TEXT_SCALES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => onSetTextScale(s.key)}
                  aria-pressed={textScale === s.key}
                  aria-label={"Text size " + s.label}
                  className={
                    "flex-1 px-2 py-1.5 rounded-lg text-xs border font-medium " +
                    (textScale === s.key
                      ? "bg-brand-gold/15 border-brand-gold text-brand-charcoal"
                      : "border-brand-gold/20 text-brand-charcoal/70 hover:bg-brand-gold/5")
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-medium text-brand-charcoal/60 uppercase tracking-wide mb-1.5">Contrast</legend>
            <button
              onClick={() => onSetHighContrast(!highContrast)}
              aria-pressed={highContrast}
              className={
                "w-full px-3 py-1.5 rounded-lg text-xs border " +
                (highContrast
                  ? "bg-brand-gold/15 border-brand-gold text-brand-charcoal"
                  : "border-brand-gold/20 text-brand-charcoal/70 hover:bg-brand-gold/5")
              }
            >
              {highContrast ? "High Contrast: On" : "High Contrast: Off"}
            </button>
          </fieldset>
        </div>
      )}
    </div>
  );
}
