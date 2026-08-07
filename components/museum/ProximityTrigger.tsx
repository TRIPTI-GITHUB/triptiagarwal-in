"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

interface ProximityTriggerProps {
  position: [number, number, number];
  radius: number;
  onChange: (isNear: boolean) => void;
}

/**
 * ProximityTrigger
 * Generic "visitor is within `radius` of this point" primitive, checked
 * against the camera's XZ position every frame. Renders nothing itself -
 * it only calls `onChange` on the near/far edge (not every frame), so
 * consumers (MountedExhibitSheet today; Doorway, DakCompanion later) can
 * drive their own hover/dim/prompt state without each reimplementing the
 * distance check.
 */
export function ProximityTrigger({ position, radius, onChange }: ProximityTriggerProps) {
  const { camera } = useThree();
  const wasNear = useRef(false);

  useFrame(() => {
    const dx = camera.position.x - position[0];
    const dz = camera.position.z - position[2];
    const isNear = dx * dx + dz * dz <= radius * radius;

    if (isNear !== wasNear.current) {
      wasNear.current = isNear;
      onChange(isNear);
    }
  });

  return null;
}
