"use client";

import { DOOR_WIDTH, DOOR_HEIGHT } from "@/lib/museum/roomConstants";
import { MUSEUM_GOLD, HIGH_CONTRAST_TRIM } from "@/lib/museum/museumPalette";

interface ArchwayFrameProps {
  position: [number, number, number]; // doorway gap center, floor level
  rotationY: number;
  highContrast?: boolean;
}

/**
 * ArchwayFrame
 * A gold lintel + door-frame posts marking a doorway gap - "every
 * doorway... a physical marker" (same principle the existing museum's
 * DoorWall applies), rebuilt here as its own small component since
 * DoorWall is a private, unexported function inside RoomsShell.tsx.
 */
export function ArchwayFrame({ position, rotationY, highContrast }: ArchwayFrameProps) {
  const trim = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;
  const [x, y, z] = position;

  return (
    <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
      <mesh position={[0, DOOR_HEIGHT, 0.04]}>
        <boxGeometry args={[DOOR_WIDTH + 0.15, 0.08, 0.06]} />
        <meshStandardMaterial color={trim} roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[-DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0.04]}>
        <boxGeometry args={[0.08, DOOR_HEIGHT, 0.06]} />
        <meshStandardMaterial color={trim} roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0.04]}>
        <boxGeometry args={[0.08, DOOR_HEIGHT, 0.06]} />
        <meshStandardMaterial color={trim} roughness={0.4} metalness={0.25} />
      </mesh>
    </group>
  );
}
