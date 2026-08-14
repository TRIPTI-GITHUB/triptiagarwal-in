"use client";

import * as THREE from "three";
import { RoomFrame } from "@/components/museum/RoomFrame";
// LOBBY REMOVED (2026-08-13): these components were only used by the
// foyer's decor (welcome posters, mode board, intro/directory walls,
// reception furniture), which is no longer rendered - see the bottom
// of this file for the commented-out JSX. Restore these imports
// alongside that JSX to bring the lobby back.
// import { EntrancePoster } from "@/components/museum/EntrancePoster";
// import { ModeChoicePoster } from "@/components/museum/ModeChoicePoster";
// import { BackWallWelcomePoster } from "@/components/museum/BackWallWelcomePoster";
// import { MuseumIntroWall } from "@/components/museum/MuseumIntroWall";
// import { GalleryDirectoryWall } from "@/components/museum/GalleryDirectoryWall";
import { ThresholdPlaque } from "@/components/museum/ThresholdPlaque";
// import type { Profile } from "@/lib/supabase/database.types";
// import { LobbyBench } from "@/components/museum/LobbyBench";
// import { LobbySideTable } from "@/components/museum/LobbySideTable";
// import { ReceptionCounter } from "@/components/museum/ReceptionCounter";
import { ROOM_SIZE, ROOM_HEIGHT, DOOR_WIDTH, DOOR_HEIGHT } from "@/lib/museum/roomConstants";
import {
  WALL_COLOR,
  CEILING_COLOR,
  FLOOR_COLOR,
  BASEBOARD_COLOR,
  MOULDING_COLOR,
  // MAT_COLOR, PILLAR_COLOR, MUSEUM_GOLD - LOBBY REMOVED, see below
  HIGH_CONTRAST_WALL_COLOR,
  HIGH_CONTRAST_CEILING_COLOR,
  HIGH_CONTRAST_FLOOR_COLOR,
  HIGH_CONTRAST_TRIM,
} from "@/lib/museum/museumPalette";
import {
  type MuseumRoom,
  entryWallZ,
  exitWallZ,
  // foyerFrontZ, LOBBY_BENCH_LEFT, LOBBY_BENCH_RIGHT, LOBBY_TABLE,
  // LOBBY_RECEPTION - LOBBY REMOVED (2026-08-13), see below
  getFramePlacements,
} from "@/lib/museum/layout";

interface RoomsShellProps {
  rooms: MuseumRoom[];
  // LOBBY REMOVED (2026-08-13): exhibitTitle/exhibitTagline/profile are
  // no longer used inside this component (they only fed the foyer's
  // welcome/tagline/profile posters) - kept here so RoomMuseumScene can
  // keep passing them unchanged, ready to restore.
  exhibitTitle?: string;
  exhibitTagline?: string;
  profile?: unknown;
  highContrast?: boolean;
  isTouch?: boolean;
}

const BASEBOARD_HEIGHT = 0.22;
const BASEBOARD_THICKNESS = 0.06;
const MOULDING_HEIGHT = 0.16;
const MOULDING_THICKNESS = 0.06;

function DoorWall({
  z,
  facing,
  wallColor,
  trimColor,
}: {
  z: number;
  facing: number;
  wallColor: string;
  trimColor: string;
}) {
  const half = ROOM_SIZE / 2;
  const segmentWidth = half - DOOR_WIDTH / 2;
  const headerHeight = ROOM_HEIGHT - DOOR_HEIGHT;

  return (
    <group position={[0, 0, z]} rotation={[0, facing, 0]}>
      <mesh position={[-(DOOR_WIDTH / 2 + segmentWidth / 2), ROOM_HEIGHT / 2, 0]}>
        <planeGeometry args={[segmentWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[DOOR_WIDTH / 2 + segmentWidth / 2, ROOM_HEIGHT / 2, 0]}>
        <planeGeometry args={[segmentWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Header closing the gap down to a human-scaled archway rather
          than a full-height slot */}
      <mesh position={[0, DOOR_HEIGHT + headerHeight / 2, 0]}>
        <planeGeometry args={[DOOR_WIDTH, headerHeight]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Gold lintel + door-frame posts - "every doorway... a physical
          marker" (Museum Navigation, section 3), offset 0.04 proud of
          the wall plane to avoid z-fighting */}
      <mesh position={[0, DOOR_HEIGHT, 0.04]}>
        <boxGeometry args={[DOOR_WIDTH + 0.15, 0.08, 0.06]} />
        <meshStandardMaterial color={trimColor} roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[-DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0.04]}>
        <boxGeometry args={[0.08, DOOR_HEIGHT, 0.06]} />
        <meshStandardMaterial color={trimColor} roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0.04]}>
        <boxGeometry args={[0.08, DOOR_HEIGHT, 0.06]} />
        <meshStandardMaterial color={trimColor} roughness={0.4} metalness={0.25} />
      </mesh>
    </group>
  );
}

// LOBBY REMOVED (2026-08-13): Pillar was only used flanking the
// foyer's entry mat, which is no longer rendered. Restore alongside
// the commented-out JSX below.
// function Pillar({ x, z, pillarColor, capColor }: { x: number; z: number; pillarColor: string; capColor: string }) {
//   return (
//     <group position={[x, 0, z]}>
//       <mesh position={[0, ROOM_HEIGHT / 2, 0]}>
//         <boxGeometry args={[0.5, ROOM_HEIGHT, 0.5]} />
//         <meshStandardMaterial color={pillarColor} />
//       </mesh>
//       <mesh position={[0, ROOM_HEIGHT - 0.15, 0]}>
//         <boxGeometry args={[0.7, 0.3, 0.7]} />
//         <meshStandardMaterial color={capColor} roughness={0.4} metalness={0.25} />
//       </mesh>
//     </group>
//   );
// }

/**
 * RoomsShell
 * Renders the gallery hall shell: every room's floor, ceiling, walls,
 * baseboard/moulding trim, doorways, threshold plaques, and mounted
 * sheets.
 *
 * LOBBY REMOVED (2026-08-13): this used to also render an entrance
 * facade, welcome posters, pillars, a mat, the Museum Introduction /
 * Gallery Directory walls, the mode-choice board, a profile poster,
 * and reception furniture, all in a foyer in front of Room 1. Visitors
 * now spawn directly inside Room 1 (RoomMuseumScene.tsx), so the hall
 * itself now starts at Room 1's own entry wall instead of the foyer's
 * outer edge - see `entryWallZ(0)` below, was `foyerFrontZ()`. All of
 * that foyer JSX is preserved, commented out, after the doorway/
 * threshold-plaque loops further down, ready to restore in one place.
 */
export function RoomsShell({ rooms, highContrast, isTouch }: RoomsShellProps) {
  const numRooms = rooms.length;
  const frontZ = entryWallZ(0);
  const backZ = exitWallZ(numRooms - 1);
  const centerZ = (frontZ + backZ) / 2;
  const depth = frontZ - backZ;
  const half = ROOM_SIZE / 2;

  const wallColor = highContrast ? HIGH_CONTRAST_WALL_COLOR : WALL_COLOR;
  const ceilingColor = highContrast ? HIGH_CONTRAST_CEILING_COLOR : CEILING_COLOR;
  const floorColor = highContrast ? HIGH_CONTRAST_FLOOR_COLOR : FLOOR_COLOR;
  const baseboardColor = highContrast ? "#1A1A1A" : BASEBOARD_COLOR;
  const trimColor = highContrast ? HIGH_CONTRAST_TRIM : MOULDING_COLOR;
  // LOBBY REMOVED (2026-08-13): pillarCapColor and the mat/poster Z
  // offsets below were only used by foyer decor. Preserved as comments
  // alongside the JSX they fed, further down this file.
  // const pillarCapColor = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;

  const placements = getFramePlacements(rooms);
  // const hasFeaturedSheets = rooms.some((room) => room.sheets.some((sheet) => sheet.featured)); // fed ModeChoicePoster only
  // const matDepth = 2.5;
  // const matZ = entryWallZ(0) + matDepth / 2;
  // const taglinePosterZ = entryWallZ(0) + 3.5;
  // const introDirectoryPosterZ = entryWallZ(0) + 1.75;
  // const modePosterZ = entryWallZ(0) + 9;
  // const welcomePosterZ = entryWallZ(0) + 9;
  // const frontPosterFlank = DOOR_WIDTH / 2 + 1.3 + 0.3;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]}>
        <planeGeometry args={[ROOM_SIZE, depth]} />
        <meshStandardMaterial color={floorColor} side={THREE.DoubleSide} />
      </mesh>

      {/* LOBBY REMOVED (2026-08-13): the entry mat used to sit here,
          just inside the (now nonexistent) foyer. See the commented
          block near the end of this file to restore it. */}

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, centerZ]}>
        <planeGeometry args={[ROOM_SIZE, depth]} />
        <meshStandardMaterial color={ceilingColor} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[-half, ROOM_HEIGHT / 2, centerZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[depth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[half, ROOM_HEIGHT / 2, centerZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[depth, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Baseboard + crown moulding along both continuous side walls -
          the cheapest available change for "stopped looking like a
          box," per the Phase 1 visual proposal */}
      <mesh position={[-half + BASEBOARD_THICKNESS / 2, BASEBOARD_HEIGHT / 2, centerZ]}>
        <boxGeometry args={[BASEBOARD_THICKNESS, BASEBOARD_HEIGHT, depth]} />
        <meshStandardMaterial color={baseboardColor} />
      </mesh>
      <mesh position={[half - BASEBOARD_THICKNESS / 2, BASEBOARD_HEIGHT / 2, centerZ]}>
        <boxGeometry args={[BASEBOARD_THICKNESS, BASEBOARD_HEIGHT, depth]} />
        <meshStandardMaterial color={baseboardColor} />
      </mesh>
      <mesh position={[-half + MOULDING_THICKNESS / 2, ROOM_HEIGHT - MOULDING_HEIGHT / 2, centerZ]}>
        <boxGeometry args={[MOULDING_THICKNESS, MOULDING_HEIGHT, depth]} />
        <meshStandardMaterial color={trimColor} roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[half - MOULDING_THICKNESS / 2, ROOM_HEIGHT - MOULDING_HEIGHT / 2, centerZ]}>
        <boxGeometry args={[MOULDING_THICKNESS, MOULDING_HEIGHT, depth]} />
        <meshStandardMaterial color={trimColor} roughness={0.4} metalness={0.25} />
      </mesh>

      {/*
        LOBBY REMOVED (2026-08-13): the entire foyer - entrance facade,
        welcome posters, pillars, exhibit title/tagline posters, Museum
        Introduction + Gallery Directory walls, the mode-choice board,
        the profile welcome poster, reception furniture, and the two
        foyer point lights - used to render here. Preserved verbatim
        below, commented out, so it can be restored by uncommenting
        this block plus the matching imports/variables above.

        <DoorWall z={frontZ} facing={Math.PI} wallColor={wallColor} trimColor={trimColor} />

        <EntrancePoster
          position={[-frontPosterFlank, ROOM_HEIGHT / 2 - 0.1, frontZ - 0.05]}
          rotationY={Math.PI}
          eyebrow="Digital Museum"
          lines={["Tripti Agarwal", "Heritage Lab"]}
          highContrast={highContrast}
        />
        <EntrancePoster
          position={[frontPosterFlank, ROOM_HEIGHT / 2 - 0.1, frontZ - 0.05]}
          rotationY={Math.PI}
          eyebrow="Welcome"
          lines={["Every Collectible", "Tells a Story"]}
          highContrast={highContrast}
        />

        <Pillar x={-(DOOR_WIDTH / 2 + 0.6)} z={entryWallZ(0) + 1} pillarColor={PILLAR_COLOR} capColor={pillarCapColor} />
        <Pillar x={DOOR_WIDTH / 2 + 0.6} z={entryWallZ(0) + 1} pillarColor={PILLAR_COLOR} capColor={pillarCapColor} />

        {exhibitTitle && (
          <EntrancePoster
            position={[-half + 0.05, ROOM_HEIGHT / 2 - 0.1, taglinePosterZ]}
            rotationY={Math.PI / 2}
            eyebrow="Tripti Agarwal Heritage Lab"
            lines={["The Story Of", exhibitTitle]}
            highContrast={highContrast}
          />
        )}

        {exhibitTagline && (
          <EntrancePoster
            position={[half - 0.05, ROOM_HEIGHT / 2 - 0.1, taglinePosterZ]}
            rotationY={-Math.PI / 2}
            lines={[exhibitTagline]}
            highContrast={highContrast}
          />
        )}

        <MuseumIntroWall
          position={[-half + 0.05, ROOM_HEIGHT / 2, introDirectoryPosterZ]}
          rotationY={Math.PI / 2}
          highContrast={highContrast}
        />
        <GalleryDirectoryWall
          position={[half - 0.05, ROOM_HEIGHT / 2, introDirectoryPosterZ]}
          rotationY={-Math.PI / 2}
          rooms={rooms}
          highContrast={highContrast}
        />

        <ModeChoicePoster
          position={[half - 0.05, ROOM_HEIGHT / 2, modePosterZ]}
          rotationY={-Math.PI / 2}
          hasFeaturedSheets={hasFeaturedSheets}
          highContrast={highContrast}
          isTouch={isTouch}
        />
        <BackWallWelcomePoster
          position={[-half + 0.05, ROOM_HEIGHT / 2, welcomePosterZ]}
          rotationY={Math.PI / 2}
          profile={profile ?? null}
          highContrast={highContrast}
        />

        <LobbyBench position={LOBBY_BENCH_LEFT} rotationY={Math.PI} />
        <LobbyBench position={LOBBY_BENCH_RIGHT} rotationY={Math.PI} />
        <LobbySideTable position={LOBBY_TABLE} />
        <ReceptionCounter position={LOBBY_RECEPTION} rotationY={Math.PI} />

        <pointLight
          position={[0, ROOM_HEIGHT - 0.6, entryWallZ(0) + 1.2]}
          intensity={highContrast ? 1.6 : 1.3}
          color={highContrast ? "#ffffff" : "#ffdca8"}
          distance={8}
          decay={1.5}
        />

        <pointLight
          position={[0, ROOM_HEIGHT - 0.6, frontZ - 1]}
          intensity={highContrast ? 1.4 : 0.9}
          color={highContrast ? "#ffffff" : "#ffdca8"}
          distance={7}
          decay={1.5}
        />
      */}

      {rooms.map((_, i) => (
        <DoorWall key={"entry-" + i} z={entryWallZ(i)} facing={Math.PI} wallColor={wallColor} trimColor={trimColor} />
      ))}
      <DoorWall z={exitWallZ(numRooms - 1)} facing={0} wallColor={wallColor} trimColor={trimColor} />

      {/* Threshold plaques - one beside every doorway a visitor walks
          through, including the lobby's own entrance into Room 1 -
          replacing the previous mid-room floating title text so the
          destination is legible *before* committing to the doorway
          (Museum Navigation, section 3). */}
      {rooms.map((room, i) => (
        <ThresholdPlaque
          key={"threshold-" + i}
          position={[DOOR_WIDTH / 2 + 0.55, 2.1, entryWallZ(i) - 0.05]}
          rotationY={Math.PI}
          title={room.title}
          highContrast={highContrast}
        />
      ))}

      {placements.map((p) => (
        <RoomFrame
          key={p.sheet.id}
          sheet={p.sheet}
          position={[p.x, p.y, p.z]}
          rotationY={p.rotationY}
          highContrast={highContrast}
          simplified={isTouch}
        />
      ))}
    </group>
  );
}
