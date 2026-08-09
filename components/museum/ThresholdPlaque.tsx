"use client";

import { Text } from "@react-three/drei";
import { MUSEUM_GOLD, MUSEUM_CHARCOAL, MUSEUM_OFFWHITE, HIGH_CONTRAST_TRIM, HIGH_CONTRAST_TEXT_ON_DARK } from "@/lib/museum/museumPalette";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";
const WIDTH = 0.9;
const HEIGHT = 0.5;

interface ThresholdPlaqueProps {
  position: [number, number, number];
  rotationY: number;
  title: string;
  highContrast?: boolean;
}

/**
 * ThresholdPlaque
 * Room-name signage beside a doorway (Museum Navigation, Design Doc
 * section 3 - "every doorway... has a physical marker... exactly like
 * a museum wing sign"), replacing the previous mid-room floating title
 * text so a visitor reads the destination *before* committing to the
 * doorway rather than only once already inside.
 */
export function ThresholdPlaque({ position, rotationY, title, highContrast }: ThresholdPlaqueProps) {
  const trim = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;
  const textOnDark = highContrast ? HIGH_CONTRAST_TEXT_ON_DARK : MUSEUM_OFFWHITE;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshStandardMaterial color={trim} roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[WIDTH - 0.08, HEIGHT - 0.08]} />
        <meshStandardMaterial color={MUSEUM_CHARCOAL} />
      </mesh>
      <Text
        position={[0, 0.1, 0.02]}
        font={PLAYFAIR_FONT}
        fontSize={0.075}
        letterSpacing={0.1}
        color={trim}
        anchorX="center"
        anchorY="middle"
      >
        NEXT GALLERY
      </Text>
      <Text
        position={[0, -0.08, 0.02]}
        fontSize={0.1}
        maxWidth={WIDTH - 0.16}
        textAlign="center"
        color={textOnDark}
        anchorX="center"
        anchorY="middle"
      >
        {title}
      </Text>
    </group>
  );
}
