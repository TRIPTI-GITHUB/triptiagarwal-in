"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DakModel } from "@/components/museum/DakModel";
import { dampedEaseFactor } from "@/lib/museum/easing";
import {
  DAK_PERCH_POSITION,
  DAK_BOB_AMPLITUDE,
  DAK_BOB_PERIOD_SECONDS,
  DAK_WALK_SPEED,
  DAK_TOUR_ARRIVE_THRESHOLD,
  type DakMode,
} from "@/lib/museum/dakConfig";

const GREETING_SCALE = 1.1;
const SCALE_EASE_SPEED = 4;
const ROTATION_EASE_SPEED = 3;

export interface DakLivePose {
  x: number;
  z: number;
}

interface DakCompanionProps {
  mode: DakMode;
  position?: [number, number, number];
  // Point Dak should face, recomputed toward it every frame (guiding
  // mode, walking between tour stops). Omit for a fixed facing angle
  // (idle/greeting at the perch) via `rotationY` instead.
  lookAt?: [number, number, number];
  rotationY?: number;
  paused?: boolean;
  // When true (section 13), position/rotation/scale snap straight to
  // their targets instead of easing, and the idle bob freezes - the
  // same "automated moves become instant, idle animation holds still"
  // treatment KeyboardPointNav and FocusIndicator get.
  reducedMotion?: boolean;
  // Written every frame with Dak's actual eased position (not his
  // target) - Minimap reads this the same way it reads the visitor's
  // own poseRef, so the guide marker tracks where Dak visibly is.
  livePoseRef?: MutableRefObject<DakLivePose | null>;
  // Fires once when Dak's eased position settles at the current
  // `position` target (edge-triggered - re-arms automatically whenever
  // `position` changes to a new target). Guided tour uses this to know
  // when to start the dwell timer before advancing to the next stop.
  onArrived?: () => void;
}

/**
 * DakCompanion
 * The mascot entity - positions and animates DakModel per `mode`, so one
 * component can drive lobby-greeter, guided-tour-leader, and
 * explore-mode-helper behavior without duplicated mascot logic
 * (section 15).
 *
 * Position and facing both ease toward their current targets using the
 * same damped-ease curve as TourGuide/ExhibitDolly/the camera's own
 * motions - this is what makes `guiding` mode read as Dak *walking* to
 * each tour stop rather than teleporting, using exactly the technique
 * requirement 3 asked to reuse rather than duplicate. Idle and guiding
 * are the same code path: idle's target simply never changes, so it
 * converges once and holds (plus the idle bob) exactly like the perch
 * behavior already had.
 */
export function DakCompanion({
  mode,
  position = DAK_PERCH_POSITION,
  lookAt,
  rotationY = Math.PI,
  paused,
  reducedMotion,
  livePoseRef,
  onArrived,
}: DakCompanionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const currentPos = useRef<THREE.Vector3 | null>(null);
  const targetQuat = useRef(new THREE.Quaternion());
  const tmpEuler = useRef(new THREE.Euler());
  const lastTargetKey = useRef<string>("");
  const notifiedArrival = useRef(false);

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    if (!group || paused) return;

    if (!currentPos.current) {
      currentPos.current = new THREE.Vector3(...position);
    }

    const targetKey = position.join(",");
    if (targetKey !== lastTargetKey.current) {
      lastTargetKey.current = targetKey;
      notifiedArrival.current = false;
    }

    const posT = reducedMotion ? 1 : dampedEaseFactor(DAK_WALK_SPEED, delta);
    const targetVec = new THREE.Vector3(...position);
    currentPos.current.lerp(targetVec, posT);

    if (onArrived && !notifiedArrival.current && currentPos.current.distanceTo(targetVec) < DAK_TOUR_ARRIVE_THRESHOLD) {
      notifiedArrival.current = true;
      onArrived();
    }

    const bob = reducedMotion
      ? 0
      : Math.sin((clock.elapsedTime * Math.PI * 2) / DAK_BOB_PERIOD_SECONDS) * DAK_BOB_AMPLITUDE;
    group.position.set(currentPos.current.x, currentPos.current.y + bob, currentPos.current.z);

    const angle = lookAt
      ? Math.atan2(lookAt[0] - currentPos.current.x, lookAt[2] - currentPos.current.z)
      : rotationY;
    tmpEuler.current.set(0, angle, 0);
    targetQuat.current.setFromEuler(tmpEuler.current);
    group.quaternion.slerp(targetQuat.current, reducedMotion ? 1 : dampedEaseFactor(ROTATION_EASE_SPEED, delta));

    const targetScale = mode === "greeting" ? GREETING_SCALE : 1;
    const scaleT = reducedMotion ? 1 : dampedEaseFactor(SCALE_EASE_SPEED, delta);
    group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, targetScale, scaleT));

    if (livePoseRef) {
      livePoseRef.current = { x: currentPos.current.x, z: currentPos.current.z };
    }
  });

  if (mode === "dismissed") return null;

  return (
    <group ref={groupRef} position={position}>
      <DakModel />
    </group>
  );
}
