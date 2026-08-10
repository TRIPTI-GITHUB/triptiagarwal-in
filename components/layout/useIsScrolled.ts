"use client";

import { useSyncExternalStore } from "react";

const THRESHOLD_PX = 40;

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function getSnapshot() {
  return window.scrollY > THRESHOLD_PX;
}

/**
 * useIsScrolled
 * True once the page has scrolled past the hero - drives the Header's
 * transparent-over-hero-to-solid crossfade. useSyncExternalStore rather
 * than useState+useEffect, so there's no setState-in-effect and no
 * server/client hydration mismatch on first render (same reasoning as
 * useReducedMotion in the museum).
 */
export function useIsScrolled(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
