"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { WALL_OFFSET, SHEET_SPACING, EYE_HEIGHT, FRAME_Y, WALK_SPEED } from "@/lib/museum/constants";

interface CameraRigProps {
  targetIndex: number; // -1 = entrance, 0..N-1 = sheet index
}

/**
 * CameraRig
 * Client Component rendered inside <Canvas>. Replaces free WASD
 * movement entirely - instead, it glides the camera toward a fixed
 * "stop" each time targetIndex changes (driven by the Next/Previous
 * buttons), using camera.lookAt() each frame so it always ends up
 * facing the correct sheet, without any manual rotation math.
 */
export function CameraRig({ targetIndex }: CameraRigProps) {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(0, EYE_HEIGHT, 0));

  useEffect(() => {
    camera.position.set(0, EYE_HEIGHT, SHEET_SPACING);
    currentLookAt.current.set(0, EYE_HEIGHT, 0);
    camera.lookAt(currentLookAt.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    const atEntrance = targetIndex === -1;
    const z = atEntrance ? SHEET_SPACING : -targetIndex * SHEET_SPACING;

    const targetPos = new THREE.Vector3(0, EYE_HEIGHT, z);
    const targetLookAt = new THREE.Vector3(
      atEntrance ? 0 : -WALL_OFFSET,
      atEntrance ? EYE_HEIGHT : FRAME_Y,
      atEntrance ? 0 : z
    );

    const t = 1 - Math.exp(-WALK_SPEED * delta);
    camera.position.lerp(targetPos, t);
    currentLookAt.current.lerp(targetLookAt, t);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}