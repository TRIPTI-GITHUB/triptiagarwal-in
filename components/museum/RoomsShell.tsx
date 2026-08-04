"use client";

import { Text } from "@react-three/drei";
import { RoomFrame } from "@/components/museum/RoomFrame";
import { ROOM_SIZE, ROOM_HEIGHT, DOOR_WIDTH } from "@/lib/museum/roomConstants";
import {
  type MuseumRoom,
  totalHallLength,
  roomCenterZ,
  entryWallZ,
  exitWallZ,
  getFramePlacements,
} from "@/lib/museum/layout";

interface RoomsShellProps {
  rooms: MuseumRoom[];
}

const WALL_COLOR = "#EAF1F8";
const CEILING_COLOR = "#FBFDFF";
const FLOOR_COLOR = "#5B6B7A";

function DoorWall({ z, facing }: { z: number; facing: number }) {
  const half = ROOM_SIZE / 2;
  const segmentWidth = half - DOOR_WIDTH / 2;

  return (
    <group>
      <mesh position={[-(DOOR_WIDTH / 2 + segmentWidth / 2), ROOM_HEIGHT / 2, z]} rotation={[0, facing, 0]}>
        <planeGeometry args={[segmentWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[DOOR_WIDTH / 2 + segmentWidth / 2, ROOM_HEIGHT / 2, z]} rotation={[0, facing, 0]}>
        <planeGeometry args={[segmentWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
    </group>
  );
}

/**
 * RoomsShell
 * Renders the gallery hall shell in a light blue-white palette - cool
 * walls and ceiling, a darker slate floor for grounding - with every
 * sheet mounted as a RoomFrame using a dark Heritage Blue backing.
 */
export function RoomsShell({ rooms }: RoomsShellProps) {
  const numRooms = rooms.length;
  const depth = totalHallLength(numRooms);
  const frontZ = entryWallZ(0);
  const backZ = exitWallZ(numRooms - 1);
  const centerZ = (frontZ + backZ) / 2;
  const half = ROOM_SIZE / 2;

  const placements = getFramePlacements(rooms);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]}>
        <planeGeometry args={[ROOM_SIZE, depth]} />
        <meshStandardMaterial color={FLOOR_COLOR} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, centerZ]}>
        <planeGeometry args={[ROOM_SIZE, depth]} />
        <meshStandardMaterial color={CEILING_COLOR} />
      </mesh>

      <mesh position={[-half, ROOM_HEIGHT / 2, centerZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>
      <mesh position={[half, ROOM_HEIGHT / 2, centerZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

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