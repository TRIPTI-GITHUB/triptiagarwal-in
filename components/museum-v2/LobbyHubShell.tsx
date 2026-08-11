"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { ArchwayFrame } from "@/components/museum-v2/ArchwayFrame";
import { WingArchSignage } from "@/components/museum-v2/WingArchSignage";
import { LobbyBench } from "@/components/museum/LobbyBench";
import { LobbySideTable } from "@/components/museum/LobbySideTable";
import { ReceptionCounter } from "@/components/museum/ReceptionCounter";
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
import { LOBBY_HALF_W, LOBBY_HALF_D, entryArchPosition, type MuseumV2Wing } from "@/lib/museum-v2/layout";
import type { LobbyPhoto } from "@/lib/supabase/database.types";

interface LobbyHubShellProps {
  wings: MuseumV2Wing[];
  lobbyPhotos: LobbyPhoto[] | null;
  highContrast?: boolean;
}

function PhotoFrame({ photo, position }: { photo: LobbyPhoto; position: [number, number, number] }) {
  const texture = useTexture(photo.url);
  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[2.2, 1.6]} />
        <meshStandardMaterial color={MUSEUM_GOLD} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[2.0, 1.4]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

/**
 * LobbyHubShell
 * museum-v2's reception lobby - a ~20x20 room (distinct from the
 * existing museum's Lobby/RoomsShell, which this route never imports
 * or modifies). North wall carries one Entry arch per wing (gapped and
 * signed); west wall carries the photo wall; south/east walls are
 * plain. Reuses the existing, generic lobby furniture components
 * as-is.
 */
export function LobbyHubShell({ wings, lobbyPhotos, highContrast }: LobbyHubShellProps) {
  const wallColor = highContrast ? HIGH_CONTRAST_WALL_COLOR : WALL_COLOR;
  const ceilingColor = highContrast ? HIGH_CONTRAST_CEILING_COLOR : CEILING_COLOR;
  const floorColor = highContrast ? HIGH_CONTRAST_FLOOR_COLOR : FLOOR_COLOR;
  const pillarCapColor = highContrast ? HIGH_CONTRAST_TRIM : MUSEUM_GOLD;

  const entryXs = wings.map((w) => entryArchPosition(w.index)[0]).sort((a, b) => a - b);
  const northSegments: { start: number; end: number }[] = [];
  let cursor = -LOBBY_HALF_W;
  for (const gx of entryXs) {
    northSegments.push({ start: cursor, end: gx - DOOR_WIDTH / 2 });
    cursor = gx + DOOR_WIDTH / 2;
  }
  northSegments.push({ start: cursor, end: LOBBY_HALF_W });

  const photos = (lobbyPhotos ?? []).slice(0, 4).sort((a, b) => a.position - b.position);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} userData={{ isWalkableFloor: true }}>
        <planeGeometry args={[LOBBY_HALF_W * 2, LOBBY_HALF_D * 2]} />
        <meshStandardMaterial color={floorColor} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, 0]}>
        <planeGeometry args={[LOBBY_HALF_W * 2, LOBBY_HALF_D * 2]} />
        <meshStandardMaterial color={ceilingColor} side={THREE.DoubleSide} />
      </mesh>

      {/* North wall - segmented around each wing's Entry arch */}
      {northSegments
        .filter((s) => s.end > s.start)
        .map((s, i) => (
          <mesh key={"north-" + i} position={[(s.start + s.end) / 2, ROOM_HEIGHT / 2, -LOBBY_HALF_D]}>
            <planeGeometry args={[s.end - s.start, ROOM_HEIGHT]} />
            <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
          </mesh>
        ))}

      {/* West wall (photo wall) */}
      <mesh position={[-LOBBY_HALF_W, ROOM_HEIGHT / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[LOBBY_HALF_D * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>

      {/* East wall */}
      <mesh position={[LOBBY_HALF_W, ROOM_HEIGHT / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[LOBBY_HALF_D * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>

      {/* South wall (behind the spawn point) */}
      <mesh position={[0, ROOM_HEIGHT / 2, LOBBY_HALF_D]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[LOBBY_HALF_W * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
      </mesh>

      {wings.map((wing) => {
        const entry = entryArchPosition(wing.index);
        return (
          <group key={"entry-" + wing.index}>
            <ArchwayFrame position={entry} rotationY={0} highContrast={highContrast} />
            <WingArchSignage
              position={[entry[0] + DOOR_WIDTH / 2 + 0.7, 2.1, entry[2] + 0.05]}
              rotationY={0}
              eyebrow={"Entry - Wing " + (wing.index + 1)}
              title={wing.title}
              highContrast={highContrast}
            />
          </group>
        );
      })}

      {photos.length > 0 && (
        <Suspense fallback={null}>
          {photos.map((photo, i) => (
            <PhotoFrame key={photo.url + i} photo={photo} position={[-LOBBY_HALF_W + 0.05, 1.8, [-6, -2, 2, 6][i] ?? 0]} />
          ))}
        </Suspense>
      )}

      {/* Two pillars flanking the walk path (not one centered pillar
          blocking it - that was an earlier bug: a single pillar at x=0
          sat directly in the spawn's forward sightline). */}
      {[-3, 3].map((x) => (
        <group key={"lobby-pillar-" + x}>
          <mesh position={[x, ROOM_HEIGHT - 0.15, LOBBY_HALF_D - 3]}>
            <boxGeometry args={[0.5, 0.3, 0.7]} />
            <meshStandardMaterial color={pillarCapColor} roughness={0.4} metalness={0.25} />
          </mesh>
          <mesh position={[x, (ROOM_HEIGHT - 0.15) / 2, LOBBY_HALF_D - 3]}>
            <boxGeometry args={[0.5, ROOM_HEIGHT - 0.15, 0.5]} />
            <meshStandardMaterial color={PILLAR_COLOR} />
          </mesh>
        </group>
      ))}

      <LobbyBench position={[-6, 0, LOBBY_HALF_D - 3.5]} rotationY={Math.PI} />
      <LobbyBench position={[6, 0, LOBBY_HALF_D - 3.5]} rotationY={Math.PI} />
      <LobbySideTable position={[7.5, 0, LOBBY_HALF_D - 3.5]} />
      <ReceptionCounter position={[-LOBBY_HALF_W + 3.5, 0, LOBBY_HALF_D - 1.5]} rotationY={Math.PI} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, LOBBY_HALF_D - 3.5]}>
        <planeGeometry args={[DOOR_WIDTH + 1.5, 2.5]} />
        <meshStandardMaterial color={highContrast ? "#5A1F1F" : "#6E2424"} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
