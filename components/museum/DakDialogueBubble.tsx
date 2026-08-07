"use client";

import { Bird, X } from "lucide-react";

interface DakDialogueBubbleProps {
  visible: boolean;
  line: string;
  onDismiss: () => void;
}

/**
 * DakDialogueBubble
 * Short caption/hint UI tied to DakCompanion's mode (section 15) - a
 * fixed-position corner card rather than a 3D-anchored bubble, so the
 * greeting is legible regardless of which way the visitor is looking
 * when it fires (Dak's perch isn't in the initial view direction from
 * spawn). Fades in/out; auto-dismissed by the parent after a few
 * seconds, or immediately via the close button.
 */
export function DakDialogueBubble({ visible, line, onDismiss }: DakDialogueBubbleProps) {
  return (
    <div
      className={
        "absolute bottom-24 left-6 z-10 max-w-xs transition-all duration-500 " +
        (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none")
      }
    >
      <div className="bg-brand-charcoal/90 backdrop-blur-sm rounded-2xl pl-4 pr-3 py-3 shadow-lg flex items-start gap-2.5">
        <span className="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0 mt-0.5">
          <Bird size={15} />
        </span>
        <p className="text-white text-sm leading-snug pt-0.5">{line}</p>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-white/40 hover:text-white/70 shrink-0 mt-0.5"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
