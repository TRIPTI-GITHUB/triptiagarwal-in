"use client";

import { Text } from "@react-three/drei";
import { FRAME_WOOD_COLOR, MUSEUM_GOLD, MUSEUM_TEAL, PILLAR_COLOR, HIGH_CONTRAST_TRIM } from "@/lib/museum/museumPalette";

const PLAYFAIR_FONT = "/fonts/PlayfairDisplay-Bold.ttf";
const WOOD_COLOR = FRAME_WOOD_COLOR;
const LAMP_COLOR = "#3E2723";

interface ReceptionCounterProps {
  position: [number, number, number];
  rotationY: number;
  highContrast?: boolean;
}

/**
 * ReceptionCounter
 * An L-shaped reception desk with a gold-trimmed counter top, a
 * standing "Reception" signboard behind it, and a small desk lamp -
 * built from simple box/cylinder geometry to match the museum's
 * existing low-poly, elegant aesthetic.
 */
export function ReceptionCounter({ position, rotationY, highContrast }: ReceptionCounterProps) {
  const trim = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;
  const signBack = MUSEUM_TEAL;
  const signText = trim;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Long front section of the desk */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[2.2, 0.9, 0.6]} />
        <meshStandardMaterial color={WOOD_COLOR} />
      </mesh>

      {/* Short return section, forming the "L" */}
      <mesh position={[-0.8, 0.45, 0.65]}>
        <boxGeometry args={[0.6, 0.9, 1.1]} />
        <meshStandardMaterial color={WOOD_COLOR} />
      </mesh>

      {/* Gold trim strip along the top front edge */}
      <mesh position={[0, 0.91, 0.31]}>
        <boxGeometry args={[2.2, 0.02, 0.02]} />
        <meshStandardMaterial color={trim} roughness={0.4} metalness={0.25} />
      </mesh>

      {/* Counter top surface, slightly overhanging */}
      <mesh position={[-0.3, 0.925, 0.1]}>
        <boxGeometry args={[3.0, 0.05, 1.4]} />
        <meshStandardMaterial color={PILLAR_COLOR} />
      </mesh>

      {/* Desk lamp */}
      <group position={[0.7, 0.95, -0.05]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.04, 16]} />
          <meshStandardMaterial color={LAMP_COLOR} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.36, 8]} />
          <meshStandardMaterial color={LAMP_COLOR} />
        </mesh>
        <mesh position={[0, 0.42, 0.06]} rotation={[0.5, 0, 0]}>
          <coneGeometry args={[0.1, 0.16, 12, 1, true]} />
          <meshStandardMaterial color={trim} side={2} roughness={0.4} metalness={0.25} />
        </mesh>
      </group>

      {/* Standing signboard behind the desk */}
      <group position={[0, 1.85, -0.75]}>
        <mesh>
          <planeGeometry args={[1.8, 0.7]} />
          <meshStandardMaterial color={trim} roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[1.7, 0.6]} />
          <meshStandardMaterial color={signBack} />
        </mesh>
        <Text
          position={[0, 0, 0.02]}
          font={PLAYFAIR_FONT}
          fontSize={0.24}
          letterSpacing={0.1}
          color={signText}
          anchorX="center"
          anchorY="middle"
        >
          RECEPTION
        </Text>
      </group>
    </group>
  );
}