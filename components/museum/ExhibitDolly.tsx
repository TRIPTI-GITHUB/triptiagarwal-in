"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EYE_HEIGHT, FRAME_Y, DOLLY_SPEED, DOLLY_ARRIVE_THRESHOLD } from "@/lib/museum/roomConstants";
import { dampedEaseFactor } from "@/lib/museum/easing";

interface ExhibitDollyProps {
  targetX: number;
  targetZ: number;
  rotationY: number;
  standoff: number;
  returning: boolean;
  onArrived: () => void;
}

interface ReturnPose {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

/**
 * ExhibitDolly
 * Rendered inside <Canvas> for the lifetime of the exhibit vitrine
 * viewer (open through close). Every frame, eases the camera - position
 * and look direction both - toward a standing spot in front of the
 * current sheet, close enough to fill the view, using the same
 * exponential-ease technique as TourGuide (never linear, never instant,
 * per section 11's animation strategy). Zooming or stepping to the next
 * sheet just changes the target; the camera smoothly re-settles rather
 * than cutting.
 *
 * The first frame captures the visitor's exact position and orientation
 * before any movement happens. When `returning` becomes true (viewer
 * closing), the camera eases back to that captured pose instead of the
 * sheet, so exiting always restores the visitor's exact standing spot -
 * never a reset to the room entrance.
 */
export function ExhibitDolly({
  targetX,
  targetZ,
  rotationY,
  standoff,
  returning,
  onArrived,
}: ExhibitDollyProps) {
  const { camera } = useThree();
  const returnPose = useRef<ReturnPose | null>(null);
  const lookAtPoint = useRef<THREE.Vector3 | null>(null);

  useFrame((_, delta) => {
    if (!returnPose.current) {
      returnPose.current = {
        position: camera.position.clone(),
        quaternion: camera.quaternion.clone(),
      };
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      lookAtPoint.current = camera.position.clone().add(forward);
    }

    const t = dampedEaseFactor(DOLLY_SPEED, delta);

    if (returning) {
      camera.position.lerp(returnPose.current.position, t);
      camera.quaternion.slerp(returnPose.current.quaternion, t);
      if (camera.position.distanceTo(returnPose.current.position) < DOLLY_ARRIVE_THRESHOLD) {
        onArrived();
      }
      return;
    }

    const normalX = Math.sin(rotationY);
    const normalZ = Math.cos(rotationY);
    const viewPosition = new THREE.Vector3(
      targetX + normalX * standoff,
      EYE_HEIGHT,
      targetZ + normalZ * standoff
    );
    const viewLookAt = new THREE.Vector3(targetX, FRAME_Y, targetZ);

    camera.position.lerp(viewPosition, t);
    lookAtPoint.current!.lerp(viewLookAt, t);
    camera.lookAt(lookAtPoint.current!);

    if (camera.position.distanceTo(viewPosition) < DOLLY_ARRIVE_THRESHOLD) {
      onArrived();
    }
  });

  return null;
}
