"use client";

import { MutableRefObject } from "react";

interface RotationArrowsProps {
  turnRef: MutableRefObject<{ left: boolean; right: boolean }>;
}

/**
 * RotationArrows
 * On-screen "hold to rotate" buttons, similar to Google Street View's
 * rotation chevrons. Writes into turnRef on press/release; RoomFreeRoam
 * and RoomMobileRig read this ref every frame and rotate the camera
 * accordingly - the same pattern already used for the touch joystick
 * talking to the 3D scene. Uses Pointer Events (not separate mouse/
 * touch handlers) so one implementation works correctly on both
 * desktop clicks and mobile taps.
 */
export function RotationArrows({ turnRef }: RotationArrowsProps) {
  function startLeft() {
    turnRef.current.left = true;
  }
  function stopLeft() {
    turnRef.current.left = false;
  }
  function startRight() {
    turnRef.current.right = true;
  }
  function stopRight() {
    turnRef.current.right = false;
  }

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-10">
      <button
        onPointerDown={startLeft}
        onPointerUp={stopLeft}
        onPointerLeave={stopLeft}
        onPointerCancel={stopLeft}
        className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 text-white text-2xl font-medium select-none touch-none flex items-center justify-center"
        aria-label="Turn left"
      >
        {"<"}
      </button>
      <button
        onPointerDown={startRight}
        onPointerUp={stopRight}
        onPointerLeave={stopRight}
        onPointerCancel={stopRight}
        className="w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/35 text-white text-2xl font-medium select-none touch-none flex items-center justify-center"
        aria-label="Turn right"
      >
        {">"}
      </button>
    </div>
  );
}