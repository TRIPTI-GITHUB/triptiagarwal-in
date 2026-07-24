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
}

/**
 * MobileCameraRig
 * Client Component rendered inside <Canvas> - the mobile counterpart
 * to FirstPersonControls. Reads continuously-updated values from
 * moveRef (joystick direction) and lookRef (accumulated look-drag)
 * each frame, rather than keyboard/mouse events, since neither exists
 * on a touch device.
 */
export function MobileCameraRig({ moveRef, lookRef }: MobileCameraRigProps) {
  const { camera } = useThree();

  // "YXZ" rotation order applies yaw (left/right) before pitch (up/down),
  // which prevents the camera from ever accidentally tilting sideways
  // (rolling) as you look around - the same order PointerLockControls
  // uses internally for desktop.
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
      // Reset after applying - lookRef only ever holds "movement
      // since last frame," not an ongoing value.
      look.x = 0;
      look.y = 0;
    }

    const move = moveRef.current;
    // Joystick's y-axis is inverted here: dragging UP (negative y)
    // should mean walking FORWARD (positive moveZ) - matches the
    // convention of every game joystick.
    moveCamera(camera, move.x, -move.y, MOVE_SPEED * delta);
  });

  return null;
}