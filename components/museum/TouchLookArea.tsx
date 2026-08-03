"use client";

import { useRef, MutableRefObject, TouchEvent } from "react";

interface TouchLookAreaProps {
  lookRef: MutableRefObject<{ x: number; y: number }>;
  tapRef: MutableRefObject<{ x: number; y: number; pending: boolean }>;
}

const TAP_MOVE_THRESHOLD = 8;

/**
 * TouchLookArea
 * Invisible full-height zone on the right half of the screen. Drags
 * accumulate into lookRef for camera rotation, same as before. A
 * touch that ends without much movement is additionally recorded into
 * tapRef, which RoomMobileRig reads each frame to perform click-to-
 * select raycasting - the mobile equivalent of RoomFreeRoam's click
 * detection.
 */
export function TouchLookArea({ lookRef, tapRef }: TouchLookAreaProps) {
  const activeTouchId = useRef<number | null>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });

  function handleTouchStart(e: TouchEvent) {
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    lastPosition.current = { x: touch.clientX, y: touch.clientY };
    startPosition.current = { x: touch.clientX, y: touch.clientY };
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
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === activeTouchId.current
    );

    const stillActive = Array.from(e.touches).some(
      (t) => t.identifier === activeTouchId.current
    );
    if (!stillActive) {
      activeTouchId.current = null;
    }

    if (touch) {
      const dx = touch.clientX - startPosition.current.x;
      const dy = touch.clientY - startPosition.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= TAP_MOVE_THRESHOLD) {
        tapRef.current = { x: touch.clientX, y: touch.clientY, pending: true };
      }
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