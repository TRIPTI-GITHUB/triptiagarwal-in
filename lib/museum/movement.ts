import * as THREE from "three";
import { EYE_HEIGHT } from "@/lib/museum/constants";
import {
  getOuterBounds,
  getDividerObstacles,
  type Obstacle,
} from "@/lib/museum/layout";

function collides(x: number, z: number, obstacles: Obstacle[]): boolean {
  return obstacles.some(
    (o) => x >= o.minX && x <= o.maxX && z >= o.minZ && z <= o.maxZ
  );
}

/**
 * moveCamera
 * Shared movement logic used by both desktop and mobile controls.
 * Moves the camera relative to the direction it's currently facing,
 * then resolves collisions against the outer hall walls and any
 * divider-wall obstacles - checking the X and Z axes separately, so
 * sliding along a wall works instead of movement just stopping dead
 * on contact.
 */
export function moveCamera(
  camera: THREE.Camera,
  moveX: number,
  moveZ: number,
  distance: number,
  numSections: number
) {
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();

  const right = new THREE.Vector3();
  right.crossVectors(forward, camera.up).normalize();

  const delta = new THREE.Vector3();
  delta.addScaledVector(forward, moveZ * distance);
  delta.addScaledVector(right, moveX * distance);

  const bounds = getOuterBounds(numSections);
  const obstacles = getDividerObstacles(numSections);

  let nextX = camera.position.x + delta.x;
  let nextZ = camera.position.z + delta.z;

  if (collides(nextX, nextZ, obstacles)) {
    if (!collides(nextX, camera.position.z, obstacles)) {
      nextZ = camera.position.z;
    } else if (!collides(camera.position.x, nextZ, obstacles)) {
      nextX = camera.position.x;
    } else {
      nextX = camera.position.x;
      nextZ = camera.position.z;
    }
  }

  camera.position.x = THREE.MathUtils.clamp(nextX, bounds.minX, bounds.maxX);
  camera.position.z = THREE.MathUtils.clamp(nextZ, bounds.minZ, bounds.maxZ);
  camera.position.y = EYE_HEIGHT;
}