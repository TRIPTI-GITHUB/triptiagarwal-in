"use client";

import { useEffect, MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { moveCameraInRooms } from "@/lib/museum/roomMovement";
import { TURN_SPEED, MAX_INTERACT_DISTANCE } from "@/lib/museum/roomConstants";
import type { MuseumModeChoice } from "@/components/museum/ModeChoicePoster";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

const MOVE_SPEED = 3;
const LOOK_SENSITIVITY = 0.0025;

interface RoomMobileRigProps {
  moveRef: MutableRefObject<{ x: number; y: number }>;
  lookRef: MutableRefObject<{ x: number; y: number }>;
  tapRef: MutableRefObject<{ x: number; y: number; pending: boolean }>;
  turnRef: MutableRefObject<{ left: boolean; right: boolean }>;
  numRooms: number;
  onSelectSheet: (sheet: ExhibitSheet) => void;
  onSelectMode: (mode: MuseumModeChoice) => void;
  paused?: boolean;
}

/**
 * RoomMobileRig
 * Client Component - mobile counterpart to RoomFreeRoam. A pending
 * tap (from TouchLookArea) is raycast the same way: checks for
 * isExhibitFrame (sheet selection) or isModeOption (mode selection).
 */
export function RoomMobileRig({
  moveRef,
  lookRef,
  tapRef,
  turnRef,
  numRooms,
  onSelectSheet,
  onSelectMode,
  paused,
}: RoomMobileRigProps) {
  const { camera, gl, scene } = useThree();
  const raycaster = new THREE.Raycaster();

  useEffect(() => {
    camera.rotation.order = "YXZ";
  }, [camera]);

  useFrame((_, delta) => {
    if (paused) {
      tapRef.current.pending = false;
      return;
    }

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

    if (turnRef.current.left) camera.rotation.y += TURN_SPEED * delta;
    if (turnRef.current.right) camera.rotation.y -= TURN_SPEED * delta;

    const move = moveRef.current;
    moveCameraInRooms(camera, move.x, -move.y, MOVE_SPEED * delta, numRooms);

    if (tapRef.current.pending) {
      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((tapRef.current.x - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((tapRef.current.y - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      const closest = hits[0];

      if (closest && closest.object.userData) {
        if (closest.object.userData.isExhibitFrame && closest.distance < MAX_INTERACT_DISTANCE) {
          onSelectSheet(closest.object.userData.sheet as ExhibitSheet);
        } else if (closest.object.userData.isModeOption) {
          onSelectMode(closest.object.userData.mode as MuseumModeChoice);
        }
      }

      tapRef.current.pending = false;
    }
  });

  return null;
}