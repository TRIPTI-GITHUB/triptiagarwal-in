"use client";

const SEAT_COLOR = "#7A2E2E";
const WOOD_COLOR = "#5C3A21";
const TRIM_COLOR = "#C9A227";

interface LobbyBenchProps {
  position: [number, number, number];
  rotationY: number;
}

/**
 * LobbyBench
 * A simple stylized bench: a burgundy upholstered seat and backrest
 * with dark mahogany legs and a thin gold trim strip - built from
 * plain box geometry to match the low-poly, elegant aesthetic already
 * used throughout the museum (frames, pillars), rather than
 * attempting a photorealistic model.
 */
export function LobbyBench({ position, rotationY }: LobbyBenchProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Seat cushion */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[1.7, 0.16, 0.55]} />
        <meshStandardMaterial color={SEAT_COLOR} />
      </mesh>

      {/* Gold trim strip along the seat edge */}
      <mesh position={[0, 0.34, 0.28]}>
        <boxGeometry args={[1.7, 0.02, 0.03]} />
        <meshStandardMaterial color={TRIM_COLOR} />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, 0.75, -0.24]}>
        <boxGeometry args={[1.7, 0.55, 0.1]} />
        <meshStandardMaterial color={SEAT_COLOR} />
      </mesh>

      {/* Legs */}
      {[
        [-0.75, -0.2],
        [0.75, -0.2],
        [-0.75, 0.2],
        [0.75, 0.2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.17, z]}>
          <boxGeometry args={[0.08, 0.34, 0.08]} />
          <meshStandardMaterial color={WOOD_COLOR} />
        </mesh>
      ))}
    </group>
  );
}
