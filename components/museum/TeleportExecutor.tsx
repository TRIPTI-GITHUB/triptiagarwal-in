"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export interface TeleportTarget {
  position: [number, number, number];
  lookAt: [number, number, number];
}

interface TeleportExecutorProps {
  target: TeleportTarget | null;
  onDone: () => void;
}

/**
 * TeleportExecutor
 * Always mounted inside <Canvas>. Whenever `target` changes to a new
 * value, snaps the camera there immediately - no easing, no walking
 * animation - per section 13's teleport/fast-travel requirement for
 * visitors with vestibular sensitivity or motion-sickness risk. This is
 * deliberately the opposite of KeyboardPointNav's eased move.
 */
export function TeleportExecutor({ target, onDone }: TeleportExecutorProps) {
  const { camera } = useThree();

  useEffect(() => {
    if (!target) return;
    camera.position.set(...target.position);
    camera.lookAt(new THREE.Vector3(...target.lookAt));
    onDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return null;
}
