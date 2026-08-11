"use client";

import { useEffect, MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { moveCameraInMuseumV2 } from "@/lib/museum-v2/roomMovement";
import { TURN_SPEED } from "@/lib/museum/roomConstants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

const MOVE_SPEED = 3;
const LOOK_SENSITIVITY = 0.0025;

interface RoomMobileRigV2Props {
  moveRef: MutableRefObject<{ x: number; y: number }>;
  lookRef: MutableRefObject<{ x: number; y: number }>;
  tapRef: MutableRefObject<{ x: number; y: number; pending: boolean }>;
  turnRef: MutableRefObject<{ left: boolean; right: boolean }>;
  numWings: number;
  onSelectSheet: (sheet: ExhibitSheet) => void;
  onFloorTap: (point: THREE.Vector3) => void;
  paused?: boolean;
}

/**
 * RoomMobileRigV2
 * museum-v2's mobile counterpart to RoomFreeRoamV2 - a new variant of
 * the existing RoomMobileRig for the new collision bounds and the
 * added floor-tap-to-move interaction (same isWalkableFloor raycast
 * tag as the desktop rig). A sheet tap is not distance-gated, matching
 * RoomMobileRig's existing touch-accessibility reasoning.
 */
export function RoomMobileRigV2({
  moveRef,
  lookRef,
  tapRef,
  turnRef,
  numWings,
  onSelectSheet,
  onFloorTap,
  paused,
}: RoomMobileRigV2Props) {
  const { camera, gl, scene } = useThree();
  const raycaster = new THREE.Raycaster();

  useEffect(() => {
    // Mutating the camera returned by useThree() every frame is the
    // standard react-three-fiber pattern for first-person controls -
    // the existing museum's RoomMobileRig does the identical thing
    // (frozen-baseline tolerated there); disabled explicitly here
    // rather than silently inherited, since this is a new file.
    // eslint-disable-next-line react-hooks/immutability
    camera.rotation.order = "YXZ";
  }, [camera]);

  /* eslint-disable react-hooks/immutability -- necessary r3f camera mutation, see rotation-order effect above */
  useFrame((_, delta) => {
    if (paused) {
      tapRef.current.pending = false;
      return;
    }

    const look = lookRef.current;
    if (look.x !== 0 || look.y !== 0) {
      camera.rotation.y -= look.x * LOOK_SENSITIVITY;
      camera.rotation.x -= look.y * LOOK_SENSITIVITY;
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
      look.x = 0;
      look.y = 0;
    }

    if (turnRef.current.left) camera.rotation.y += TURN_SPEED * delta;
    if (turnRef.current.right) camera.rotation.y -= TURN_SPEED * delta;

    const move = moveRef.current;
    moveCameraInMuseumV2(camera, move.x, -move.y, MOVE_SPEED * delta, numWings);

    if (tapRef.current.pending) {
      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((tapRef.current.x - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((tapRef.current.y - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      const closest = hits[0];

      if (closest && closest.object.userData) {
        if (closest.object.userData.isExhibitFrame) {
          onSelectSheet(closest.object.userData.sheet as ExhibitSheet);
        } else if (closest.object.userData.isWalkableFloor) {
          onFloorTap(closest.point);
        }
      }

      tapRef.current.pending = false;
    }
  });
  /* eslint-enable react-hooks/immutability */

  return null;
}
