"use client";

import { MUSEUM_GOLD, HIGH_CONTRAST_TRIM } from "@/lib/museum/museumPalette";

const FIXTURE_DARK = "#1C1712";

interface CeilingFixtureProps {
  position: [number, number, number];
  glowColor: string;
  highContrast?: boolean;
}

/**
 * CeilingFixture
 * A simple hanging lamp mesh (mounting rod + gold shade + glowing
 * bulb) placed at each room/lobby point light's position, so the
 * light reading on the ceiling has a visible source instead of the
 * bare glow patch the scene previously rendered with no fixture
 * geometry at all.
 */
export function CeilingFixture({ position, glowColor, highContrast }: CeilingFixtureProps) {
  const [x, y, z] = position;
  const trim = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshStandardMaterial color={FIXTURE_DARK} />
      </mesh>
      <mesh rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.22, 0.18, 16, 1, true]} />
        <meshStandardMaterial color={trim} side={2} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <sphereGeometry args={[0.08, 12, 10]} />
        <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}
