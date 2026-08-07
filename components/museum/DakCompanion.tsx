"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DakModel } from "@/components/museum/DakModel";
import { dampedEaseFactor } from "@/lib/museum/easing";
import { DAK_PERCH_POSITION, DAK_BOB_AMPLITUDE, DAK_BOB_PERIOD_SECONDS, type DakMode } from "@/lib/museum/dakConfig";

const GREETING_SCALE = 1.1;
const SCALE_EASE_SPEED = 4;

interface DakCompanionProps {
  mode: DakMode;
  position?: [number, number, number];
  rotationY?: number;
}

/**
 * DakCompanion
 * The mascot entity - positions and animates DakModel per `mode`, so one
 * component can drive lobby-greeter, guided-tour-leader, and
 * explore-mode-helper behavior later without duplicated mascot logic
 * (section 15). This phase only implements:
 *  - idle: a slow breathing/bob cycle - ambient life, nothing that
 *    calls attention to itself (section 11).
 *  - greeting: a small eased "perk up" scale bump while
 *    DakDialogueBubble is showing, using the same damped-ease curve as
 *    the camera's own eased motions.
 *  - dismissed: renders nothing.
 * `guiding`/`celebrating` fall back to the idle bob for now - Phase 5
 * gives them their own behavior without changing this prop contract.
 */
export function DakCompanion({ mode, position = DAK_PERCH_POSITION, rotationY = Math.PI }: DakCompanionProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const bob = Math.sin((clock.elapsedTime * Math.PI * 2) / DAK_BOB_PERIOD_SECONDS) * DAK_BOB_AMPLITUDE;
    group.position.set(position[0], position[1] + bob, position[2]);

    const targetScale = mode === "greeting" ? GREETING_SCALE : 1;
    const t = dampedEaseFactor(SCALE_EASE_SPEED, delta);
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, t));
  });

  if (mode === "dismissed") return null;

  return (
    <group ref={groupRef} position={position} rotation={[0, rotationY, 0]}>
      <DakModel />
    </group>
  );
}
