"use client";

import { Text } from "@react-three/drei";
import { MUSEUM_GOLD, MUSEUM_TEAL, MUSEUM_OFFWHITE, HIGH_CONTRAST_TRIM } from "@/lib/museum/museumPalette";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";

interface EntrancePosterProps {
  position: [number, number, number];
  rotationY: number;
  eyebrow?: string;
  lines: string[];
  width?: number;
  height?: number;
  highContrast?: boolean;
}

/**
 * EntrancePoster
 * A museum-plaque-style poster panel: a gold outer border, a dark
 * blue inner panel, an optional small "eyebrow" label, and the main
 * multi-line text in Playfair Display. Used on the foyer's side walls
 * (Step A) and reusable later for the back-wall welcome poster
 * (Step C).
 */
export function EntrancePoster({
  position,
  rotationY,
  eyebrow,
  lines,
  width = 2.6,
  height = 3.2,
  highContrast,
}: EntrancePosterProps) {
  // The panel deliberately stays dark in both modes - it's already a
  // strong-contrast pairing with light text/trim, and swapping it pale
  // while keeping a bright trim color would flip that pairing into a
  // low-contrast one (bright-on-pale) instead of a higher-contrast one.
  // High contrast only pushes trim/text to more saturated extremes.
  const trim = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;
  const panel = MUSEUM_TEAL;
  const body = highContrast ? "#FFFFFF" : MUSEUM_OFFWHITE;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={trim} roughness={0.4} metalness={0.2} />
      </mesh>

      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width - 0.12, height - 0.12]} />
        <meshStandardMaterial color={panel} />
      </mesh>

      {eyebrow && (
        <Text
          position={[0, height / 2 - 0.5, 0.02]}
          font={PLAYFAIR_FONT}
          fontSize={0.13}
          letterSpacing={0.15}
          color={trim}
          anchorX="center"
          anchorY="middle"
        >
          {eyebrow.toUpperCase()}
        </Text>
      )}

      <Text
        position={[0, 0, 0.02]}
        font={PLAYFAIR_FONT}
        fontSize={0.28}
        lineHeight={1.35}
        maxWidth={width - 0.5}
        textAlign="center"
        color={body}
        anchorX="center"
        anchorY="middle"
      >
        {lines.join("\n")}
      </Text>
    </group>
  );
}