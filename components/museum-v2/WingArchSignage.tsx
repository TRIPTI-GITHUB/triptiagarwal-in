"use client";

import { Text } from "@react-three/drei";
import {
  MUSEUM_GOLD,
  MUSEUM_CHARCOAL,
  MUSEUM_OFFWHITE,
  HIGH_CONTRAST_TRIM,
  HIGH_CONTRAST_TEXT_ON_DARK,
} from "@/lib/museum/museumPalette";

const WIDTH = 1.3;
const HEIGHT = 0.62;

interface WingArchSignageProps {
  position: [number, number, number];
  rotationY: number;
  eyebrow: string; // e.g. "ENTRY - WING 1"
  title: string; // e.g. "India's Freedom Struggle"
  highContrast?: boolean;
}

/**
 * WingArchSignage
 * museum-v2's Entry/Exit arch signage - closely modeled on the existing
 * ThresholdPlaque's visual style (same gold-trim-on-charcoal panel
 * proportions) but with two fully custom text lines instead of
 * ThresholdPlaque's fixed "NEXT GALLERY" eyebrow, since that text isn't
 * a prop there. A new small component rather than an edit to
 * ThresholdPlaque, per this task's "prefer duplicating over risking the
 * live version" constraint.
 */
export function WingArchSignage({ position, rotationY, eyebrow, title, highContrast }: WingArchSignageProps) {
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
      <Text position={[0, 0.14, 0.02]} fontSize={0.09} letterSpacing={0.1} color={trim} anchorX="center" anchorY="middle">
        {eyebrow.toUpperCase()}
      </Text>
      <Text
        position={[0, -0.1, 0.02]}
        fontSize={0.11}
        maxWidth={WIDTH - 0.18}
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
