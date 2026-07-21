"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import * as THREE from "three";

const MOVE_SPEED = 3; // meters per second
const EYE_HEIGHT = 1.6;

interface FirstPersonControlsProps {
  onLockChange: (locked: boolean) => void;
}

/**
 * FirstPersonControls
 * Client Component — combines mouse-look (via drei's PointerLockControls,
 * which wraps the browser's native Pointer Lock API) with WASD/arrow-key
 * movement that we implement ourselves. Movement direction is derived
 * from the camera's current facing angle each frame, so "forward"
 * always means "the way you're looking," like a real first-person game.
 */
export function FirstPersonControls({ onLockChange }: FirstPersonControlsProps) {
  const { camera } = useThree();

  // Tracks which movement keys are currently held down. A ref (not
  // state) is used here because this updates constantly during
  // movement — using React state for this would cause far more
  // re-renders than necessary.
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

  // useFrame runs once per rendered frame (roughly 60 times per second) -
  // this is where we actually move the camera based on which keys are
  // currently held, scaled by "delta" (time since the last frame) so
  // movement speed stays consistent regardless of frame rate.
  useFrame((_, delta) => {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();

    const distance = MOVE_SPEED * delta;

    if (keys.current.forward) camera.position.addScaledVector(forward, distance);
    if (keys.current.backward) camera.position.addScaledVector(forward, -distance);
    if (keys.current.right) camera.position.addScaledVector(right, distance);
    if (keys.current.left) camera.position.addScaledVector(right, -distance);

    // Keep eye height fixed - prevents "flying" or "sinking" from
    // accumulated floating-point drift during movement.
    camera.position.y = EYE_HEIGHT;
  });

  return (
    <PointerLockControls
      onLock={() => onLockChange(true)}
      onUnlock={() => onLockChange(false)}
    />
  );
}