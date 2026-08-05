"use client";

import { Text } from "@react-three/drei";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";

interface EntrancePosterProps {
  position: [number, number, number];
  rotationY: number;
  eyebrow?: string;
  lines: string[];
  width?: number;
  height?: number;
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
}: EntrancePosterProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#C9A227" />
      </mesh>

      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width - 0.12, height - 0.12]} />
        <meshStandardMaterial color="#153A5B" />
      </mesh>

      {eyebrow && (
        <Text
          position={[0, height / 2 - 0.5, 0.02]}
          font={PLAYFAIR_FONT}
          fontSize={0.13}
          letterSpacing={0.15}
          color="#C9A227"
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
        color="#FAF8F4"
        anchorX="center"
        anchorY="middle"
      >
        {lines.join("\n")}
      </Text>
    </group>
  );
}