"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { moveCameraInRooms } from "@/lib/museum/roomMovement";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

const MOVE_SPEED = 3;
const LOOK_SENSITIVITY = 0.005;
const CLICK_MOVE_THRESHOLD = 6; // pixels - below this, treat as a click, not a drag

interface RoomFreeRoamProps {
  numRooms: number;
  onSelect: (sheet: ExhibitSheet) => void;
}

/**
 * RoomFreeRoam
 * Client Component - desktop controls for the room-based layout.
 * WASD/arrow keys move; click-and-drag looks around. A pointerdown
 * followed by a pointerup with very little movement in between is
 * treated as a click-to-select: a ray is cast from the camera through
 * the exact clicked screen position to find which sheet (if any) was
 * clicked.
 */
export function RoomFreeRoam({ numRooms, onSelect }: RoomFreeRoamProps) {
  const { camera, gl, scene } = useThree();

  const keys = useRef({ forward: false, backward: false, left: false, right: false });
  const isDragging = useRef(false);
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
    camera.rotation.order = "YXZ";
  }, [camera]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.code) {
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

    function handleKeyUp(e: KeyboardEvent) {
      switch (e.code) {
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

  useEffect(() => {
    const dom = gl.domElement;

    function handlePointerDown(e: PointerEvent) {
      isDragging.current = true;
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      lastPointer.current = { x: e.clientX, y: e.clientY };
    }

    function handlePointerMove(e: PointerEvent) {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      camera.rotation.y -= dx * LOOK_SENSITIVITY;
      camera.rotation.x -= dy * LOOK_SENSITIVITY;
      camera.rotation.x = THREE.MathUtils.clamp(
        camera.rotation.x,
        -Math.PI / 2 + 0.1,
        Math.PI / 2 - 0.1
      );
    }

    function handlePointerUp(e: PointerEvent) {
      isDragging.current = false;

      const dx = e.clientX - pointerDownPos.current.x;
      const dy = e.clientY - pointerDownPos.current.y;
      const movedDistance = Math.sqrt(dx * dx + dy * dy);

      if (movedDistance > CLICK_MOVE_THRESHOLD) return;

      const rect = dom.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hits = raycaster.current.intersectObjects(scene.children, true);
      const closest = hits[0];

      if (closest && closest.object.userData && closest.object.userData.isExhibitFrame) {
        onSelect(closest.object.userData.sheet as ExhibitSheet);
      }
    }

    dom.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      dom.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [camera, gl, scene, onSelect]);

  useFrame((_, delta) => {
    const moveZ = (keys.current.forward ? 1 : 0) - (keys.current.backward ? 1 : 0);
    const moveX = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
    moveCameraInRooms(camera, moveX, moveZ, MOVE_SPEED * delta, numRooms);
  });

  return null;
}