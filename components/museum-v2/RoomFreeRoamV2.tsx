"use client";

import { useEffect, useRef, MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { moveCameraInMuseumV2 } from "@/lib/museum-v2/roomMovement";
import { TURN_SPEED, MAX_INTERACT_DISTANCE } from "@/lib/museum/roomConstants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

const MOVE_SPEED = 3;
const LOOK_SENSITIVITY = 0.005;
const CLICK_MOVE_THRESHOLD = 6;

interface RoomFreeRoamV2Props {
  numWings: number;
  onSelectSheet: (sheet: ExhibitSheet) => void;
  onFloorClick: (point: THREE.Vector3) => void;
  turnRef: MutableRefObject<{ left: boolean; right: boolean }>;
  paused?: boolean;
}

/**
 * RoomFreeRoamV2
 * museum-v2's desktop controls - a new variant of the existing
 * RoomFreeRoam (not an edit to it), since it needs the new collision
 * bounds (moveCameraInMuseumV2) and adds one new interaction: clicking
 * open floor (userData.isWalkableFloor, tagged on every floor mesh in
 * LobbyHubShell/WingHallShell) reports the hit point via `onFloorClick`
 * rather than moving the camera itself - MuseumV2Scene feeds that point
 * into the existing, unmodified KeyboardPointNav as the mover, so there
 * is still only one movement-execution system, just a second trigger
 * for it (mouse/touch raycast, alongside the existing keyboard one).
 */
export function RoomFreeRoamV2({ numWings, onSelectSheet, onFloorClick, turnRef, paused }: RoomFreeRoamV2Props) {
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
    // Mutating the camera returned by useThree() every frame is the
    // standard react-three-fiber pattern for first-person controls -
    // there is no non-mutating camera-move API in r3f/three.js. The
    // existing museum's RoomFreeRoam/RoomMobileRig do the identical
    // thing (frozen-baseline tolerated there); disabled explicitly here
    // rather than silently inherited, since this is a new file.
    // eslint-disable-next-line react-hooks/immutability
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
          keys.current.strafeLeft = true;
          break;
        case "KeyD":
          keys.current.strafeRight = true;
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
        case "ArrowUp":
          keys.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = false;
          break;
        case "KeyA":
          keys.current.strafeLeft = false;
          break;
        case "KeyD":
          keys.current.strafeRight = false;
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
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
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
      } else if (closest.object.userData.isWalkableFloor) {
        onFloorClick(closest.point);
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
  }, [camera, gl, scene, onSelectSheet, onFloorClick]);

  /* eslint-disable react-hooks/immutability -- necessary r3f camera mutation, see rotation-order effect above */
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
    moveCameraInMuseumV2(camera, moveX, moveZ, MOVE_SPEED * delta, numWings);
  });
  /* eslint-enable react-hooks/immutability */

  return null;
}
