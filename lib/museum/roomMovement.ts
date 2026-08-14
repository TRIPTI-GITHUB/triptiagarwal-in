import * as THREE from "three";
import { EYE_HEIGHT } from "@/lib/museum/roomConstants";
import { getOuterBounds, getDoorwayObstacles, type Obstacle } from "@/lib/museum/layout";
// LOBBY REMOVED (2026-08-13): getLobbyFurnitureObstacles is no longer
// imported/called here - the foyer it protects isn't walkable anymore.
// Restore the import above and the spread below to bring it back.

function collides(x: number, z: number, obstacles: Obstacle[]): boolean {
  return obstacles.some(
    (o) => x >= o.minX && x <= o.maxX && z >= o.minZ && z <= o.maxZ
  );
}

/**
 * moveCameraInRooms
 * Shared movement logic for the room-based layout, used by both
 * desktop and mobile controls. Moves relative to the camera's facing
 * direction, then resolves collisions against the outer hall bounds,
 * doorway wall segments, and lobby furniture - checking axes
 * separately so sliding along a wall works instead of movement
 * stopping dead on contact.
 */
export function moveCameraInRooms(
  camera: THREE.Camera,
  moveX: number,
  moveZ: number,
  distance: number,
  numRooms: number
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

  const bounds = getOuterBounds(numRooms);
  const obstacles = [...getDoorwayObstacles(numRooms) /* , ...getLobbyFurnitureObstacles() */];

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