"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { FirstPersonControls } from "@/components/museum/FirstPersonControls";

const ROOM_WIDTH = 10;
const ROOM_DEPTH = 8;
const ROOM_HEIGHT = 4;

/**
 * Room
 * The physical shell of one gallery section - floor, ceiling, and
 * four walls, sized by ROOM_WIDTH/DEPTH/HEIGHT. Kept as its own
 * component so later steps (frames, doorways) can be added inside
 * this same group without touching the shell itself.
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
 * Client Component - the entry point into the 3D world. Owns
 * `isLocked` state (whether pointer-lock/first-person mode is
 * currently active) so it can show an instructional overlay before
 * entering, and a minimal control hint once inside.
 */
export function MuseumScene() {
  const [isLocked, setIsLocked] = useState(false);

  return (
    <div className="relative w-full h-[600px] bg-black">
      <Canvas camera={{ position: [0, 1.6, 3], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[0, ROOM_HEIGHT - 0.5, 0]} intensity={1} />
        <Room />
        <FirstPersonControls onLockChange={setIsLocked} />
      </Canvas>

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
    </div>
  );
}