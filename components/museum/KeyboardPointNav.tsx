"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { dampedEaseFactor } from "@/lib/museum/easing";

const MOVE_SPEED = 3;
const ARRIVE_THRESHOLD = 0.1;

interface KeyboardPointNavProps {
  targetPosition: [number, number, number];
  targetLookAt: [number, number, number];
  paused?: boolean;
  onArrived: () => void;
}

/**
 * KeyboardPointNav
 * Rendered inside <Canvas> only while a keyboard-activated move (Tab to
 * focus a point of interest, Enter/Space to go there - section 13) is in
 * flight. Eases the camera - position and look direction both - toward
 * the target using the same damped-ease curve as ExhibitDolly/Dak's
 * walk, since this is an *automated* move and section 11's animation
 * strategy asks for eased motion on all of those, not just the mouse-
 * driven ones. Unlike Teleport (TeleportExecutor), which is
 * deliberately instant for vestibular-sensitivity reasons, this one is
 * meant to be felt.
 */
export function KeyboardPointNav({ targetPosition, targetLookAt, paused, onArrived }: KeyboardPointNavProps) {
  const { camera } = useThree();
  const lookAtPoint = useRef<THREE.Vector3 | null>(null);
  const arrivedRef = useRef(false);

  useEffect(() => {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    lookAtPoint.current = camera.position.clone().add(forward);
    arrivedRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    if (paused || arrivedRef.current || !lookAtPoint.current) return;

    const t = dampedEaseFactor(MOVE_SPEED, delta);
    const targetPos = new THREE.Vector3(...targetPosition);
    camera.position.lerp(targetPos, t);
    lookAtPoint.current.lerp(new THREE.Vector3(...targetLookAt), t);
    camera.lookAt(lookAtPoint.current);

    if (camera.position.distanceTo(targetPos) < ARRIVE_THRESHOLD) {
      arrivedRef.current = true;
      onArrived();
    }
  });

  return null;
}
