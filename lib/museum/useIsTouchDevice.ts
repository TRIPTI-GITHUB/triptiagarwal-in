"use client";

import { useEffect, useState } from "react";

/**
 * useIsTouchDevice
 * Detects whether the visitor's primary input is touch (phone/tablet)
 * rather than a mouse, using the browser's "(pointer: coarse)" media
 * query. Runs in useEffect (not during render) because this check
 * relies on the browser's `window` object, which doesn't exist yet
 * during server-side rendering.
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(hasCoarsePointer);
  }, []);

  return isTouch;
}