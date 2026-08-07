"use client";

import { useEffect, useRef, MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { moveCameraInRooms } from "@/lib/museum/roomMovement";
import { TURN_SPEED, MAX_INTERACT_DISTANCE } from "@/lib/museum/roomConstants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

const MOVE_SPEED = 3;
const LOOK_SENSITIVITY = 0.005;
const CLICK_MOVE_THRESHOLD = 6;

interface RoomFreeRoamProps {
  numRooms: number;
  onSelectSheet: (sheet: ExhibitSheet) => void;
  onSelectMode: (mode: "tour" | "free") => void;
  turnRef: MutableRefObject<{ left: boolean; right: boolean }>;
  paused?: boolean;
}

/**
 * RoomFreeRoam
 * Client Component - desktop controls for the room-based layout.
 * A click that isn't a drag raycasts from the exact clicked point and
 * checks the closest hit: userData.isExhibitFrame selects a sheet,
 * userData.isModeOption (from ModeChoicePoster) selects a mode -
 * both handled by the same click-vs-drag detection.
 */
export function RoomFreeRoam({ numRooms, onSelectSheet, onSelectMode, turnRef, paused }: RoomFreeRoamProps) {
  const { camera, gl, scene } = useThree();

  const keys = useRef({
    forward: false,
    backward: false,
    strafeLeft: false,
    strafeRight: false,
    turnLeft: false,
    turnRight: false,
  });
  const isDragging = useRef(false);
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const lastPointer = useRef({ x: 0, y: 0 });
  const raycaster = useRef(new THREE.Raycaster());
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    camera.rotation.order = "YXZ";
  }, [camera]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.code) {
        case "KeyW":
          keys.current.forward = true;
          break;
        case "KeyS":
          keys.current.backward = true;
          break;
        case "KeyA":
          keys.current.strafeLeft = true;
          break;
        case "KeyD":
          keys.current.strafeRight = true;
          break;
        case "ArrowUp":
          keys.current.forward = true;
          break;
        case "ArrowDown":
          keys.current.backward = true;
          break;
        case "ArrowLeft":
          keys.current.turnLeft = true;
          break;
        case "ArrowRight":
          keys.current.turnRight = true;
          break;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      switch (e.code) {
        case "KeyW":
          keys.current.forward = false;
          break;
        case "KeyS":
          keys.current.backward = false;
          break;
        case "KeyA":
          keys.current.strafeLeft = false;
          break;
        case "KeyD":
          keys.current.strafeRight = false;
          break;
        case "ArrowUp":
          keys.current.forward = false;
          break;
        case "ArrowDown":
          keys.current.backward = false;
          break;
        case "ArrowLeft":
          keys.current.turnLeft = false;
          break;
        case "ArrowRight":
          keys.current.turnRight = false;
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
      if (pausedRef.current) return;

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

      if (!closest || !closest.object.userData) return;

      if (closest.object.userData.isExhibitFrame && closest.distance < MAX_INTERACT_DISTANCE) {
        onSelectSheet(closest.object.userData.sheet as ExhibitSheet);
      } else if (closest.object.userData.isModeOption) {
        onSelectMode(closest.object.userData.mode as "tour" | "free");
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
  }, [camera, gl, scene, onSelectSheet, onSelectMode]);

  useFrame((_, delta) => {
    if (pausedRef.current) return;

    if (keys.current.turnLeft || turnRef.current.left) {
      camera.rotation.y += TURN_SPEED * delta;
    }
    if (keys.current.turnRight || turnRef.current.right) {
      camera.rotation.y -= TURN_SPEED * delta;
    }

    const moveZ = (keys.current.forward ? 1 : 0) - (keys.current.backward ? 1 : 0);
    const moveX = (keys.current.strafeRight ? 1 : 0) - (keys.current.strafeLeft ? 1 : 0);
    moveCameraInRooms(camera, moveX, moveZ, MOVE_SPEED * delta, numRooms);
  });

  return null;
}