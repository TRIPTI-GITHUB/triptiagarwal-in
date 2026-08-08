"use client";

import { useSyncExternalStore } from "react";
import { useSyncedLocalStorage } from "@/lib/museum/useSyncedLocalStorage";

const STORAGE_KEY = "museum-reduced-motion-override";

function decodeOverride(raw: string | null): boolean | null {
  if (raw === "true") return true;
  if (raw === "false") return false;
  return null;
}

function encodeOverride(value: boolean | null): string | null {
  return value === null ? null : String(value);
}

function subscribeSystemPreference(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

/**
 * useReducedMotion
 * Combines the OS-level `prefers-reduced-motion` query with a manual
 * in-app override (section 13) via OR - either one asking for reduced
 * motion is enough. Both pieces of external state (the media query,
 * the override in localStorage) are read via useSyncExternalStore
 * rather than useState+useEffect, so there's no setState-in-effect and
 * no server/client hydration mismatch on first render. `null` for the
 * override means "follow the OS setting" rather than "off".
 */
export function useReducedMotion(): {
  reducedMotion: boolean;
  systemPreference: boolean;
  override: boolean | null;
  setOverride: (value: boolean | null) => void;
} {
  const systemPreference = useSyncExternalStore(
    subscribeSystemPreference,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
  const [override, setOverride] = useSyncedLocalStorage(STORAGE_KEY, decodeOverride, encodeOverride);

  return {
    reducedMotion: override !== null ? override : systemPreference,
    systemPreference,
    override,
    setOverride,
  };
}
