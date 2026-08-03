"use client";

import { Text } from "@react-three/drei";
import {
  ROOM_SIZE,
  ROOM_HEIGHT,
  DOOR_WIDTH,
  FRAME_WIDTH,
  FRAME_HEIGHT,
} from "@/lib/museum/roomConstants";
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

/**
 * DoorWall
 * One wall with a centered doorway gap - rendered as two solid
 * segments on either side of the gap, rather than one continuous wall.
 */
function DoorWall({ z, facing }: { z: number; facing: number }) {
  const half = ROOM_SIZE / 2;
  const segmentWidth = half - DOOR_WIDTH / 2;

  return (
    <group>
      <mesh position={[-(DOOR_WIDTH / 2 + segmentWidth / 2), ROOM_HEIGHT / 2, z]} rotation={[0, facing, 0]}>
        <planeGeometry args={[segmentWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>
      <mesh position={[DOOR_WIDTH / 2 + segmentWidth / 2, ROOM_HEIGHT / 2, z]} rotation={[0, facing, 0]}>
        <planeGeometry args={[segmentWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>
    </group>
  );
}

/**
 * RoomsShell
 * Renders every room's floor, ceiling, side walls, and doorway walls
 * in sequence, plus a numbered placeholder panel at each frame slot.
 * Placeholder panels stand in for real sheet images until a later
 * stage wires up actual textures.
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
        <meshStandardMaterial color="#3a3226" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, centerZ]}>
        <planeGeometry args={[ROOM_SIZE, depth]} />
        <meshStandardMaterial color="#f5f0e6" />
      </mesh>

      <mesh position={[-half, ROOM_HEIGHT / 2, centerZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>
      <mesh position={[half, ROOM_HEIGHT / 2, centerZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
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
          color="#2D2D2D"
          anchorX="center"
          anchorY="middle"
        >
          {room.title}
        </Text>
      ))}

      {placements.map((p) => (
        <group key={p.sheet.id} position={[p.x, p.y, p.z]} rotation={[0, p.rotationY, 0]}>
          <mesh>
            <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
            <meshStandardMaterial color="#b08d57" />
          </mesh>
          <Text position={[0, 0, 0.02]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
            {p.sheet.sheet_number}
          </Text>
        </group>
      ))}
    </group>
  );
}