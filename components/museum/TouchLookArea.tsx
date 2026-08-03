"use client";

import { useRef, MutableRefObject, TouchEvent } from "react";

interface TouchLookAreaProps {
  lookRef: MutableRefObject<{ x: number; y: number }>;
}

export function TouchLookArea({ lookRef }: TouchLookAreaProps) {
  const activeTouchId = useRef<number | null>(null);
  const lastPosition = useRef({ x: 0, y: 0 });

  function handleTouchStart(e: TouchEvent) {
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    lastPosition.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchMove(e: TouchEvent) {
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === activeTouchId.current
    );
    if (!touch) return;

    const dx = touch.clientX - lastPosition.current.x;
    const dy = touch.clientY - lastPosition.current.y;

    lookRef.current.x += dx;
    lookRef.current.y += dy;

    lastPosition.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(e: TouchEvent) {
    const stillActive = Array.from(e.touches).some(
      (t) => t.identifier === activeTouchId.current
    );
    if (!stillActive) {
      activeTouchId.current = null;
    }
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="absolute inset-y-0 right-0 w-1/2 touch-none"
    />
  );
}