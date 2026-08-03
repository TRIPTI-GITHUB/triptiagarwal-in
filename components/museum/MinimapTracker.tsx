"use client";

import { MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export interface MinimapPose {
  x: number;
  z: number;
  facingX: number;
  facingZ: number;
}

interface MinimapTrackerProps {
  poseRef: MutableRefObject<MinimapPose>;
}

/**
 * MinimapTracker
 * Client Component rendered inside <Canvas>. Every frame, writes the
 * camera's current position and facing direction into poseRef - a
 * plain mutable ref, not React state, so this never triggers a
 * re-render of the 3D scene. The Minimap component (outside the
 * Canvas) reads this ref independently on its own slower timer.
 */
export function MinimapTracker({ poseRef }: MinimapTrackerProps) {
  const { camera } = useThree();
  const forward = new THREE.Vector3();

  useFrame(() => {
    camera.getWorldDirection(forward);
    poseRef.current.x = camera.position.x;
    poseRef.current.z = camera.position.z;
    poseRef.current.facingX = forward.x;
    poseRef.current.facingZ = forward.z;
  });

  return null;
}