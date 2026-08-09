"use client";

import { FRAME_WOOD_COLOR, MUSEUM_GOLD, MUSEUM_TEAL } from "@/lib/museum/museumPalette";

const TABLE_COLOR = FRAME_WOOD_COLOR;
const TOP_TRIM = MUSEUM_GOLD;
const PLANT_POT_COLOR = MUSEUM_TEAL;
const PLANT_LEAF_COLOR = "#3A6B4A";

interface LobbySideTableProps {
  position: [number, number, number];
}

/**
 * LobbySideTable
 * A small round table with a gold-trimmed top and a simple stylized
 * potted plant on it - a decorative accent placed beside one of the
 * lobby benches, off the entry corridor's center sightline.
 */
export function LobbySideTable({ position }: LobbySideTableProps) {
  return (
    <group position={position}>
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.04, 24]} />
        <meshStandardMaterial color={TABLE_COLOR} />
      </mesh>
      <mesh position={[0, 0.385, 0]}>
        <cylinderGeometry args={[0.36, 0.36, 0.01, 24]} />
        <meshStandardMaterial color={TOP_TRIM} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.36, 8]} />
        <meshStandardMaterial color={TABLE_COLOR} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
        <meshStandardMaterial color={TABLE_COLOR} />
      </mesh>

      {/* Potted plant */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.14, 12]} />
        <meshStandardMaterial color={PLANT_POT_COLOR} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <coneGeometry args={[0.14, 0.28, 12]} />
        <meshStandardMaterial color={PLANT_LEAF_COLOR} />
      </mesh>
    </group>
  );
}
