"use client";

import { useEffect, useState } from "react";

/**
 * useIsTouchDevice
 * Detects whether the visitor's primary input is touch (phone/tablet)
 * rather than a mouse, using the browser's "(pointer: coarse)" media
 * query.
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(hasCoarsePointer);
  }, []);

  return isTouch;
}