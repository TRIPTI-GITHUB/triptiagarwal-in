"use client";

import { Suspense } from "react";
import { useTexture } from "@react-three/drei";
import {
  WALL_OFFSET,
  SHEET_SPACING,
  ROOM_HEIGHT,
  FRAME_Y,
  FRAME_WIDTH,
  FRAME_HEIGHT,
} from "@/lib/museum/constants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface SheetArtworkProps {
  sheet: ExhibitSheet;
  onSelect: (sheet: ExhibitSheet) => void;
}

function SheetArtwork({ sheet, onSelect }: SheetArtworkProps) {
  const texture = useTexture(sheet.image_url);

  return (
    <mesh
      position={[0, 0, 0.02]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(sheet);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      <planeGeometry args={[FRAME_WIDTH - 0.15, FRAME_HEIGHT - 0.15]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

interface SheetFrameProps {
  sheet: ExhibitSheet;
  z: number;
  onSelect: (sheet: ExhibitSheet) => void;
}

function SheetFrame({ sheet, z, onSelect }: SheetFrameProps) {
  return (
    <group position={[-WALL_OFFSET + 0.05, FRAME_Y, z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
        <meshStandardMaterial color="#b08d57" />
      </mesh>
      <Suspense fallback={null}>
        <SheetArtwork sheet={sheet} onSelect={onSelect} />
      </Suspense>
    </group>
  );
}

interface GalleryWallProps {
  sheets: ExhibitSheet[];
  onSelect: (sheet: ExhibitSheet) => void;
}

/**
 * GalleryWall
 * Renders the corridor shell (floor, ceiling, both walls, entrance
 * and end caps), sized to fit every sheet, plus one wall-mounted
 * frame per sheet, evenly spaced. Clicking a frame calls onSelect -
 * handled by react-three-fiber's built-in pointer events (onClick
 * directly on the mesh), which is far more reliable than manually
 * raycasting from a hidden crosshair, as the earlier free-roam
 * version required.
 */
export function GalleryWall({ sheets, onSelect }: GalleryWallProps) {
  const numSheets = sheets.length;
  const frontZ = SHEET_SPACING;
  const backZ = -(numSheets - 1) * SHEET_SPACING - SHEET_SPACING / 2;
  const corridorLength = frontZ - backZ;
  const centerZ = (frontZ + backZ) / 2;
  const corridorWidth = WALL_OFFSET * 2;

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]}>
        <planeGeometry args={[corridorWidth, corridorLength]} />
        <meshStandardMaterial color="#3a3226" />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, centerZ]}>
        <planeGeometry args={[corridorWidth, corridorLength]} />
        <meshStandardMaterial color="#f5f0e6" />
      </mesh>

      <mesh position={[-WALL_OFFSET, ROOM_HEIGHT / 2, centerZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[corridorLength, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      <mesh position={[WALL_OFFSET, ROOM_HEIGHT / 2, centerZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[corridorLength, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT / 2, frontZ]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[corridorWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      <mesh position={[0, ROOM_HEIGHT / 2, backZ]}>
        <planeGeometry args={[corridorWidth, ROOM_HEIGHT]} />
        <meshStandardMaterial color="#e8e2d5" />
      </mesh>

      {sheets.map((sheet, i) => (
        <SheetFrame key={sheet.id} sheet={sheet} z={-i * SHEET_SPACING} onSelect={onSelect} />
      ))}
    </group>
  );
}