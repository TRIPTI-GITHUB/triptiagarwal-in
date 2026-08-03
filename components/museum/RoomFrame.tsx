"use client";

import { Suspense } from "react";
import { useTexture } from "@react-three/drei";
import { FRAME_WIDTH, FRAME_HEIGHT } from "@/lib/museum/roomConstants";
import type { ExhibitSheet } from "@/lib/supabase/database.types";

interface RoomFrameArtworkProps {
  sheet: ExhibitSheet;
}

function RoomFrameArtwork({ sheet }: RoomFrameArtworkProps) {
  const texture = useTexture(sheet.image_url);
  return (
    <mesh position={[0, 0, 0.02]} userData={{ isExhibitFrame: true, sheet: sheet }}>
      <planeGeometry args={[FRAME_WIDTH - 0.15, FRAME_HEIGHT - 0.15]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

interface RoomFrameProps {
  sheet: ExhibitSheet;
  position: [number, number, number];
  rotationY: number;
}

/**
 * RoomFrame
 * A single mounted exhibit sheet. Both the gold backing panel and the
 * artwork mesh carry userData.isExhibitFrame + the sheet record - this
 * is what the click/tap-to-select raycasting in RoomFreeRoam and
 * RoomMobileRig reads to identify which sheet was selected, and
 * tagging the backing panel too means a click still works even before
 * the image texture has finished loading.
 */
export function RoomFrame({ sheet, position, rotationY }: RoomFrameProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh userData={{ isExhibitFrame: true, sheet: sheet }}>
        <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
        <meshStandardMaterial color="#b08d57" />
      </mesh>
      <Suspense fallback={null}>
        <RoomFrameArtwork sheet={sheet} />
      </Suspense>
    </group>
  );
}