"use client";

import { useRef, useState, MutableRefObject, TouchEvent } from "react";

const RADIUS = 50;

interface TouchJoystickProps {
  moveRef: MutableRefObject<{ x: number; y: number }>;
}

/**
 * TouchJoystick
 * On-screen virtual joystick (bottom-left). Writes a normalized
 * direction (-1 to 1 on each axis) into moveRef every time it's
 * dragged, which MobileCameraRig reads each frame. Visual "stick"
 * position is separate local state (knob) purely for what you see
 * on screen - it doesn't affect movement itself.
 */
export function TouchJoystick({ moveRef }: TouchJoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const activeTouchId = useRef<number | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  function updateFromTouch(touch: React.Touch) {
    const base = baseRef.current;
    if (!base) return;

    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }

    moveRef.current = { x: dx / RADIUS, y: dy / RADIUS };
    setKnob({ x: dx, y: dy });
  }

  function handleTouchStart(e: TouchEvent) {
    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    updateFromTouch(touch);
  }

  function handleTouchMove(e: TouchEvent) {
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === activeTouchId.current
    );
    if (touch) updateFromTouch(touch);
  }

  function handleTouchEnd(e: TouchEvent) {
    const stillActive = Array.from(e.touches).some(
      (t) => t.identifier === activeTouchId.current
    );
    if (!stillActive) {
      activeTouchId.current = null;
      moveRef.current = { x: 0, y: 0 };
      setKnob({ x: 0, y: 0 });
    }
  }

  return (
    <div
      ref={baseRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="absolute bottom-8 left-8 w-[100px] h-[100px] rounded-full bg-white/10 border border-white/30 touch-none z-10"
    >
      <div
        className="absolute w-10 h-10 rounded-full bg-white/60"
        style={{
          left: `calc(50% + ${knob.x}px - 20px)`,
          top: `calc(50% + ${knob.y}px - 20px)`,
        }}
      />
    </div>
  );
}
