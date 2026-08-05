"use client";

import * as THREE from "three";
import { Text } from "@react-three/drei";
import { RoomFrame } from "@/components/museum/RoomFrame";
import { EntrancePoster } from "@/components/museum/EntrancePoster";
import { ROOM_SIZE, ROOM_HEIGHT, DOOR_WIDTH, FOYER_DEPTH } from "@/lib/museum/roomConstants";
import {
  type MuseumRoom,
  roomCenterZ,
  entryWallZ,
  exitWallZ,
  foyerFrontZ,
  getFramePlacements,
} from "@/lib/museum/layout";

interface RoomsShellProps {
  rooms: MuseumRoom[];
  exhibitTitle?: string;
  exhibitTagline?: string;
}

const WALL_COLOR = "#EAF1F8";
const CEILING_COLOR = "#FBFDFF";
const FLOOR_COLOR = "#5B6B7A";
const MAT_COLOR = "#7A2E2E";
const PILLAR_COLOR = "#EDE4D3";
const PILLAR_CAP_COLOR = "#C9A227";

function DoorWall({ z, facing }: { z: number; facing: number }) {
  const half = ROOM_SIZE / 2;
  const segmentWidth = half - DOOR_WIDTH / 2;

  return (
    <group>
      <mesh position={[-(DOOR_WIDTH / 2 + segmentWidth / 2), ROOM_HEIGHT / 2, z]} rotation={[0, facing, 0]}>
        <planeGeometry args={[segmentWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[DOOR_WIDTH / 2 + segmentWidth / 2, ROOM_HEIGHT / 2, z]} rotation={[0, facing, 0]}>
        <planeGeometry args={[segmentWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Pillar({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.5, ROOM_HEIGHT, 0.5]} />
        <meshStandardMaterial color={PILLAR_COLOR} />
      </mesh>
      <mesh position={[0, ROOM_HEIGHT - 0.15, 0]}>
        <boxGeometry args={[0.7, 0.3, 0.7]} />
        <meshStandardMaterial color={PILLAR_CAP_COLOR} />
      </mesh>
    </group>
  );
}

/**
 * RoomsShell
 * Renders the full gallery hall shell: an entrance facade wall (with
 * a doorway gap, flanked by two welcome/nameplate posters) at the
 * very front of the foyer, pillars and a welcome mat further in near
 * Room 1's doorway, the two exhibit-specific posters from Step A, and
 * every room's floor, ceiling, walls, and mounted sheets.
 */
export function RoomsShell({ rooms, exhibitTitle, exhibitTagline }: RoomsShellProps) {
  const numRooms = rooms.length;
  const frontZ = foyerFrontZ();
  const backZ = exitWallZ(numRooms - 1);
  const centerZ = (frontZ + backZ) / 2;
  const depth = frontZ - backZ;
  const half = ROOM_SIZE / 2;

  const placements = getFramePlacements(rooms);
  const matDepth = 2.5;
  const matZ = entryWallZ(0) + matDepth / 2;
  const posterZ = entryWallZ(0) + FOYER_DEPTH / 2;
  const frontPosterFlank = DOOR_WIDTH / 2 + 1.3 + 0.3;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]}>
        <planeGeometry args={[ROOM_SIZE, depth]} />
        <meshStandardMaterial color={FLOOR_COLOR} side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, matZ]}>
        <planeGeometry args={[DOOR_WIDTH + 1.5, matDepth]} />
        <meshStandardMaterial color={MAT_COLOR} side={THREE.DoubleSide} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, centerZ]}>
        <planeGeometry args={[ROOM_SIZE, depth]} />
        <meshStandardMaterial color={CEILING_COLOR} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[-half, ROOM_HEIGHT / 2, centerZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[half, ROOM_HEIGHT / 2, centerZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} side={THREE.DoubleSide} />
      </mesh>

      {/* Entrance facade - the outermost wall, with a doorway gap
          flanked by two welcome posters */}
      <DoorWall z={frontZ} facing={Math.PI} />

      <EntrancePoster
        position={[-frontPosterFlank, ROOM_HEIGHT / 2 - 0.1, frontZ - 0.05]}
        rotationY={Math.PI}
        eyebrow="Digital Museum"
        lines={["Tripti Agarwal", "Heritage Lab"]}
      />
      <EntrancePoster
        position={[frontPosterFlank, ROOM_HEIGHT / 2 - 0.1, frontZ - 0.05]}
        rotationY={Math.PI}
        eyebrow="Welcome"
        lines={["Every Collectible", "Tells a Story"]}
      />

      <Pillar x={-(DOOR_WIDTH / 2 + 0.6)} z={entryWallZ(0) + 1} />
      <Pillar x={DOOR_WIDTH / 2 + 0.6} z={entryWallZ(0) + 1} />

      {exhibitTitle && (
        <EntrancePoster
          position={[-half + 0.05, ROOM_HEIGHT / 2 - 0.1, posterZ]}
          rotationY={Math.PI / 2}
          eyebrow="Tripti Agarwal Heritage Lab"
          lines={["The Story Of", exhibitTitle]}
        />
      )}

      {exhibitTagline && (
        <EntrancePoster
          position={[half - 0.05, ROOM_HEIGHT / 2 - 0.1, posterZ]}
          rotationY={-Math.PI / 2}
          lines={[exhibitTagline]}
        />
      )}

      <pointLight
        position={[0, ROOM_HEIGHT - 0.6, entryWallZ(0) + 1.2]}
        intensity={1.3}
        color="#ffdca8"
        distance={8}
        decay={1.5}
      />

      <pointLight
        position={[0, ROOM_HEIGHT - 0.6, frontZ - 1]}
        intensity={1}
        color="#ffffff"
        distance={7}
        decay={1.5}
      />

      {rooms.map((_, i) => (
        <DoorWall key={"entry-" + i} z={entryWallZ(i)} facing={Math.PI} />
      ))}
      <DoorWall z={exitWallZ(numRooms - 1)} facing={0} />

      {rooms.map((room, i) => (
        <Text
          key={room.title + i}
          position={[0, ROOM_HEIGHT - 0.6, roomCenterZ(i)]}
          fontSize={0.35}
          color="#153A5B"
          anchorX="center"
          anchorY="middle"
        >
          {room.title}
        </Text>
      ))}

      {placements.map((p) => (
        <RoomFrame
          key={p.sheet.id}
          sheet={p.sheet}
          position={[p.x, p.y, p.z]}
          rotationY={p.rotationY}
        />
      ))}
    </group>
  );
}