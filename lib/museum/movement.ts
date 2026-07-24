import * as THREE from "three";
import { ROOM_WIDTH, ROOM_DEPTH, EYE_HEIGHT, WALL_MARGIN } from "@/lib/museum/constants";

/**
 * moveCamera
 * Shared movement logic used by both desktop (FirstPersonControls) and
 * mobile (MobileCameraRig). Moves the camera relative to the direction
 * it's currently facing, then clamps the result to stay inside the
 * room's walls. Kept in one place so both control schemes always
 * behave identically - a bug fix here fixes both at once.
 *
 * @param moveX - sideways input, -1 (left) to 1 (right)
 * @param moveZ - forward/back input, -1 (back) to 1 (forward)
 * @param distance - how far to move this frame (speed * time)
 */
export function moveCamera(
  camera: THREE.Camera,
  moveX: number,
  moveZ: number,
  distance: number
) {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, camera.up).normalize();

  camera.position.addScaledVector(forward, moveZ * distance);
  camera.position.addScaledVector(right, moveX * distance);

  const maxX = ROOM_WIDTH / 2 - WALL_MARGIN;
  const maxZ = ROOM_DEPTH / 2 - WALL_MARGIN;
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -maxX, maxX);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -maxZ, maxZ);

  camera.position.y = EYE_HEIGHT;
}