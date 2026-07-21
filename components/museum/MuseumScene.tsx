"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const ROOM_WIDTH = 10;
const ROOM_DEPTH = 8;
const ROOM_HEIGHT = 4;

/**
 * Room
 * The physical shell of one gallery section — floor, ceiling, and
 * four walls, sized by ROOM_WIDTH/DEPTH/HEIGHT. Kept as its own
 * component so later steps (frames, doorways) can be added inside
 * this same group without touching the shell itself.
 */
function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#3a3226" />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <meshStandardMaterial color="#f5f0e6" />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      {/* Right wall */}
      <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>
    </group>
  );
}

/**
 * MuseumScene
 * Client Component — the entry point into the 3D world. Wraps
 * everything in <Canvas>, which is react-three-fiber's equivalent of
 * a normal HTML page: everything 3D must live inside it. OrbitControls
 * here is a TEMPORARY stand-in camera (click-drag to look, scroll to
 * zoom) so we can see the room before Step 3.3 replaces it with real
 * first-person walking controls.
 */
export function MuseumScene() {
  return (
    <div className="w-full h-[600px] bg-black">
      <Canvas camera={{ position: [0, 1.6, 3], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[0, ROOM_HEIGHT - 0.5, 0]} intensity={1} />
        <Room />
        <OrbitControls
          target={[0, 1.6, 0]}
          maxPolarAngle={Math.PI / 1.8}
          minDistance={1}
          maxDistance={6}
        />
      </Canvas>
    </div>
  );
}