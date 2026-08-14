"use client";

import { useEffect, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { useSyncedLocalStorage } from "@/lib/museum/useSyncedLocalStorage";

const DISMISSED_KEY = "museum-orientation-prompt-dismissed";
const AUTO_DISMISS_MS = 7000;

function subscribePortrait(callback: () => void) {
  const mql = window.matchMedia("(orientation: portrait)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function decodeDismissed(raw: string | null): boolean {
  return raw === "true";
}
function encodeDismissed(value: boolean): string {
  return String(value);
}

interface OrientationPromptProps {
  isTouch: boolean;
}

/**
 * OrientationPrompt
 * "A brief, friendly one-time prompt suggests rotating the device
 * rather than silently rendering poorly in portrait" (Mobile
 * Adaptation, section 12) - a dismissible banner, never a block.
 * "One-time" is taken literally via localStorage (useSyncedLocalStorage,
 * the same primitive SettingsDrawer's toggles already use) - once seen
 * (dismissed explicitly or auto-faded), it never reappears, on this or
 * a future visit.
 */
export function OrientationPrompt({ isTouch }: OrientationPromptProps) {
  const isPortrait = useSyncExternalStore(
    subscribePortrait,
    () => window.matchMedia("(orientation: portrait)").matches,
    () => false
  );
  const [dismissed, setDismissed] = useSyncedLocalStorage(DISMISSED_KEY, decodeDismissed, encodeDismissed);

  const visible = isTouch && isPortrait && !dismissed;

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setDismissed(true), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, setDismissed]);

  return (
    <div
      className={
        // top-28 clears the top-right control row even when it wraps to
        // a second line on narrow phones (Exit/Search/Teleport/
        // TourControls/Settings don't all fit on one line under ~400px).
        "absolute top-28 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] max-w-xs transition-all duration-500 " +
        (visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none")
      }
    >
      <div className="bg-brand-charcoal/90 backdrop-blur-sm rounded-2xl pl-4 pr-3 py-3 shadow-lg flex items-center gap-3">
        <p className="text-white text-xs leading-snug flex-1">
          This gallery opens up beautifully in landscape — turn your phone sideways when you&rsquo;re ready.
        </p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="text-white/40 hover:text-white/70 shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
