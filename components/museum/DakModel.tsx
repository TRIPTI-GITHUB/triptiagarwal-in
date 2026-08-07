"use client";

import { DAK_COLORS } from "@/lib/museum/dakConfig";

/**
 * DakModel
 * Dak's low-poly body, built entirely from primitive geometries (no GLB
 * dependency) - a small rounded messenger bird with a satchel, in the
 * museum's restrained heritage palette. Deliberately isolated from
 * DakCompanion's animation/behavior logic and from any position/rotation
 * of its own (it renders at local origin, resting on y=0) so this
 * function can be swapped for an imported GLB later without touching
 * anything that positions or animates Dak.
 */
export function DakModel() {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.13, 0]} scale={[1, 0.92, 1.05]}>
        <sphereGeometry args={[0.11, 16, 12]} />
        <meshStandardMaterial color={DAK_COLORS.body} roughness={0.85} />
      </mesh>

      {/* Belly */}
      <mesh position={[0, 0.1, 0.07]} scale={[0.8, 0.75, 0.7]}>
        <sphereGeometry args={[0.09, 14, 10]} />
        <meshStandardMaterial color={DAK_COLORS.belly} roughness={0.85} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.24, 0.05]}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshStandardMaterial color={DAK_COLORS.body} roughness={0.85} />
      </mesh>

      {/* Beak */}
      <mesh position={[0, 0.235, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.025, 0.07, 10]} />
        <meshStandardMaterial color={DAK_COLORS.beak} roughness={0.6} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.035, 0.255, 0.11]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#2A2018" roughness={0.4} />
      </mesh>
      <mesh position={[0.035, 0.255, 0.11]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#2A2018" roughness={0.4} />
      </mesh>

      {/* Wings, folded against the body */}
      <mesh position={[-0.1, 0.14, -0.01]} rotation={[0, 0, 0.25]} scale={[0.9, 0.6, 1.4]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color={DAK_COLORS.wing} roughness={0.85} />
      </mesh>
      <mesh position={[0.1, 0.14, -0.01]} rotation={[0, 0, -0.25]} scale={[0.9, 0.6, 1.4]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color={DAK_COLORS.wing} roughness={0.85} />
      </mesh>

      {/* Tail */}
      <mesh position={[0, 0.12, -0.13]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.14, 10]} />
        <meshStandardMaterial color={DAK_COLORS.wing} roughness={0.85} />
      </mesh>

      {/* Satchel, slung on the left side */}
      <mesh position={[0.1, 0.09, 0.02]} rotation={[0, 0.15, 0]}>
        <boxGeometry args={[0.07, 0.08, 0.05]} />
        <meshStandardMaterial color={DAK_COLORS.satchel} roughness={0.9} />
      </mesh>
      {/* Wax-seal clasp */}
      <mesh position={[0.135, 0.1, 0.035]}>
        <cylinderGeometry args={[0.015, 0.015, 0.008, 10]} />
        <meshStandardMaterial color={DAK_COLORS.clasp} roughness={0.5} />
      </mesh>
    </group>
  );
}
