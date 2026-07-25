"use client";

import { useEffect, MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { moveCamera } from "@/lib/museum/movement";

const MOVE_SPEED = 3;
const LOOK_SENSITIVITY = 0.0025;

interface MobileCameraRigProps {
  moveRef: MutableRefObject<{ x: number; y: number }>;
  lookRef: MutableRefObject<{ x: number; y: number }>;
  numSections: number;
}

/**
 * MobileCameraRig
 * Client Component rendered inside <Canvas> - the mobile counterpart
 * to FirstPersonControls, reading from moveRef/lookRef instead of
 * keyboard/mouse events.
 */
export function MobileCameraRig({
  moveRef,
  lookRef,
  numSections,
}: MobileCameraRigProps) {
  const { camera } = useThree();

  useEffect(() => {
    camera.rotation.order = "YXZ";
  }, [camera]);

  useFrame((_, delta) => {
    const look = lookRef.current;
    if (look.x !== 0 || look.y !== 0) {
      camera.rotation.y -= look.x * LOOK_SENSITIVITY;
      camera.rotation.x -= look.y * LOOK_SENSITIVITY;
      camera.rotation.x = THREE.MathUtils.clamp(
        camera.rotation.x,
        -Math.PI / 2 + 0.1,
        Math.PI / 2 - 0.1
      );
      look.x = 0;
      look.y = 0;
    }

    const move = moveRef.current;
    moveCamera(camera, move.x, -move.y, MOVE_SPEED * delta, numSections);
  });

  return null;
}