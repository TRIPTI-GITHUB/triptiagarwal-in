"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FRAME_WIDTH, FRAME_HEIGHT } from "@/lib/museum/roomConstants";
import type { TourStop } from "@/lib/museum/layout";

const FOCUS_COLOR = "#C9A227";
const PULSE_PERIOD_SECONDS = 1.6;
const BAR_THICKNESS = 0.06;
const OUTLINE_MARGIN = 0.15;

interface FocusIndicatorProps {
  point: TourStop;
}

/**
 * FocusIndicator
 * The on-brand visual for whichever point of interest currently has
 * keyboard focus (section 13, requirement 3) - antique gold, matching
 * the museum's existing accent, but a different *form* than the award
 * glow (RoomFrame) rather than the same soft ambient light, so a sheet
 * that happens to be both an award and keyboard-focused reads as two
 * distinct things instead of one blurred effect. Sheets get four thin
 * corner-to-corner bars framing the mount (a deliberate, legible
 * outline); doorways get a slim pulsing ring on the floor at the
 * threshold, since there's no frame to outline there.
 *
 * Each bar/ring gets its own JSX-declared material with a ref, mutated
 * only inside useFrame - never read during render - so this stays a
 * plain array of independent instances rather than one shared value
 * threaded through render.
 */
export function FocusIndicator({ point }: FocusIndicatorProps) {
  const materials = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  useFrame(({ clock }) => {
    const opacity = 0.5 + 0.35 * Math.sin((clock.elapsedTime * Math.PI * 2) / PULSE_PERIOD_SECONDS);
    materials.current.forEach((material) => {
      if (material) material.opacity = opacity;
    });
  });

  if (point.type === "sheet") {
    const [x, y, z] = point.lookAt;
    const rotationY = point.rotationY ?? 0;
    const w = FRAME_WIDTH + OUTLINE_MARGIN * 2;
    const h = FRAME_HEIGHT + OUTLINE_MARGIN * 2;

    return (
      <group position={[x, y, z]} rotation={[0, rotationY, 0]}>
        <mesh position={[0, h / 2, 0.08]}>
          <boxGeometry args={[w, BAR_THICKNESS, BAR_THICKNESS]} />
          <meshBasicMaterial
            ref={(m) => {
              materials.current[0] = m;
            }}
            color={FOCUS_COLOR}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, -h / 2, 0.08]}>
          <boxGeometry args={[w, BAR_THICKNESS, BAR_THICKNESS]} />
          <meshBasicMaterial
            ref={(m) => {
              materials.current[1] = m;
            }}
            color={FOCUS_COLOR}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[-w / 2, 0, 0.08]}>
          <boxGeometry args={[BAR_THICKNESS, h, BAR_THICKNESS]} />
          <meshBasicMaterial
            ref={(m) => {
              materials.current[2] = m;
            }}
            color={FOCUS_COLOR}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[w / 2, 0, 0.08]}>
          <boxGeometry args={[BAR_THICKNESS, h, BAR_THICKNESS]} />
          <meshBasicMaterial
            ref={(m) => {
              materials.current[3] = m;
            }}
            color={FOCUS_COLOR}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    );
  }

  const [x, , z] = point.position;
  return (
    <mesh position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.85, 1.0, 32]} />
      <meshBasicMaterial
        ref={(m) => {
          materials.current[0] = m;
        }}
        color={FOCUS_COLOR}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
