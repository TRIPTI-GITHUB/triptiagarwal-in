"use client";

import { Text } from "@react-three/drei";
import { MUSEUM_GOLD, MUSEUM_TEAL, MUSEUM_CREAM, HIGH_CONTRAST_TRIM } from "@/lib/museum/museumPalette";
import type { MuseumRoom } from "@/lib/museum/layout";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";
const WIDTH = 2.8;
const HEIGHT = 2.6;

interface GalleryDirectoryWallProps {
  position: [number, number, number];
  rotationY: number;
  rooms: MuseumRoom[];
  highContrast?: boolean;
}

/**
 * GalleryDirectoryWall
 * The lobby's wing/room index (Museum Navigation, Design Doc section 3)
 * - lists every room a visitor will pass through, generated from
 * `rooms[]` rather than hand-authored, so it can never drift from the
 * actual floor plan as exhibits change.
 */
export function GalleryDirectoryWall({ position, rotationY, rooms, highContrast }: GalleryDirectoryWallProps) {
  const trim = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;
  const panel = MUSEUM_TEAL;
  const body = highContrast ? "#FFFFFF" : MUSEUM_CREAM;
  const rooms8 = rooms.slice(0, 8);

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshStandardMaterial color={trim} roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[WIDTH - 0.14, HEIGHT - 0.14]} />
        <meshStandardMaterial color={panel} />
      </mesh>

      <Text
        position={[0, HEIGHT / 2 - 0.4, 0.02]}
        font={PLAYFAIR_FONT}
        fontSize={0.16}
        letterSpacing={0.1}
        color={trim}
        anchorX="center"
        anchorY="middle"
      >
        GALLERY DIRECTORY
      </Text>

      {rooms8.map((room, i) => (
        <Text
          key={room.title + i}
          position={[0, HEIGHT / 2 - 0.85 - i * 0.32, 0.02]}
          font={PLAYFAIR_FONT}
          fontSize={0.14}
          maxWidth={WIDTH - 0.6}
          textAlign="center"
          color={body}
          anchorX="center"
          anchorY="middle"
        >
          {String(i + 1).padStart(2, "0") + "   " + room.title}
        </Text>
      ))}
    </group>
  );
}
