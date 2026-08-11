"use client";

import * as THREE from "three";
import { RoomFrame } from "@/components/museum/RoomFrame";
import { ArchwayFrame } from "@/components/museum-v2/ArchwayFrame";
import { WingArchSignage } from "@/components/museum-v2/WingArchSignage";
import { DOOR_WIDTH, ROOM_HEIGHT } from "@/lib/museum/roomConstants";
import {
  WALL_COLOR,
  CEILING_COLOR,
  FLOOR_COLOR,
  PILLAR_COLOR,
  MUSEUM_GOLD,
  HIGH_CONTRAST_WALL_COLOR,
  HIGH_CONTRAST_CEILING_COLOR,
  HIGH_CONTRAST_FLOOR_COLOR,
  HIGH_CONTRAST_TRIM,
} from "@/lib/museum/museumPalette";
import {
  HALL_HALF,
  LOBBY_HALF_W,
  wingLegs,
  exitArchPosition,
  getWingFramePlacements,
  type MuseumV2Wing,
  type WingLeg,
} from "@/lib/museum-v2/layout";

interface WingHallShellProps {
  wing: MuseumV2Wing;
  highContrast?: boolean;
  isTouch?: boolean;
}

function LegShell({
  leg,
  wallColor,
  ceilingColor,
  floorColor,
}: {
  leg: WingLeg;
  wallColor: string;
  ceilingColor: string;
  floorColor: string;
}) {
  const along = Math.abs(leg.to - leg.from);
  const centerAlong = (leg.from + leg.to) / 2;

  if (leg.axis === "z") {
    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[leg.fixed, 0, centerAlong]} userData={{ isWalkableFloor: true }}>
          <planeGeometry args={[HALL_HALF * 2, along]} />
          <meshStandardMaterial color={floorColor} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[leg.fixed, ROOM_HEIGHT, centerAlong]}>
          <planeGeometry args={[HALL_HALF * 2, along]} />
          <meshStandardMaterial color={ceilingColor} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[leg.fixed - HALL_HALF, ROOM_HEIGHT / 2, centerAlong]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[along, ROOM_HEIGHT]} />
          <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[leg.fixed + HALL_HALF, ROOM_HEIGHT / 2, centerAlong]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[along, ROOM_HEIGHT]} />
          <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[centerAlong, 0, leg.fixed]} userData={{ isWalkableFloor: true }}>
        <planeGeometry args={[along, HALL_HALF * 2]} />
        <meshStandardMaterial color={floorColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[centerAlong, ROOM_HEIGHT, leg.fixed]}>
        <planeGeometry args={[along, HALL_HALF * 2]} />
        <meshStandardMaterial color={ceilingColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[centerAlong, ROOM_HEIGHT / 2, leg.fixed - HALL_HALF]} rotation={[0, 0, 0]}>
        <planeGeometry args={[along, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[centerAlong, ROOM_HEIGHT / 2, leg.fixed + HALL_HALF]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[along, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function TurnPillar({ x, z, pillarColor, capColor }: { x: number; z: number; pillarColor: string; capColor: string }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, (ROOM_HEIGHT - 0.15) / 2, 0]}>
        <boxGeometry args={[0.5, ROOM_HEIGHT - 0.15, 0.5]} />
        <meshStandardMaterial color={pillarColor} />
      </mesh>
      <mesh position={[0, ROOM_HEIGHT - 0.15, 0]}>
        <boxGeometry args={[0.7, 0.3, 0.7]} />
        <meshStandardMaterial color={capColor} roughness={0.4} metalness={0.25} />
      </mesh>
    </group>
  );
}

/**
 * WingHallShell
 * museum-v2's single continuous gallery hall for one wing - a 3-leg
 * zigzag (north, east, south) holding all of that exhibit's sheets,
 * ending at an Exit arch that leads back to the lobby at a different
 * spot from where the visitor entered. Reuses RoomFrame (the existing
 * "MountedExhibitSheet") for every sheet, unmodified.
 */
export function WingHallShell({ wing, highContrast, isTouch }: WingHallShellProps) {
  const wallColor = highContrast ? HIGH_CONTRAST_WALL_COLOR : WALL_COLOR;
  const ceilingColor = highContrast ? HIGH_CONTRAST_CEILING_COLOR : CEILING_COLOR;
  const floorColor = highContrast ? HIGH_CONTRAST_FLOOR_COLOR : FLOOR_COLOR;
  const pillarCapColor = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;

  const legs = wingLegs(wing.index);
  const [legA, legB] = legs;
  const placements = getWingFramePlacements(wing);
  const exit = exitArchPosition(wing.index);

  const connectorWidth = exit[0] + HALL_HALF - (LOBBY_HALF_W - 1);
  const connectorCenterX = (exit[0] + HALL_HALF + (LOBBY_HALF_W - 1)) / 2;

  return (
    <group>
      {legs.map((leg, i) => (
        <LegShell key={i} leg={leg} wallColor={wallColor} ceilingColor={ceilingColor} floorColor={floorColor} />
      ))}

      {/* Open connector floor bridging leg C back to the lobby - no
          walls here (deliberately open), so a visitor stepping through
          the Exit arch immediately sees the reception/photo-wall area
          again, arriving at a different spot than they entered. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[connectorCenterX, 0, exit[2]]}
        userData={{ isWalkableFloor: true }}
      >
        <planeGeometry args={[connectorWidth, HALL_HALF * 2]} />
        <meshStandardMaterial color={floorColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[connectorCenterX, ROOM_HEIGHT, exit[2]]}>
        <planeGeometry args={[connectorWidth, HALL_HALF * 2]} />
        <meshStandardMaterial color={ceilingColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Exit threshold wall - a standalone segment (not contiguous
          with the lobby's own north wall) marking where leg C crosses
          back toward the lobby. */}
      <mesh position={[exit[0] - DOOR_WIDTH / 2 - 1.5, ROOM_HEIGHT / 2, exit[2]]}>
        <planeGeometry args={[3, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[exit[0] + DOOR_WIDTH / 2 + 1.5, ROOM_HEIGHT / 2, exit[2]]}>
        <planeGeometry args={[3, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>
      <ArchwayFrame position={exit} rotationY={Math.PI} highContrast={highContrast} />
      <WingArchSignage
        position={[exit[0] + DOOR_WIDTH / 2 + 0.7, 2.1, exit[2] - 0.05]}
        rotationY={Math.PI}
        eyebrow={"Exit - Wing " + (wing.index + 1)}
        title={wing.title}
        highContrast={highContrast}
      />

      {/* Turn pillars, doubling as the "subtle architectural break"
          between exhibit sections rather than a featureless corridor. */}
      <TurnPillar x={legA.fixed} z={legA.to} pillarColor={PILLAR_COLOR} capColor={pillarCapColor} />
      <TurnPillar x={legB.to} z={legB.fixed} pillarColor={PILLAR_COLOR} capColor={pillarCapColor} />

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
