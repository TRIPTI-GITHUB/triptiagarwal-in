"use client";

import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { FirstPersonControls } from "@/components/museum/FirstPersonControls";
import { MobileCameraRig } from "@/components/museum/MobileCameraRig";
import { TouchJoystick } from "@/components/museum/TouchJoystick";
import { TouchLookArea } from "@/components/museum/TouchLookArea";
import { useIsTouchDevice } from "@/lib/museum/useIsTouchDevice";
import { ROOM_WIDTH, ROOM_DEPTH, ROOM_HEIGHT } from "@/lib/museum/constants";

/**
 * Room
 * The physical shell of one gallery section - floor, ceiling, and
 * four walls, sized by ROOM_WIDTH/DEPTH/HEIGHT.
 */
function Room() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#3a3226" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#f5f0e6" />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>
    </group>
  );
}

/**
 * MuseumScene
 * Client Component - the entry point into the 3D world. Detects
 * touch vs. desktop (useIsTouchDevice) and renders the matching
 * control scheme: PointerLockControls + keyboard for desktop, or a
 * virtual joystick + drag-to-look for touch. Both schemes ultimately
 * move the same camera using the same shared moveCamera logic.
 */
export function MuseumScene() {
  const [isLocked, setIsLocked] = useState(false);
  const isTouch = useIsTouchDevice();

  // Shared between the touch UI (outside the Canvas) and
  // MobileCameraRig (inside the Canvas) - refs, not state, since
  // these update continuously and don't need to trigger re-renders.
  const touchMoveRef = useRef({ x: 0, y: 0 });
  const touchLookRef = useRef({ x: 0, y: 0 });

  return (
    <div className="relative w-full h-[600px] bg-black">
      <Canvas camera={{ position: [0, 1.6, 3], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[0, ROOM_HEIGHT - 0.5, 0]} intensity={1} />
        <Room />
        {isTouch ? (
          <MobileCameraRig moveRef={touchMoveRef} lookRef={touchLookRef} />
        ) : (
          <FirstPersonControls onLockChange={setIsLocked} />
        )}
      </Canvas>

      {isTouch ? (
        <>
          <TouchJoystick moveRef={touchMoveRef} />
          <TouchLookArea lookRef={touchLookRef} />
          <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
            <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
              Drag left side to move - drag right side to look
            </p>
          </div>
        </>
      ) : (
        <>
          {!isLocked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/70 text-white px-6 py-4 rounded-lg text-center max-w-xs">
                <p className="font-semibold mb-1">Click to enter the gallery</p>
                <p className="text-sm text-white/70">
                  WASD or arrow keys to move - mouse to look around - Esc to exit
                </p>
              </div>
            </div>
          )}
          {isLocked && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <p className="text-white/70 text-xs bg-black/50 px-3 py-1 rounded-full">
                WASD to move - Esc to exit
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}