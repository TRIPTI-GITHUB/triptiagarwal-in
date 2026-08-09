"use client";

import { Text } from "@react-three/drei";
import { MUSEUM_GOLD, MUSEUM_TEAL, MUSEUM_CREAM, HIGH_CONTRAST_TRIM } from "@/lib/museum/museumPalette";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";
const WIDTH = 2.8;
const HEIGHT = 2.6;

const INTRO_LINES =
  "A museum is not a building full of objects.\n" +
  "It is a sequence of feelings — anticipation\n" +
  "at the door, quiet focus before a case, delight\n" +
  "in a detail no one told you to look for.\n\n" +
  "Every piece within these walls was chosen,\n" +
  "kept, and cared for over twelve years.\n" +
  "Walk gently. Look closely.";

interface MuseumIntroWallProps {
  position: [number, number, number];
  rotationY: number;
  highContrast?: boolean;
}

/**
 * MuseumIntroWall
 * The lobby's "why this place exists" plaque (Lobby Design, Design Doc
 * section 7) - fixed curatorial copy rather than exhibit-specific data,
 * giving every visitor the same grounding note before they choose a
 * mode. Gives the lobby's previously-bare wall a purpose.
 */
export function MuseumIntroWall({ position, rotationY, highContrast }: MuseumIntroWallProps) {
  const trim = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;
  const panel = MUSEUM_TEAL;
  const body = highContrast ? "#FFFFFF" : MUSEUM_CREAM;

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
        WHY THIS PLACE EXISTS
      </Text>

      <Text
        position={[0, 0.05, 0.02]}
        fontSize={0.115}
        lineHeight={1.55}
        maxWidth={WIDTH - 0.6}
        textAlign="center"
        color={body}
        anchorX="center"
        anchorY="middle"
      >
        {INTRO_LINES}
      </Text>
    </group>
  );
}
