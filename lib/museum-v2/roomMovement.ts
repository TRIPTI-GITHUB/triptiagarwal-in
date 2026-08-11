import * as THREE from "three";
import { EYE_HEIGHT } from "@/lib/museum/roomConstants";
import { getAllWalkRects, type WalkRect } from "@/lib/museum-v2/layout";

function insideAny(x: number, z: number, rects: WalkRect[]): boolean {
  return rects.some((r) => x >= r.minX && x <= r.maxX && z >= r.minZ && z <= r.maxZ);
}

/**
 * moveCameraInMuseumV2
 * museum-v2's movement/collision logic - parallel to (not shared with)
 * lib/museum/roomMovement.ts's moveCameraInRooms. The v1 version tests
 * against an outer rectangle minus obstacles; this layout has no single
 * outer rectangle (a lobby plus a zigzagging corridor union), so the
 * walkable area is instead the UNION of getAllWalkRects' rectangles -
 * a position is legal if it falls inside any one of them. Axes are
 * still resolved separately so sliding along a wall works instead of
 * movement stopping dead on contact, matching v1's approach.
 */
export function moveCameraInMuseumV2(
  camera: THREE.Camera,
  moveX: number,
  moveZ: number,
  distance: number,
  numWings: number
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

  const rects = getAllWalkRects(numWings);

  let nextX = camera.position.x + delta.x;
  let nextZ = camera.position.z + delta.z;

  if (!insideAny(nextX, nextZ, rects)) {
    if (insideAny(nextX, camera.position.z, rects)) {
      nextZ = camera.position.z;
    } else if (insideAny(camera.position.x, nextZ, rects)) {
      nextX = camera.position.x;
    } else {
      nextX = camera.position.x;
      nextZ = camera.position.z;
    }
  }

  camera.position.x = nextX;
  camera.position.z = nextZ;
  camera.position.y = EYE_HEIGHT;
}
