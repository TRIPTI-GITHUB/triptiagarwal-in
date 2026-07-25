"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { moveCamera } from "@/lib/museum/movement";

const MOVE_SPEED = 3;

interface FirstPersonControlsProps {
  onLockChange: (locked: boolean) => void;
  numSections: number;
}

/**
 * FirstPersonControls
 * Client Component - desktop first-person controls. Mouse-look comes
 * from drei's PointerLockControls; WASD/arrow-key movement is read
 * here and applied every frame via the shared moveCamera function,
 * which also handles collision against the current gallery layout.
 */
export function FirstPersonControls({
  onLockChange,
  numSections,
}: FirstPersonControlsProps) {
  const { camera } = useThree();

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = true;
          break;
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = false;
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const moveZ = (keys.current.forward ? 1 : 0) - (keys.current.backward ? 1 : 0);
    const moveX = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
    moveCamera(camera, moveX, moveZ, MOVE_SPEED * delta, numSections);
  });

  return (
    <PointerLockControls
      onLock={() => onLockChange(true)}
      onUnlock={() => onLockChange(false)}
    />
  );
}